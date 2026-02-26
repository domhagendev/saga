<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import type { WorldRule } from '@/stores/book'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
  <Card>
    <CardHeader class="flex-row items-center justify-between space-y-0 px-4 py-3">
      <h3 class="text-sm font-semibold text-foreground">
        {{ t('story.rules') }}
        <span class="ml-1 text-xs text-muted-foreground">({{ rules.length }})</span>
      </h3>
      <Button variant="ghost" size="sm" class="h-7 px-2 text-xs" @click="startAdding">
        + {{ t('workspace.addRule') }}
      </Button>
    </CardHeader>

    <CardContent class="px-4 pb-3 pt-0">
    <!-- Add form -->
    <div v-if="isAdding" class="mb-3 rounded-lg bg-muted/50 p-3">
      <div class="space-y-2.5">
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.ruleTitle') }}
          </label>
          <Input
            v-model="newRule.title"
            :placeholder="t('workspace.ruleTitlePlaceholder')"
            class="h-8 text-sm"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.description') }}
          </label>
          <Textarea
            v-model="newRule.description"
            :rows="3"
            :placeholder="t('workspace.ruleDescPlaceholder')"
            class="min-h-[80px] resize-none text-sm"
          />
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" @click="cancelAdd">
            {{ t('common.cancel') }}
          </Button>
          <Button size="sm" :disabled="!newRule.title.trim()" @click="submitAdd">
            {{ t('common.create') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Rules list -->
    <div class="space-y-0.5">
      <div
        v-for="rule in rules"
        :key="rule.ruleId"
        class="group rounded-md transition-colors hover:bg-accent/50"
      >
        <div class="flex items-center gap-2.5 px-2 py-2">
          <!-- Rule icon -->
          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="h-6 w-6 opacity-0 group-hover:opacity-100"
                  @click="emit('remove', rule.ruleId)"
                >
                  <svg class="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{{ t('common.delete') }}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <!-- Expanded details -->
        <div v-if="expandedId === rule.ruleId" class="mx-2 mb-2 rounded-md bg-muted/50 px-3 py-2.5">
          <p class="text-sm text-muted-foreground">{{ rule.description }}</p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="rules.length === 0 && !isAdding"
      class="py-4 text-center text-sm text-muted-foreground"
    >
      {{ t('workspace.noRules') }}
    </div>
    </CardContent>
  </Card>
</template>
