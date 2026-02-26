import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { getSagaTableClient } from '../services/tableStorage.js'
import {
  makePartitionKey,
  makeRowKey,
  type WorldRuleEntity,
  type CreateWorldRuleRequest,
  type UpdateWorldRuleRequest,
  type WorldRuleResponse,
} from '../types/entities.js'

function toResponse(entity: WorldRuleEntity, bookId: string): WorldRuleResponse {
  const parts = entity.rowKey.split('_')
  return {
    ruleId: parts.slice(2).join('_'),
    bookId,
    title: entity.title,
    description: entity.description,
  }
}

async function listWorldRules(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const prefix = `RULE_${bookId}_`

    const rules: WorldRuleResponse[] = []
    const entities = client.listEntities<WorldRuleEntity>({
      queryOptions: {
        filter: `PartitionKey eq '${pk}' and RowKey ge '${prefix}' and RowKey lt '${prefix}~'`,
      },
    })

    for await (const entity of entities) {
      rules.push(toResponse(entity as WorldRuleEntity, bookId))
    }

    return { status: 200, jsonBody: rules }
  } catch (error) {
    context.error('Failed to list world rules:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function createWorldRule(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const body = (await request.json()) as CreateWorldRuleRequest
    const client = getSagaTableClient()

    const ruleId = crypto.randomUUID()

    const entity: WorldRuleEntity = {
      partitionKey: makePartitionKey(userId),
      rowKey: makeRowKey('RULE', bookId, ruleId),
      title: body.title,
      description: body.description,
    }

    await client.createEntity(entity)
    return { status: 201, jsonBody: toResponse(entity, bookId) }
  } catch (error) {
    context.error('Failed to create world rule:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function updateWorldRule(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const ruleId = request.params.ruleId || ''
    const body = (await request.json()) as UpdateWorldRuleRequest
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const rk = makeRowKey('RULE', bookId, ruleId)

    try {
      await client.getEntity(pk, rk)
    } catch {
      return { status: 404, jsonBody: { error: 'World rule not found' } }
    }

    await client.updateEntity({ partitionKey: pk, rowKey: rk, ...body }, 'Merge')

    const updated = await client.getEntity<WorldRuleEntity>(pk, rk)
    return { status: 200, jsonBody: toResponse(updated as WorldRuleEntity, bookId) }
  } catch (error) {
    context.error('Failed to update world rule:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function deleteWorldRule(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const ruleId = request.params.ruleId || ''
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const rk = makeRowKey('RULE', bookId, ruleId)

    try {
      await client.deleteEntity(pk, rk)
      return { status: 204 }
    } catch {
      return { status: 404, jsonBody: { error: 'World rule not found' } }
    }
  } catch (error) {
    context.error('Failed to delete world rule:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

app.http('listWorldRules', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/rules',
  handler: listWorldRules,
})

app.http('createWorldRule', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/rules',
  handler: createWorldRule,
})

app.http('updateWorldRule', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/rules/{ruleId}',
  handler: updateWorldRule,
})

app.http('deleteWorldRule', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/rules/{ruleId}',
  handler: deleteWorldRule,
})
