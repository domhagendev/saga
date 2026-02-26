import type { PageEntity } from '../types/entities.js'

const CHUNK_SIZE = 60_000 // ~60KB per chunk (under 64KB Table Storage property limit)

/**
 * Split content into numbered chunks for Table Storage.
 * Returns an object like { content_1: '...', content_2: '...' }
 */
export function chunkContent(content: string): Record<string, string> {
  const chunks: Record<string, string> = {}

  if (content.length <= CHUNK_SIZE) {
    chunks['content_1'] = content
    return chunks
  }

  let index = 1
  let offset = 0
  while (offset < content.length) {
    chunks[`content_${index}`] = content.slice(offset, offset + CHUNK_SIZE)
    offset += CHUNK_SIZE
    index++
  }

  return chunks
}

/**
 * Reassemble chunked content from a PageEntity back into a single string.
 */
export function reassembleContent(entity: PageEntity): string {
  const parts: string[] = []
  let index = 1

  while (true) {
    const key = `content_${index}` as keyof PageEntity
    const chunk = entity[key]
    if (typeof chunk !== 'string') break
    parts.push(chunk)
    index++
  }

  return parts.join('')
}
