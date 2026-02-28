// ─── Table Storage Entities ───

export interface BookEntity {
  partitionKey: string // User_{UserId}
  rowKey: string // BOOK_{BookId}
  title: string
  globalGenre: string
  globalMood: string
  createdAt: string
  updatedAt: string
}

export interface CharacterEntity {
  partitionKey: string // User_{UserId}
  rowKey: string // CHAR_{BookId}_{CharId}
  name: string
  description: string
  traits: string
  motivation: string
  isActive: boolean
}

export interface LocationEntity {
  partitionKey: string // User_{UserId}
  rowKey: string // LOC_{BookId}_{LocId}
  name: string
  description: string
  atmosphere: string
}

export interface WorldRuleEntity {
  partitionKey: string // User_{UserId}
  rowKey: string // RULE_{BookId}_{RuleId}
  title: string
  description: string
}

export interface PageEntity {
  partitionKey: string // User_{UserId}
  rowKey: string // PAGE_{BookId}_{PageNr}
  userNote: string
  targetMood: string
  orderIndex: number
  [key: `content_${number}`]: string // content_1, content_2, ...
}

export interface SummaryEntity {
  partitionKey: string // User_{UserId}
  rowKey: string // SUM_{BookId}
  rollingSummary: string
  lastPageIndex: number
}

// ─── Request DTOs ───

export interface CreateBookRequest {
  title: string
  globalGenre: string
  globalMood: string
}

export interface UpdateBookRequest {
  title?: string
  globalGenre?: string
  globalMood?: string
}

export interface CreateCharacterRequest {
  name: string
  description: string
  traits: string
  motivation: string
  isActive?: boolean
}

export interface UpdateCharacterRequest {
  name?: string
  description?: string
  traits?: string
  motivation?: string
  isActive?: boolean
}

export interface CreateLocationRequest {
  name: string
  description: string
  atmosphere: string
}

export interface UpdateLocationRequest {
  name?: string
  description?: string
  atmosphere?: string
}

export interface CreateWorldRuleRequest {
  title: string
  description: string
}

export interface UpdateWorldRuleRequest {
  title?: string
  description?: string
}

export interface GeneratePageRequest {
  userNote: string
  targetMood: string
  mentionedEntities?: string[]
}

export interface EditPageRequest {
  userNote: string // edit instructions from the user
  targetMood: string
  mentionedEntities?: string[]
}

export interface UpdatePageRequest {
  content?: string
  userNote?: string
  targetMood?: string
}

// ─── Response DTOs ───

export interface BookResponse {
  bookId: string
  title: string
  globalGenre: string
  globalMood: string
  createdAt: string
  updatedAt: string
}

export interface CharacterResponse {
  charId: string
  bookId: string
  name: string
  description: string
  traits: string
  motivation: string
  isActive: boolean
}

export interface LocationResponse {
  locId: string
  bookId: string
  name: string
  description: string
  atmosphere: string
}

export interface WorldRuleResponse {
  ruleId: string
  bookId: string
  title: string
  description: string
}

export interface PageResponse {
  bookId: string
  pageNr: number
  content: string
  userNote: string
  targetMood: string
  orderIndex: number
}

export interface SummaryResponse {
  bookId: string
  rollingSummary: string
  lastPageIndex: number
}

// ─── Helpers ───

export type RowKeyPrefix = 'BOOK' | 'CHAR' | 'LOC' | 'RULE' | 'PAGE' | 'SUM'

export function makePartitionKey(userId: string): string {
  return `User_${userId}`
}

export function makeRowKey(prefix: RowKeyPrefix, ...parts: string[]): string {
  return [prefix, ...parts].join('_')
}

export function parseRowKey(rowKey: string): { prefix: RowKeyPrefix; parts: string[] } {
  const segments = rowKey.split('_')
  const prefix = segments[0] as RowKeyPrefix
  return { prefix, parts: segments.slice(1) }
}
