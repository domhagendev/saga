import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'
import { getSagaTableClient } from '../services/tableStorage.js'
import {
  makePartitionKey,
  makeRowKey,
  type LocationEntity,
  type CreateLocationRequest,
  type UpdateLocationRequest,
  type LocationResponse,
} from '../types/entities.js'

function toResponse(entity: LocationEntity, bookId: string): LocationResponse {
  const parts = entity.rowKey.split('_')
  return {
    locId: parts.slice(2).join('_'),
    bookId,
    name: entity.name,
    description: entity.description,
    atmosphere: entity.atmosphere,
  }
}

async function listLocations(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const prefix = `LOC_${bookId}_`

    const locations: LocationResponse[] = []
    const entities = client.listEntities<LocationEntity>({
      queryOptions: {
        filter: `PartitionKey eq '${pk}' and RowKey ge '${prefix}' and RowKey lt '${prefix}~'`,
      },
    })

    for await (const entity of entities) {
      locations.push(toResponse(entity as LocationEntity, bookId))
    }

    return { status: 200, jsonBody: locations }
  } catch (error) {
    context.error('Failed to list locations:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function createLocation(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const body = (await request.json()) as CreateLocationRequest
    const client = getSagaTableClient()

    const locId = crypto.randomUUID()

    const entity: LocationEntity = {
      partitionKey: makePartitionKey(userId),
      rowKey: makeRowKey('LOC', bookId, locId),
      name: body.name,
      description: body.description,
      atmosphere: body.atmosphere,
    }

    await client.createEntity(entity)
    return { status: 201, jsonBody: toResponse(entity, bookId) }
  } catch (error) {
    context.error('Failed to create location:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function updateLocation(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const locId = request.params.locId || ''
    const body = (await request.json()) as UpdateLocationRequest
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const rk = makeRowKey('LOC', bookId, locId)

    try {
      await client.getEntity(pk, rk)
    } catch {
      return { status: 404, jsonBody: { error: 'Location not found' } }
    }

    await client.updateEntity({ partitionKey: pk, rowKey: rk, ...body }, 'Merge')

    const updated = await client.getEntity<LocationEntity>(pk, rk)
    return { status: 200, jsonBody: toResponse(updated as LocationEntity, bookId) }
  } catch (error) {
    context.error('Failed to update location:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

async function deleteLocation(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.headers.get('x-user-id') || ''
    const bookId = request.params.bookId || ''
    const locId = request.params.locId || ''
    const client = getSagaTableClient()
    const pk = makePartitionKey(userId)
    const rk = makeRowKey('LOC', bookId, locId)

    try {
      await client.deleteEntity(pk, rk)
      return { status: 204 }
    } catch {
      return { status: 404, jsonBody: { error: 'Location not found' } }
    }
  } catch (error) {
    context.error('Failed to delete location:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

app.http('listLocations', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/locations',
  handler: listLocations,
})

app.http('createLocation', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/locations',
  handler: createLocation,
})

app.http('updateLocation', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/locations/{locId}',
  handler: updateLocation,
})

app.http('deleteLocation', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'books/{bookId}/locations/{locId}',
  handler: deleteLocation,
})
