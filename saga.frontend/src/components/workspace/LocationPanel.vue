<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import type { Location } from '@/stores/book'

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
  <div class="rounded-lg border border-border bg-card">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-border px-4 py-3">
      <h3 class="text-sm font-semibold text-foreground">
        {{ t('story.locations') }}
        <span class="ml-1 text-xs text-muted-foreground">({{ locations.length }})</span>
      </h3>
      <button
        class="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        @click="startAdding"
      >
        + {{ t('workspace.addLocation') }}
      </button>
    </div>

    <!-- Add form -->
    <div v-if="isAdding" class="border-b border-border bg-muted/50 p-4">
      <div class="space-y-3">
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.locationName') }}
          </label>
          <input
            v-model="newLoc.name"
            type="text"
            :placeholder="t('workspace.locationNamePlaceholder')"
            class="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.description') }}
          </label>
          <textarea
            v-model="newLoc.description"
            rows="2"
            :placeholder="t('workspace.locationDescPlaceholder')"
            class="w-full resize-none rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:border-ring focus:outline-none"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-foreground">
            {{ t('workspace.atmosphere') }}
          </label>
          <textarea
            v-model="newLoc.atmosphere"
            rows="2"
            :placeholder="t('workspace.atmospherePlaceholder')"
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
            :disabled="!newLoc.name.trim()"
            class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            @click="submitAdd"
          >
            {{ t('common.create') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Location list -->
    <div class="divide-y divide-border">
      <div
        v-for="loc in locations"
        :key="loc.locId"
        class="group"
      >
        <div class="flex items-center gap-3 px-4 py-3">
          <!-- Map pin icon -->
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700">
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
          <button
            class="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            :title="t('common.delete')"
            @click="emit('remove', loc.locId)"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Expanded details -->
        <div v-if="expandedId === loc.locId" class="border-t border-border bg-muted/30 px-4 py-3">
          <div class="space-y-2 text-sm">
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
      class="px-4 py-6 text-center text-sm text-muted-foreground"
    >
      {{ t('workspace.noLocations') }}
    </div>
  </div>
</template>
