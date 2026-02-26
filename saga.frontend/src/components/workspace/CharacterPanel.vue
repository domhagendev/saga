<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import type { Character } from '@/stores/book'

const props = defineProps<{
  characters: Character[]
}>()

const emit = defineEmits<{
  add: [character: Omit<Character, 'charId' | 'bookId'>]
  toggle: [charId: string]
  remove: [charId: string]
}>()

const { t } = useI18n()

const isAdding = ref(false)
const expandedId = ref<string | null>(null)

const newChar = ref({
  name: '',
  description: '',
  traits: '',
  motivation: '',
  isActive: true,
})

function toggleExpand(charId: string): void {
  expandedId.value = expandedId.value === charId ? null : charId
}

function startAdding(): void {
  isAdding.value = true
  newChar.value = { name: '', description: '', traits: '', motivation: '', isActive: true }
}

function cancelAdd(): void {
  isAdding.value = false
}

function submitAdd(): void {
  if (!newChar.value.name.trim()) return
  emit('add', { ...newChar.value })
  isAdding.value = false
}
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border px-4 py-3">
      <h3 class="text-sm font-semibold text-foreground">
        {{ t('story.characters') }}
        <span class="ml-1 text-xs text-muted-foreground">({{ characters.length }})</span>
      </h3>
      <button
        class="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        @click="startAdding"
      >
        + {{ t('workspace.addCharacter') }}
      </button>
    </div>

    <!-- Add form -->
    <div v-if="isAdding" class="border-b border-border bg-muted/50 p-4">
      <div class="space-y-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.characterName') }}
          </label>
          <input
            v-model="newChar.name"
            type="text"
            :placeholder="t('workspace.characterNamePlaceholder')"
            class="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.description') }}
          </label>
          <textarea
            v-model="newChar.description"
            rows="2"
            :placeholder="t('workspace.characterDescPlaceholder')"
            class="w-full resize-none rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.traits') }}
          </label>
          <input
            v-model="newChar.traits"
            type="text"
            :placeholder="t('workspace.traitsPlaceholder')"
            class="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.motivation') }}
          </label>
          <textarea
            v-model="newChar.motivation"
            rows="2"
            :placeholder="t('workspace.motivationPlaceholder')"
            class="w-full resize-none rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button
            class="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
            @click="cancelAdd"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            :disabled="!newChar.name.trim()"
            class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            @click="submitAdd"
          >
            {{ t('common.create') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Character list -->
    <div class="divide-y divide-border">
      <div
        v-for="char in characters"
        :key="char.charId"
        class="group"
      >
        <div class="flex items-center gap-3 px-4 py-3">
          <!-- Active toggle -->
          <button
            class="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
            :class="
              char.isActive
                ? 'border-blue-500 bg-blue-500'
                : 'border-muted-foreground bg-transparent'
            "
            :title="t('workspace.toggleActive')"
            @click="emit('toggle', char.charId)"
          >
            <svg
              v-if="char.isActive"
              class="h-3 w-3 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </button>

          <!-- Name + traits preview -->
          <button
            class="flex-1 text-left"
            @click="toggleExpand(char.charId)"
          >
            <span
              class="text-sm font-medium"
              :class="char.isActive ? 'text-foreground' : 'text-muted-foreground line-through'"
            >
              {{ char.name }}
            </span>
            <span class="ml-2 text-xs text-muted-foreground">{{ char.traits }}</span>
          </button>

          <!-- Delete -->
          <button
            class="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            :title="t('common.delete')"
            @click="emit('remove', char.charId)"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Expanded details -->
        <div v-if="expandedId === char.charId" class="border-t border-border bg-muted/30 px-4 py-3">
          <div class="space-y-2 text-sm">
            <div>
              <span class="font-medium text-foreground">{{ t('workspace.description') }}:</span>
              <p class="mt-0.5 text-muted-foreground">{{ char.description }}</p>
            </div>
            <div v-if="char.motivation">
              <span class="font-medium text-foreground">{{ t('workspace.motivation') }}:</span>
              <p class="mt-0.5 text-muted-foreground">{{ char.motivation }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="characters.length === 0 && !isAdding"
      class="px-4 py-6 text-center text-sm text-muted-foreground"
    >
      {{ t('workspace.noCharacters') }}
    </div>
  </div>
</template>
