<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'
import type { Character, Location } from '@/stores/book'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  characters: Character[]
  locations: Location[]
  isGenerating: boolean
}>()

const emit = defineEmits<{
  generate: [beat: string, mood: string, mentionedIds: string[]]
}>()

const { t } = useI18n()

const beatText = ref('')
const targetMood = ref('')
const showMentions = ref(false)
const mentionQuery = ref('')

const mentionables = computed(() => {
  const items: Array<{ id: string; name: string; type: 'character' | 'location' }> = []

  for (const char of props.characters) {
    items.push({ id: char.charId, name: char.name, type: 'character' })
  }

  for (const loc of props.locations) {
    items.push({ id: loc.locId, name: loc.name, type: 'location' })
  }

  if (mentionQuery.value) {
    const q = mentionQuery.value.toLowerCase()
    return items.filter((item) => item.name.toLowerCase().includes(q))
  }

  return items
})

const mentionedIds = ref<string[]>([])

function handleInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement
  const value = target.value
  const cursorPos = target.selectionStart

  // Check if the user just typed #
  const textBefore = value.substring(0, cursorPos)
  const hashIndex = textBefore.lastIndexOf('#')

  if (hashIndex !== -1 && hashIndex === cursorPos - 1) {
    showMentions.value = true
    mentionQuery.value = ''
  } else if (hashIndex !== -1 && showMentions.value) {
    mentionQuery.value = textBefore.substring(hashIndex + 1)
  } else {
    showMentions.value = false
  }
}

function insertMention(item: { id: string; name: string }): void {
  const hashIndex = beatText.value.lastIndexOf('#')
  if (hashIndex !== -1) {
    beatText.value =
      beatText.value.substring(0, hashIndex) + '#' + item.name + ' '
  }
  if (!mentionedIds.value.includes(item.id)) {
    mentionedIds.value.push(item.id)
  }
  showMentions.value = false
}

function handleGenerate(): void {
  if (!beatText.value.trim()) return
  emit('generate', beatText.value, targetMood.value, mentionedIds.value)
  beatText.value = ''
  targetMood.value = ''
  mentionedIds.value = []
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    handleGenerate()
  }
  if (event.key === 'Escape' && showMentions.value) {
    showMentions.value = false
  }
}
</script>

<template>
  <div>
    <label class="mb-2 block text-sm font-medium text-foreground">
      {{ t('workspace.beatPrompt') }}
    </label>

    <!-- Beat text area with mention support -->
    <div class="relative">
      <textarea
        v-model="beatText"
        :placeholder="t('workspace.beatPlaceholder')"
        :disabled="isGenerating"
        rows="3"
        class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        @input="handleInput"
        @keydown="handleKeydown"
      />

      <!-- Mention dropdown -->
      <div
        v-if="showMentions && mentionables.length > 0"
        class="absolute bottom-full left-0 z-10 mb-1 max-h-48 w-64 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-md"
      >
        <button
          v-for="item in mentionables"
          :key="item.id"
          class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          @click="insertMention(item)"
        >
          <Badge
            :variant="item.type === 'character' ? 'default' : 'secondary'"
            class="h-5 w-5 justify-center p-0 text-[10px]"
          >
            {{ item.type === 'character' ? 'C' : 'L' }}
          </Badge>
          <span>{{ item.name }}</span>
        </button>
      </div>
    </div>

    <!-- Mood input + generate button -->
    <div class="mt-3 flex items-end gap-3">
      <div class="flex-1">
        <label class="mb-1 block text-xs text-muted-foreground">
          {{ t('workspace.targetMood') }}
        </label>
        <Input
          v-model="targetMood"
          type="text"
          :placeholder="t('workspace.moodPlaceholder')"
          :disabled="isGenerating"
        />
      </div>
      <Button
        :disabled="isGenerating || !beatText.trim()"
        @click="handleGenerate"
      >
        <span v-if="isGenerating" class="flex items-center gap-2">
          <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ t('workspace.generating') }}
        </span>
        <span v-else>{{ t('story.generate') }}</span>
      </Button>
    </div>

    <!-- Hint -->
    <p class="mt-2 text-xs text-muted-foreground">
      {{ t('workspace.beatHint') }}
    </p>
  </div>
</template>
