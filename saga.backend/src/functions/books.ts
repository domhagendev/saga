import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { getSagaTableClient } from '../services/tableStorage.js'
import {
  makePartitionKey,
  makeRowKey,
  type BookEntity,
  type CreateBookRequest,
  type UpdateBookRequest,
  type BookResponse,
} from '../types/entities.js'

function toResponse(entity: BookEntity): BookResponse {
  const parts = entity.rowKey.split('_')
  return {
    bookId: parts.slice(1).join('_'),
    title: entity.title,
    globalGenre: entity.globalGenre,
    globalMood: entity.globalMood,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  }
}

async function listBooks(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // userId extracted from auth token in production; placeholder for now
    const userId = request.headers.get('x-user-id') || ''
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)

    const books: BookResponse[] = []
    const entities = client.listEntities<BookEntity>({
      queryOptions: {
        filter: `PartitionKey eq '${pk}' and RowKey ge 'BOOK_' and RowKey lt 'BOOK_~'`,
      },
    })

    for await (const entity of entities) {
      books.push(toResponse(entity as BookEntity))
    }

    return { status: 200, jsonBody: books }
  } catch (error) {
    context.error('Failed to list books:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function getBook(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const client = getSagaTableClient()

    try {
      const entity = await client.getEntity<BookEntity>(
        makePartitionKey(userId),
        makeRowKey('BOOK', bookId)
      )
      return { status: 200, jsonBody: toResponse(entity as BookEntity) }
    } catch {
      return { status: 404, jsonBody: { error: 'Book not found' } }
    }
  } catch (error) {
    context.error('Failed to get book:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function createBook(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const body = (await request.json()) as CreateBookRequest
    const client = getSagaTableClient()

    const bookId = crypto.randomUUID()
    const now = new Date().toISOString()

    const entity: BookEntity = {
      partitionKey: makePartitionKey(userId),
      rowKey: makeRowKey('BOOK', bookId),
      title: body.title,
      globalGenre: body.globalGenre,
      globalMood: body.globalMood,
      createdAt: now,
      updatedAt: now,
    }

    await client.createEntity(entity)
    return { status: 201, jsonBody: toResponse(entity) }
  } catch (error) {
    context.error('Failed to create book:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function updateBook(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const body = (await request.json()) as UpdateBookRequest
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const rk = makeRowKey('BOOK', bookId)

    try {
      await client.getEntity(pk, rk)
    } catch {
      return { status: 404, jsonBody: { error: 'Book not found' } }
    }

    const updateData = {
      partitionKey: pk,
      rowKey: rk,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    await client.updateEntity(updateData, 'Merge')

    const updated = await client.getEntity<BookEntity>(pk, rk)
    return { status: 200, jsonBody: toResponse(updated as BookEntity) }
  } catch (error) {
    context.error('Failed to update book:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function deleteBook(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const rk = makeRowKey('BOOK', bookId)

    try {
      await client.deleteEntity(pk, rk)
      return { status: 204 }
    } catch {
      return { status: 404, jsonBody: { error: 'Book not found' } }
    }
  } catch (error) {
    context.error('Failed to delete book:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

app.http('listBooks', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'books',
  handler: listBooks,
})

app.http('getBook', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'books/{bookId}',
  handler: getBook,
})

app.http('createBook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'books',
  handler: createBook,
})

app.http('updateBook', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'books/{bookId}',
  handler: updateBook,
})

app.http('deleteBook', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'books/{bookId}',
  handler: deleteBook,
})
