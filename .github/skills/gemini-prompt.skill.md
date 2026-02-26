---
name: "Gemini Prompt Builder"
description: "Templates for constructing Gemini AI prompts following the sliding window strategy"
---

# Gemini Prompt Builder Skill

Templates and guidelines for constructing AI prompts for the Saga story engine.

## Model Selection

| Task | Model | SDK Constant |
|---|---|---|
| Page generation | `gemini-2.0-flash` | `FLASH_MODEL` |
| Hashtag autocomplete enrichment | `gemini-2.0-flash` | `FLASH_MODEL` |
| JSON extraction | `gemini-2.0-flash` | `FLASH_MODEL` |
| World logic validation | `gemini-1.5-pro` | `PRO_MODEL` |
| Rolling summary update | `gemini-2.0-flash` | `FLASH_MODEL` |

## Sliding Window Prompt Assembly

When generating a new page, construct the prompt in 4 layers:

### Layer 1: System Instruction (persists in `systemInstruction`)
```typescript
const systemInstruction = `You are a creative writing assistant for the story "${book.title}".
Genre: ${book.globalGenre}
Mood: ${book.globalMood}

=== WORLD RULES ===
${worldRules.map(r => `- ${r.title}: ${r.description}`).join('\n')}

=== ACTIVE CHARACTERS ===
${characters.map(c => `- ${c.name}: ${c.description}. Traits: ${c.traits}. Motivation: ${c.motivation}.`).join('\n')}

=== ACTIVE LOCATIONS ===
${locations.map(l => `- ${l.name}: ${l.description}. Atmosphere: ${l.atmosphere}.`).join('\n')}

STRICT RULES:
- Never contradict the world rules defined above.
- Keep characters consistent with their defined traits and motivations.
- Maintain the specified mood unless the user explicitly changes it.
- Write in a style appropriate for the genre.`
```

### Layer 2: Historical Context (in user message)
```typescript
const historicalContext = `=== STORY SO FAR (Summary) ===
${rollingSummary.content}`
```

### Layer 3: Immediate Context (in user message)
```typescript
const immediateContext = `=== RECENT PAGES ===
--- Page ${pageN-1} ---
${previousPage.content}

--- Page ${pageN} ---
${currentPage.content}`
```

### Layer 4: User Beat (in user message)
```typescript
const userBeat = `=== YOUR TASK ===
Write the next page based on this direction: ${userInput}
${targetMood ? `Target mood: ${targetMood}` : ''}
${userNote ? `Additional notes: ${userNote}` : ''}`
```

### Full Prompt Assembly
```typescript
const result = await model.generateContent({
  systemInstruction,
  contents: [{
    role: 'user',
    parts: [{ text: `${historicalContext}\n\n${immediateContext}\n\n${userBeat}` }],
  }],
})
```

## Rolling Summary Update Prompt
```typescript
const summaryPrompt = `You are a story summarizer. Given the existing summary and a new page, 
produce an updated condensed summary that preserves all key plot points, character developments, 
and world-building details. Keep it under 2000 words.

=== EXISTING SUMMARY ===
${existingSummary}

=== NEW PAGE ===
${newPageContent}

=== UPDATED SUMMARY ===`
```

## World Logic Validation Prompt (uses Gemini 1.5 Pro)
```typescript
const validationPrompt = `You are a consistency checker for a fictional world.
Given these world rules and the proposed new page, identify any contradictions or inconsistencies.

=== WORLD RULES ===
${worldRules}

=== CHARACTERS ===
${characters}

=== PROPOSED PAGE ===
${pageContent}

Respond in JSON format: { "consistent": boolean, "issues": [{ "description": string, "severity": "high"|"medium"|"low" }] }`
```

## Hashtag Entity Injection
When the user's beat contains `#EntityName`:
1. Parse `#` mentions with regex: `/#(\w+)/g`
2. Match against entity names (case-insensitive)
3. Inject matched entities into the system instruction, even if not "Active"
4. Prefix with `=== REFERENCED ENTITIES ===`

## Prompt Safety
- Wrap user beat text in clear delimiters (`=== YOUR TASK ===`)
- Never include user email, tokens, or userId in prompts
- Validate AI response length before storing (reject if >10x expected)
- Sanitize AI output for XSS before rendering in browser
