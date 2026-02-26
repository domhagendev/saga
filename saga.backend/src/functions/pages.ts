import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { getSagaTableClient } from '../services/tableStorage.js'
import { getFlashModel } from '../services/gemini.js'
import { buildPagePrompt, buildSummaryUpdatePrompt } from '../services/promptBuilder.js'
import { chunkContent, reassembleContent } from '../utils/chunking.js'
import { extractHashtags, stripHashtags } from '../utils/hashtag.js'
import {
  makePartitionKey,
  makeRowKey,
  type PageEntity,
  type CharacterEntity,
  type LocationEntity,
  type WorldRuleEntity,
  type BookEntity,
  type SummaryEntity,
  type GeneratePageRequest,
  type UpdatePageRequest,
  type PageResponse,
} from '../types/entities.js'

function toResponse(entity: PageEntity, bookId: string): PageResponse {
  const parts = entity.rowKey.split('_')
  return {
    bookId,
    pageNr: parseInt(parts[2], 10),
    content: reassembleContent(entity),
    userNote: entity.userNote,
    targetMood: entity.targetMood,
    orderIndex: entity.orderIndex,
  }
}

async function listPages(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const prefix = `PAGE_${bookId}_`

    const pages: PageResponse[] = []
    const entities = client.listEntities<PageEntity>({
      queryOptions: {
        filter: `PartitionKey eq '${pk}' and RowKey ge '${prefix}' and RowKey lt '${prefix}~'`,
      },
    })

    for await (const entity of entities) {
      pages.push(toResponse(entity as PageEntity, bookId))
    }

    pages.sort((a, b) => a.orderIndex - b.orderIndex)
    return { status: 200, jsonBody: pages }
  } catch (error) {
    context.error('Failed to list pages:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function generatePage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const body = (await request.json()) as GeneratePageRequest
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)

    // Fetch book metadata
    const book = await client.getEntity<BookEntity>(pk, makeRowKey('BOOK', bookId))

    // Fetch all world-building entities
    const [characters, locations, worldRules] = await Promise.all([
      fetchEntities<CharacterEntity>(pk, `CHAR_${bookId}_`),
      fetchEntities<LocationEntity>(pk, `LOC_${bookId}_`),
      fetchEntities<WorldRuleEntity>(pk, `RULE_${bookId}_`),
    ])

    // Fetch summary
    let summary: SummaryEntity | null = null
    try {
      summary = (await client.getEntity<SummaryEntity>(
        pk,
        makeRowKey('SUM', bookId)
      )) as SummaryEntity
    } catch {
      // No summary yet — first page
    }

    // Fetch existing pages for last-2 window
    const existingPages = await fetchEntities<PageEntity>(pk, `PAGE_${bookId}_`)
    existingPages.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    const lastTwoPages = existingPages.slice(-2)

    // Extract hashtag mentions from user text
    const hashtags = extractHashtags(body.userNote)

    // Collect mentioned entity names from both hashtags and frontend-provided IDs
    const mentionedNames: string[] = []
    const seenNames = new Set<string>()

    // 1. Match hashtag text to entity names
    for (const tag of hashtags) {
      const matchedChar = characters.find(
        (c) => c.name.toLowerCase() === tag.toLowerCase()
      )
      if (matchedChar && !seenNames.has(matchedChar.name)) {
        mentionedNames.push(matchedChar.name)
        seenNames.add(matchedChar.name)
      }

      const matchedLoc = locations.find(
        (l) => l.name.replace(/\s/g, '').toLowerCase() === tag.toLowerCase()
      )
      if (matchedLoc && !seenNames.has(matchedLoc.name)) {
        mentionedNames.push(matchedLoc.name)
        seenNames.add(matchedLoc.name)
      }
    }

    // 2. Resolve frontend-provided entity IDs to names
    if (body.mentionedEntities && body.mentionedEntities.length > 0) {
      for (const entityId of body.mentionedEntities) {
        const charMatch = characters.find((c) => {
          const parts = c.rowKey.split('_')
          return parts[parts.length - 1] === entityId
        })
        if (charMatch && !seenNames.has(charMatch.name)) {
          mentionedNames.push(charMatch.name)
          seenNames.add(charMatch.name)
        }

        const locMatch = locations.find((l) => {
          const parts = l.rowKey.split('_')
          return parts[parts.length - 1] === entityId
        })
        if (locMatch && !seenNames.has(locMatch.name)) {
          mentionedNames.push(locMatch.name)
          seenNames.add(locMatch.name)
        }
      }
    }

    // Build prompt
    const prompt = buildPagePrompt({
      worldRules: worldRules as WorldRuleEntity[],
      characters: characters as CharacterEntity[],
      locations: locations as LocationEntity[],
      summary,
      lastTwoPages: lastTwoPages as PageEntity[],
      userNote: stripHashtags(body.userNote),
      targetMood: body.targetMood,
      mentionedEntityNames: mentionedNames,
      globalGenre: (book as BookEntity).globalGenre,
      globalMood: (book as BookEntity).globalMood,
    })

    // Generate with Gemini Flash
    const model = getFlashModel()
    const result = await model.generateContent({
      systemInstruction: prompt.systemInstruction,
      contents: [{ role: 'user', parts: [{ text: prompt.userMessage }] }],
    })

    const generatedText = result.response.text()
    const nextPageNr = existingPages.length + 1

    // Chunk and store the page
    const chunks = chunkContent(generatedText)
    const pageEntity: PageEntity = {
      partitionKey: pk,
      rowKey: makeRowKey('PAGE', bookId, String(nextPageNr).padStart(5, '0')),
      userNote: body.userNote,
      targetMood: body.targetMood,
      orderIndex: nextPageNr,
      ...chunks,
    }

    await client.createEntity(pageEntity)

    // Update rolling summary in background
    updateRollingSummary(pk, bookId, summary, generatedText, nextPageNr, context).catch(
      (err) => context.error('Failed to update summary:', err)
    )

    return {
      status: 201,
      jsonBody: toResponse(pageEntity, bookId),
    }
  } catch (error: unknown) {
    context.error('Failed to generate page:', error)

    // Surface Gemini quota/rate-limit errors to the client
    const errMsg = error instanceof Error ? error.message : String(error)
    if (errMsg.includes('429') || errMsg.includes('quota')) {
      return { status: 429, jsonBody: { error: 'AI quota exceeded. Please try again later.' } }
    }

    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function updatePage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const pageNr = request.params.pageNr || ''
    const body = (await request.json()) as UpdatePageRequest
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const rk = makeRowKey('PAGE', bookId, pageNr.padStart(5, '0'))

    try {
      await client.getEntity(pk, rk)
    } catch {
      return { status: 404, jsonBody: { error: 'Page not found' } }
    }

    const updateData: { partitionKey: string; rowKey: string; [key: string]: unknown } = {
      partitionKey: pk,
      rowKey: rk,
    }

    if (body.content !== undefined) {
      Object.assign(updateData, chunkContent(body.content))
    }
    if (body.userNote !== undefined) updateData.userNote = body.userNote
    if (body.targetMood !== undefined) updateData.targetMood = body.targetMood

    await client.updateEntity(updateData, 'Merge')

    const updated = await client.getEntity<PageEntity>(pk, rk)
    return { status: 200, jsonBody: toResponse(updated as PageEntity, bookId) }
  } catch (error) {
    context.error('Failed to update page:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function deletePage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const pageNr = request.params.pageNr || ''
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const rk = makeRowKey('PAGE', bookId, pageNr.padStart(5, '0'))

    try {
      await client.deleteEntity(pk, rk)
      return { status: 204 }
    } catch {
      return { status: 404, jsonBody: { error: 'Page not found' } }
    }
  } catch (error) {
    context.error('Failed to delete page:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

// ─── Helpers ───

async function fetchEntities<T>(pk: string, prefix: string): Promise<T[]> {
  const client = getSagaTableClient()
  const results: T[] = []
  const entities = client.listEntities({
    queryOptions: {
      filter: `PartitionKey eq '${pk}' and RowKey ge '${prefix}' and RowKey lt '${prefix}~'`,
    },
  })

  for await (const entity of entities) {
    results.push(entity as T)
  }
  return results
}

async function updateRollingSummary(
  pk: string,
  bookId: string,
  existingSummary: SummaryEntity | null,
  newPageContent: string,
  pageIndex: number,
  context: InvocationContext
): Promise<void> {
  const model = getFlashModel()
  const prompt = buildSummaryUpdatePrompt(
    existingSummary?.rollingSummary ?? '',
    newPageContent,
    pageIndex
  )

  const result = await model.generateContent({
    systemInstruction: prompt.systemInstruction,
    contents: [{ role: 'user', parts: [{ text: prompt.userMessage }] }],
  })

  const updatedSummary = result.response.text()
  const client = getSagaTableClient()
  const rk = makeRowKey('SUM', bookId)

  const summaryEntity = {
    partitionKey: pk,
    rowKey: rk,
    rollingSummary: updatedSummary,
    lastPageIndex: pageIndex,
  }

  if (existingSummary) {
    await client.updateEntity(summaryEntity, 'Replace')
  } else {
    await client.createEntity(summaryEntity)
  }

  context.log(`Rolling summary updated for book ${bookId}, page ${pageIndex}`)
}

// ─── Route Registration ───

app.http('listPages', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/pages',
  handler: listPages,
})

app.http('generatePage', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/pages/generate',
  handler: generatePage,
})

app.http('updatePage', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/pages/{pageNr}',
  handler: updatePage,
})

app.http('deletePage', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/pages/{pageNr}',
  handler: deletePage,
})
