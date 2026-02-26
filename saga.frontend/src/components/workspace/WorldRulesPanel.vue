<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import type { WorldRule } from '@/stores/book'

const props = defineProps<{
  rules: WorldRule[]
}>()

const emit = defineEmits<{
  add: [rule: Omit<WorldRule, 'ruleId' | 'bookId'>]
  remove: [ruleId: string]
}>()

const { t } = useI18n()

const isAdding = ref(false)
const expandedId = ref<string | null>(null)

const newRule = ref({
  title: '',
  description: '',
})

function toggleExpand(ruleId: string): void {
  expandedId.value = expandedId.value === ruleId ? null : ruleId
}

function startAdding(): void {
  isAdding.value = true
  newRule.value = { title: '', description: '' }
}

function cancelAdd(): void {
  isAdding.value = false
}

function submitAdd(): void {
  if (!newRule.value.title.trim()) return
  emit('add', { ...newRule.value })
  isAdding.value = false
}
</script>

<template>
  <div class="rounded-lg border border-border bg-card">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border px-4 py-3">
      <h3 class="text-sm font-semibold text-foreground">
        {{ t('story.rules') }}
        <span class="ml-1 text-xs text-muted-foreground">({{ rules.length }})</span>
      </h3>
      <button
        class="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        @click="startAdding"
      >
        + {{ t('workspace.addRule') }}
      </button>
    </div>

    <!-- Add form -->
    <div v-if="isAdding" class="border-b border-border bg-muted/50 p-4">
      <div class="space-y-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.ruleTitle') }}
          </label>
          <input
            v-model="newRule.title"
            type="text"
            :placeholder="t('workspace.ruleTitlePlaceholder')"
            class="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.description') }}
          </label>
          <textarea
            v-model="newRule.description"
            rows="3"
            :placeholder="t('workspace.ruleDescPlaceholder')"
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
            :disabled="!newRule.title.trim()"
            class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            @click="submitAdd"
          >
            {{ t('common.create') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Rules list -->
    <div class="divide-y divide-border">
      <div
        v-for="rule in rules"
        :key="rule.ruleId"
        class="group"
      >
        <div class="flex items-center gap-3 px-4 py-3">
          <!-- Rule icon -->
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </span>

          <!-- Title -->
          <button
            class="flex-1 text-left"
            @click="toggleExpand(rule.ruleId)"
          >
            <span class="text-sm font-medium text-foreground">{{ rule.title }}</span>
          </button>

          <!-- Delete -->
          <button
            class="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            :title="t('common.delete')"
            @click="emit('remove', rule.ruleId)"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Expanded details -->
        <div v-if="expandedId === rule.ruleId" class="border-t border-border bg-muted/30 px-4 py-3">
          <p class="text-sm text-muted-foreground">{{ rule.description }}</p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="rules.length === 0 && !isAdding"
      class="px-4 py-6 text-center text-sm text-muted-foreground"
    >
      {{ t('workspace.noRules') }}
    </div>
  </div>
</template>
