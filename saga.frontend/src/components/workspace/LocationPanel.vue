<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import type { Location } from '@/stores/book'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const props = defineProps<{
  locations: Location[]
}>()

const emit = defineEmits<{
  add: [location: Omit<Location, 'locId' | 'bookId'>]
  remove: [locId: string]
}>()

const { t } = useI18n()

const isAdding = ref(false)
const expandedId = ref<string | null>(null)

const newLoc = ref({
  name: '',
  description: '',
  atmosphere: '',
})

function toggleExpand(locId: string): void {
  expandedId.value = expandedId.value === locId ? null : locId
}

function startAdding(): void {
  isAdding.value = true
  newLoc.value = { name: '', description: '', atmosphere: '' }
}

function cancelAdd(): void {
  isAdding.value = false
}

function submitAdd(): void {
  if (!newLoc.value.name.trim()) return
  emit('add', { ...newLoc.value })
  isAdding.value = false
}
</script>

<template>
  <Card>
    <CardHeader class="flex-row items-center justify-between space-y-0 px-4 py-3">
      <h3 class="text-sm font-semibold text-foreground">
        {{ t('story.locations') }}
        <span class="ml-1 text-xs text-muted-foreground">({{ locations.length }})</span>
      </h3>
      <Button variant="ghost" size="sm" class="h-7 px-2 text-xs" @click="startAdding">
        + {{ t('workspace.addLocation') }}
      </Button>
    </CardHeader>

    <CardContent class="px-4 pb-3 pt-0">
    <!-- Add form -->
    <div v-if="isAdding" class="mb-3 rounded-lg bg-muted/50 p-3">
      <div class="space-y-2.5">
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.locationName') }}
          </label>
          <Input
            v-model="newLoc.name"
            :placeholder="t('workspace.locationNamePlaceholder')"
            class="h-8 text-sm"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.description') }}
          </label>
          <Textarea
            v-model="newLoc.description"
            :rows="2"
            :placeholder="t('workspace.locationDescPlaceholder')"
            class="min-h-[60px] resize-none text-sm"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.atmosphere') }}
          </label>
          <Textarea
            v-model="newLoc.atmosphere"
            :rows="2"
            :placeholder="t('workspace.atmospherePlaceholder')"
            class="min-h-[60px] resize-none text-sm"
          />
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" @click="cancelAdd">
            {{ t('common.cancel') }}
          </Button>
          <Button size="sm" :disabled="!newLoc.name.trim()" @click="submitAdd">
            {{ t('common.create') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Location list -->
    <div class="space-y-0.5">
      <div
        v-for="loc in locations"
        :key="loc.locId"
        class="group rounded-md transition-colors hover:bg-accent/50"
      >
        <div class="flex items-center gap-2.5 px-2 py-2">
          <!-- Map pin icon -->
          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>

          <!-- Name -->
          <button
            class="flex-1 text-left"
            @click="toggleExpand(loc.locId)"
          >
            <span class="text-sm font-medium text-foreground">{{ loc.name }}</span>
          </button>

          <!-- Delete -->
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="h-6 w-6 opacity-0 group-hover:opacity-100"
                  @click="emit('remove', loc.locId)"
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
        <div v-if="expandedId === loc.locId" class="mx-2 mb-2 rounded-md bg-muted/50 px-3 py-2.5">
          <div class="space-y-1.5 text-sm">
            <div>
              <span class="font-medium text-foreground">{{ t('workspace.description') }}:</span>
              <p class="mt-0.5 text-muted-foreground">{{ loc.description }}</p>
            </div>
            <div v-if="loc.atmosphere">
              <span class="font-medium text-foreground">{{ t('workspace.atmosphere') }}:</span>
              <p class="mt-0.5 text-muted-foreground">{{ loc.atmosphere }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="locations.length === 0 && !isAdding"
      class="py-4 text-center text-sm text-muted-foreground"
    >
      {{ t('workspace.noLocations') }}
    </div>
    </CardContent>
  </Card>
</template>
