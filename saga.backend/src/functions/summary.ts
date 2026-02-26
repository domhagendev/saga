import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { getSagaTableClient } from '../services/tableStorage.js'
import {
  makePartitionKey,
  makeRowKey,
  type SummaryEntity,
  type SummaryResponse,
} from '../types/entities.js'

function toResponse(entity: SummaryEntity, bookId: string): SummaryResponse {
  return {
    bookId,
    rollingSummary: entity.rollingSummary,
    lastPageIndex: entity.lastPageIndex,
  }
}

async function getSummary(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const client = getSagaTableClient()

    try {
      const entity = await client.getEntity<SummaryEntity>(
        makePartitionKey(userId),
        makeRowKey('SUM', bookId)
      )
      return { status: 200, jsonBody: toResponse(entity as SummaryEntity, bookId) }
    } catch {
      return {
        status: 200,
        jsonBody: { bookId, rollingSummary: '', lastPageIndex: 0 },
      }
    }
  } catch (error) {
    context.error('Failed to get summary:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

app.http('getSummary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/summary',
  handler: getSummary,
})
