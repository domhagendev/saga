import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { getSagaTableClient } from '../services/tableStorage.js'
import {
  makePartitionKey,
  makeRowKey,
  type CharacterEntity,
  type CreateCharacterRequest,
  type UpdateCharacterRequest,
  type CharacterResponse,
} from '../types/entities.js'

function toResponse(entity: CharacterEntity, bookId: string): CharacterResponse {
  const parts = entity.rowKey.split('_')
  return {
    charId: parts.slice(2).join('_'),
    bookId,
    name: entity.name,
    description: entity.description,
    traits: entity.traits,
    motivation: entity.motivation,
    isActive: entity.isActive,
  }
}

async function listCharacters(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const prefix = `CHAR_${bookId}_`

    const characters: CharacterResponse[] = []
    const entities = client.listEntities<CharacterEntity>({
      queryOptions: {
        filter: `PartitionKey eq '${pk}' and RowKey ge '${prefix}' and RowKey lt '${prefix}~'`,
      },
    })

    for await (const entity of entities) {
      characters.push(toResponse(entity as CharacterEntity, bookId))
    }

    return { status: 200, jsonBody: characters }
  } catch (error) {
    context.error('Failed to list characters:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function createCharacter(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const body = (await request.json()) as CreateCharacterRequest
    const client = getSagaTableClient()

    const charId = crypto.randomUUID()

    const entity: CharacterEntity = {
      partitionKey: makePartitionKey(userId),
      rowKey: makeRowKey('CHAR', bookId, charId),
      name: body.name,
      description: body.description,
      traits: body.traits,
      motivation: body.motivation,
      isActive: body.isActive ?? true,
    }

    await client.createEntity(entity)
    return { status: 201, jsonBody: toResponse(entity, bookId) }
  } catch (error) {
    context.error('Failed to create character:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function updateCharacter(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const charId = request.params.charId || ''
    const body = (await request.json()) as UpdateCharacterRequest
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const rk = makeRowKey('CHAR', bookId, charId)

    try {
      await client.getEntity(pk, rk)
    } catch {
      return { status: 404, jsonBody: { error: 'Character not found' } }
    }

    await client.updateEntity({ partitionKey: pk, rowKey: rk, ...body }, 'Merge')

    const updated = await client.getEntity<CharacterEntity>(pk, rk)
    return { status: 200, jsonBody: toResponse(updated as CharacterEntity, bookId) }
  } catch (error) {
    context.error('Failed to update character:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function deleteCharacter(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const charId = request.params.charId || ''
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const rk = makeRowKey('CHAR', bookId, charId)

    try {
      await client.deleteEntity(pk, rk)
      return { status: 204 }
    } catch {
      return { status: 404, jsonBody: { error: 'Character not found' } }
    }
  } catch (error) {
    context.error('Failed to delete character:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

app.http('listCharacters', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/characters',
  handler: listCharacters,
})

app.http('createCharacter', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/characters',
  handler: createCharacter,
})

app.http('updateCharacter', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/characters/{charId}',
  handler: updateCharacter,
})

app.http('deleteCharacter', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/characters/{charId}',
  handler: deleteCharacter,
})
