/**
 * Extract hashtag mentions from user beat instructions.
 * e.g. "#Erik meets #TheDragon in #DeepForest"
 * returns ["Erik", "TheDragon", "DeepForest"]
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#(\w+)/g)
  if (!matches) return []
  return matches.map((m) => m.slice(1))
}

/**
 * Replace hashtag mentions in text with plain names for the AI prompt.
 * "#Erik meets #TheDragon" → "Erik meets TheDragon"
 */
export function stripHashtags(text: string): string {
  return text.replace(/#(\w+)/g, '$1')
}
