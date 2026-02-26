---
name: "Table Storage CRUD"
description: "Generate Azure Table Storage CRUD operations for Saga story entities"
---

# Table Storage CRUD Skill

Generates Azure Table Storage CRUD operations for the Saga project's single-table design.

## Table Design: `SagaEntities`

All story data lives in one table with `PartitionKey = User_{UserId}`.

| Entity Type | RowKey Pattern | Key Properties |
|---|---|---|
| **Book** | `BOOK_{BookId}` | title, globalGenre, globalMood |
| **Character** | `CHAR_{BookId}_{Id}` | name, description, traits, motivation, isActive |
| **Location** | `LOC_{BookId}_{Id}` | name, description, atmosphere |
| **World Rule** | `RULE_{BookId}_{Id}` | title, description |
| **Story Page** | `PAGE_{BookId}_{Nr}` | content (chunked), userNote, targetMood, orderIndex |
| **Summary** | `SUM_{BookId}` | rollingSummary |

## Service Layer

All Table Storage access goes through `saga.backend/src/services/tableStorage.ts`:

```typescript
import { getTableClient } from '../services/tableStorage'
```

## CRUD Templates

### Create Entity
```typescript
async function createBook(userId: string, book: BookEntity): Promise<BookEntity> {
  const client = getTableClient()
  const entity = {
    partitionKey: `User_${userId}`,
    rowKey: `BOOK_${book.bookId}`,
    title: book.title,
    globalGenre: book.globalGenre,
    globalMood: book.globalMood,
  }
  await client.createEntity(entity)
  return book
}
```

### Read Entity
```typescript
async function getBook(userId: string, bookId: string): Promise<BookEntity | null> {
  const client = getTableClient()
  try {
    const entity = await client.getEntity<BookTableEntity>(
      `User_${userId}`,
      `BOOK_${bookId}`
    )
    return mapToBook(entity)
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode === 404) return null
    throw error
  }
}
```

### List by Prefix (e.g., all characters for a book)
```typescript
async function listCharacters(userId: string, bookId: string): Promise<CharacterEntity[]> {
  const client = getTableClient()
  const prefix = `CHAR_${bookId}_`
  const entities: CharacterEntity[] = []
  const query = client.listEntities<CharacterTableEntity>({
    queryOptions: {
      filter: `PartitionKey eq 'User_${userId}' and RowKey ge '${prefix}' and RowKey lt '${prefix}~'`,
    },
  })
  for await (const entity of query) {
    entities.push(mapToCharacter(entity))
  }
  return entities
}
```

### Update Entity
```typescript
async function updateBook(userId: string, bookId: string, updates: Partial<BookEntity>): Promise<void> {
  const client = getTableClient()
  await client.updateEntity(
    { partitionKey: `User_${userId}`, rowKey: `BOOK_${bookId}`, ...updates },
    'Merge'
  )
}
```

### Delete Entity
```typescript
async function deleteBook(userId: string, bookId: string): Promise<void> {
  const client = getTableClient()
  await client.deleteEntity(`User_${userId}`, `BOOK_${bookId}`)
}
```

## Content Chunking (Pages >64KB)

```typescript
import { chunkContent, dechunkContent } from '../utils/chunking'

// Writing: split content into 64KB chunks
const chunks = chunkContent(pageContent)
const entity = { partitionKey, rowKey, ...chunks }

// Reading: reassemble chunks
const content = dechunkContent(entity)
```

## Rules
- **Always** use `DefaultAzureCredential` — never connection strings
- Handle 404 responses gracefully (entity not found → return null)
- Use `'Merge'` mode for partial updates, `'Replace'` for full overwrites
- Define entity types in `src/types/entities.ts`
- Use `~` (tilde) as the upper bound character for RowKey prefix queries
