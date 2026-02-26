---
name: "Azure Function Scaffold"
description: "Generate a new Azure Function following Saga project conventions"
---

# Azure Function Scaffold Skill

Creates a new Azure Function (v4 Node.js 22) following Saga project conventions.

## File Location

All functions go in `saga.backend/src/functions/<functionName>.ts` — one function per file.

## HTTP Function Template

```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions'

interface RequestBody {
  // Define typed request body
}

interface ResponseBody {
  // Define typed response body
}

async function functionName(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Processing ${request.method} request to ${request.url}`)

  try {
    // Parse and validate request body (for POST/PATCH)
    let body: RequestBody
    try {
      body = (await request.json()) as RequestBody
    } catch {
      return { status: 400, jsonBody: { error: 'Invalid JSON body' } }
    }

    // Validate required fields
    if (!body.requiredField) {
      return { status: 400, jsonBody: { error: 'Missing required field: requiredField' } }
    }

    // Business logic here
    const result: ResponseBody = {
      // ...
    }

    return { status: 200, jsonBody: result }
  } catch (error) {
    context.error('Function failed:', error)
    return { status: 500, jsonBody: { error: 'Internal server error' } }
  }
}

app.http('functionName', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'endpoint/path',
  handler: functionName,
})
```

## Table Storage Access Pattern

```typescript
import { getTableClient } from '../services/tableStorage'

const client = getTableClient()

// Query by partition key and row key prefix
const entities = client.listEntities({
  queryOptions: {
    filter: `PartitionKey eq 'User_${userId}' and RowKey ge 'BOOK_' and RowKey lt 'BOOK_~'`,
  },
})
```

## Route Patterns

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/books` | Create book |
| `GET` | `/api/books/{bookId}` | Get book |
| `GET` | `/api/books` | List books |
| `PATCH` | `/api/books/{bookId}` | Update book |
| `DELETE` | `/api/books/{bookId}` | Delete book |
| `POST` | `/api/books/{bookId}/generate` | Generate page with AI |

## Checklist

- [ ] Function in its own file under `src/functions/`
- [ ] Uses v4 programming model (`app.http()`)
- [ ] Typed request/response interfaces (no `any`)
- [ ] Proper HTTP status codes (200, 201, 400, 401, 404, 500)
- [ ] Error handling with try/catch
- [ ] Logging via `context.log` / `context.error`
- [ ] Uses `DefaultAzureCredential` (not connection strings)
- [ ] Types exported from `src/types/entities.ts` if shared
