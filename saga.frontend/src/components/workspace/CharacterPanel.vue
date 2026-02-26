<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import type { Character } from '@/stores/book'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
  <Card>
    <CardHeader class="flex-row items-center justify-between space-y-0 px-4 py-3">
      <h3 class="text-sm font-semibold text-foreground">
        {{ t('story.characters') }}
        <span class="ml-1 text-xs text-muted-foreground">({{ characters.length }})</span>
      </h3>
      <Button variant="ghost" size="sm" class="h-7 px-2 text-xs" @click="startAdding">
        + {{ t('workspace.addCharacter') }}
      </Button>
    </CardHeader>

    <CardContent class="px-4 pb-3 pt-0">
    <!-- Add form -->
    <div v-if="isAdding" class="mb-3 rounded-lg bg-muted/50 p-3">
      <div class="space-y-2.5">
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.characterName') }}
          </label>
          <Input
            v-model="newChar.name"
            :placeholder="t('workspace.characterNamePlaceholder')"
            class="h-8 text-sm"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.description') }}
          </label>
          <Textarea
            v-model="newChar.description"
            :rows="2"
            :placeholder="t('workspace.characterDescPlaceholder')"
            class="min-h-[60px] resize-none text-sm"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.traits') }}
          </label>
          <Input
            v-model="newChar.traits"
            :placeholder="t('workspace.traitsPlaceholder')"
            class="h-8 text-sm"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.motivation') }}
          </label>
          <Textarea
            v-model="newChar.motivation"
            :rows="2"
            :placeholder="t('workspace.motivationPlaceholder')"
            class="min-h-[60px] resize-none text-sm"
          />
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" @click="cancelAdd">
            {{ t('common.cancel') }}
          </Button>
          <Button size="sm" :disabled="!newChar.name.trim()" @click="submitAdd">
            {{ t('common.create') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Character list -->
    <div class="space-y-0.5">
      <div
        v-for="char in characters"
        :key="char.charId"
        class="group rounded-md transition-colors hover:bg-accent/50"
      >
        <div class="flex items-center gap-2.5 px-2 py-2">
          <!-- Active toggle -->
          <button
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="h-6 w-6 opacity-0 group-hover:opacity-100"
                  @click="emit('remove', char.charId)"
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
        <div v-if="expandedId === char.charId" class="mx-2 mb-2 rounded-md bg-muted/50 px-3 py-2.5">
          <div class="space-y-1.5 text-sm">
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
      class="py-4 text-center text-sm text-muted-foreground"
    >
      {{ t('workspace.noCharacters') }}
    </div>
    </CardContent>
  </Card>
</template>
