<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed, nextTick } from 'vue'
import type { Character, Location } from '@/stores/book'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const MAX_LENGTH = 800

const props = defineProps<{
  characters: Character[]
  locations: Location[]
  isGenerating: boolean
  isFirstPage: boolean
  pageJustGenerated: boolean
}>()

const emit = defineEmits<{
  generate: [beat: string, mood: string, mentionedIds: string[]]
  done: []
}>()

const { t } = useI18n()

const beatText = ref('')
const targetMood = ref('')
const showMentions = ref(false)
const mentionQuery = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const promptLabel = computed(() => {
  if (props.isFirstPage) return t('workspace.beatPromptFirst')
  if (props.pageJustGenerated) return t('workspace.beatPromptEdit')
  return t('workspace.beatPrompt')
})

const charsLeft = computed(() => MAX_LENGTH - beatText.value.length)

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

function autoResize(): void {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function handleInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement
  const value = target.value

  // Enforce max length
  if (value.length > MAX_LENGTH) {
    beatText.value = value.substring(0, MAX_LENGTH)
    nextTick(() => autoResize())
    return
  }

  const cursorPos = target.selectionStart
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

  autoResize()
}

function insertMention(item: { id: string; name: string }): void {
  const hashIndex = beatText.value.lastIndexOf('#')
  if (hashIndex !== -1) {
    beatText.value = beatText.value.substring(0, hashIndex) + '#' + item.name + ' '
  }
  if (!mentionedIds.value.includes(item.id)) {
    mentionedIds.value.push(item.id)
  }
  showMentions.value = false
  nextTick(() => autoResize())
}

function handleGenerate(): void {
  if (!beatText.value.trim()) return
  emit('generate', beatText.value, targetMood.value, mentionedIds.value)
  beatText.value = ''
  targetMood.value = ''
  mentionedIds.value = []
  nextTick(() => autoResize())
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
  <div class="space-y-3">
    <!-- Contextual label -->
    <p class="text-sm font-medium text-stone-700 dark:text-stone-300">
      {{ promptLabel }}
    </p>

    <!-- Beat textarea with mention support -->
    <div class="relative">
      <textarea
        ref="textareaRef"
        v-model="beatText"
        :placeholder="t('workspace.beatPlaceholder')"
        :disabled="isGenerating"
        :maxlength="MAX_LENGTH"
        rows="2"
        class="min-h-24 w-full resize-none overflow-hidden rounded-xl bg-stone-100 px-4 py-3 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-800/60 dark:text-stone-200 dark:placeholder:text-stone-500 dark:focus:ring-stone-600/50"
        @input="handleInput"
        @keydown="handleKeydown"
      />

      <!-- Char counter -->
      <span
        class="absolute bottom-2 right-3 text-[11px]"
        :class="charsLeft <= 50 ? 'text-amber-500 dark:text-amber-400' : 'text-stone-400 dark:text-stone-500'"
      >
        {{ charsLeft }}
      </span>

      <!-- Mention dropdown -->
      <div
        v-if="showMentions && mentionables.length > 0"
        class="absolute bottom-full left-0 z-10 mb-1 max-h-48 w-64 overflow-y-auto rounded-xl border border-stone-200 bg-white p-1 shadow-lg dark:border-stone-700 dark:bg-stone-900"
      >
        <button
          v-for="item in mentionables"
          :key="item.id"
          class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
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

    <!-- Mood input + action buttons -->
    <div class="flex items-end gap-3">
      <!-- Target mood -->
      <div class="flex-1">
        <label class="mb-1 block text-xs text-stone-500 dark:text-stone-400">
          {{ t('workspace.targetMood') }}
        </label>
        <input
          v-model="targetMood"
          type="text"
          :placeholder="t('workspace.moodPlaceholder')"
          :disabled="isGenerating"
          class="w-full rounded-xl bg-stone-100 px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-800/60 dark:text-stone-200 dark:placeholder:text-stone-500 dark:focus:ring-stone-600/50"
        />
      </div>

      <!-- Generate / Edit button -->
      <Button
        :disabled="isGenerating || !beatText.trim()"
        class="bg-stone-700 text-stone-100 hover:bg-stone-600 dark:bg-stone-600 dark:hover:bg-stone-500"
        @click="handleGenerate"
      >
        <span v-if="isGenerating" class="flex items-center gap-2">
          <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ t('workspace.generating') }}
        </span>
        <span v-else>{{ pageJustGenerated && !isFirstPage ? t('common.edit') : t('story.generate') }}</span>
      </Button>

      <!-- Done button — shown after generation -->
      <Button
        v-if="pageJustGenerated"
        variant="outline"
        class="border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
        @click="emit('done')"
      >
        <svg class="mr-1 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ t('workspace.done') }}
      </Button>
    </div>

    <!-- Hint -->
    <p class="text-xs text-stone-400 dark:text-stone-500">
      {{ t('workspace.beatHint') }}
    </p>
  </div>
</template>
