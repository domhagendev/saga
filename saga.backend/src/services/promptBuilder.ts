import type {
  CharacterEntity,
  LocationEntity,
  WorldRuleEntity,
  PageEntity,
  SummaryEntity,
} from '../types/entities.js'
import { reassembleContent } from '../utils/chunking.js'

interface PromptContext {
  worldRules: WorldRuleEntity[]
  characters: CharacterEntity[]
  locations: LocationEntity[]
  summary: SummaryEntity | null
  lastTwoPages: PageEntity[]
  userNote: string
  targetMood: string
  mentionedEntityNames?: string[]
  globalGenre: string
  globalMood: string
}

interface AssembledPrompt {
  systemInstruction: string
  userMessage: string
}

/**
 * Builds the sliding window prompt for page generation.
 *
 * Structure:
 *   SYSTEM: world rules + characters + locations + genre/mood
 *   USER:   rolling summary + last 2 pages + beat instruction + hashtag entities
 */
export function buildPagePrompt(ctx: PromptContext): AssembledPrompt {
  // ─── System Instruction ───
  const systemParts: string[] = [
    `You are a creative fiction writer. Write in the style of a ${ctx.globalGenre} story with a ${ctx.globalMood} mood.`,
    `Continue the story naturally, maintaining character voices and plot consistency.`,
    `Write approximately 500-800 words for the next page.`,
  ]

  if (ctx.worldRules.length > 0) {
    systemParts.push('\n## World Rules')
    for (const rule of ctx.worldRules) {
      systemParts.push(`- **${rule.title}**: ${rule.description}`)
    }
  }

  if (ctx.characters.length > 0) {
    systemParts.push('\n## Characters')
    for (const char of ctx.characters) {
      const parts = [`**${char.name}**: ${char.description}`]
      if (char.traits) parts.push(`Traits: ${char.traits}`)
      if (char.motivation) parts.push(`Motivation: ${char.motivation}`)
      systemParts.push(`- ${parts.join('. ')}`)
    }
  }

  if (ctx.locations.length > 0) {
    systemParts.push('\n## Locations')
    for (const loc of ctx.locations) {
      systemParts.push(
        `- **${loc.name}**: ${loc.description}. Atmosphere: ${loc.atmosphere}`
      )
    }
  }

  // ─── User Message ───
  const userParts: string[] = []

  // 1. Rolling summary
  if (ctx.summary?.rollingSummary) {
    userParts.push(`## Story So Far\n${ctx.summary.rollingSummary}`)
  }

  // 2. Last 2 pages (full text for prose continuity)
  if (ctx.lastTwoPages.length > 0) {
    userParts.push('## Recent Pages')
    for (const page of ctx.lastTwoPages) {
      const content = reassembleContent(page)
      userParts.push(`### Page ${page.orderIndex}\n${content}`)
    }
  }

  // 3. Beat instruction + mentioned entities
  const beatParts: string[] = [`## Next Beat\n${ctx.userNote}`]
  if (ctx.targetMood) {
    beatParts.push(`Target mood: ${ctx.targetMood}`)
  }

  if (ctx.mentionedEntityNames && ctx.mentionedEntityNames.length > 0) {
    beatParts.push(
      `\nFocus on these entities: ${ctx.mentionedEntityNames.join(', ')}`
    )
  }

  userParts.push(beatParts.join('\n'))

  return {
    systemInstruction: systemParts.join('\n'),
    userMessage: userParts.join('\n\n'),
  }
}

/**
 * Builds a prompt to update the rolling summary after a new page is generated.
 */
export function buildSummaryUpdatePrompt(
  existingSummary: string,
  newPageContent: string,
  pageIndex: number
): AssembledPrompt {
  return {
    systemInstruction: [
      'You are a precise story summarizer.',
      'Update the rolling summary to include the events of the new page.',
      'Keep the summary concise (max 500 words) while preserving key plot points,',
      'character developments, and unresolved threads.',
      'Write in past tense, third person.',
    ].join(' '),
    userMessage: [
      '## Current Summary',
      existingSummary || '(No summary yet — this is the first page)',
      '',
      `## New Page (Page ${pageIndex})`,
      newPageContent,
      '',
      '## Task',
      'Write an updated rolling summary incorporating the new page events.',
    ].join('\n'),
  }
}
