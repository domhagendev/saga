<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Book, StoryPage } from '@/stores/book'

defineProps<{
  book: Book
  pages: StoryPage[]
  currentPageNr: number
}>()

const emit = defineEmits<{
  selectPage: [pageNr: number]
  newBook: []
}>()

const { t } = useI18n()
</script>

<template>
  <aside class="flex h-full flex-col rounded-lg border border-border bg-card">
    <!-- Book info -->
    <div class="border-b border-border p-4">
      <h2 class="text-base font-semibold text-foreground">{{ book.title }}</h2>
      <div class="mt-1 flex gap-2">
        <span class="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          {{ book.globalGenre }}
        </span>
        <span class="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          {{ book.globalMood }}
        </span>
      </div>
    </div>

    <!-- Page list -->
    <div class="flex-1 overflow-y-auto p-2">
      <h3 class="mb-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {{ t('story.pages') }}
      </h3>
      <nav class="space-y-1">
        <button
          v-for="page in pages"
          :key="page.pageNr"
          class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors"
          :class="
            page.pageNr === currentPageNr
              ? 'bg-accent text-accent-foreground font-medium'
              : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
          "
          @click="emit('selectPage', page.pageNr)"
        >
          <span
            class="flex h-5 w-5 items-center justify-center rounded text-xs"
            :class="
              page.pageNr === currentPageNr
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            "
          >
            {{ page.pageNr }}
          </span>
          <span class="truncate">
            {{ page.userNote || t('workspace.untitledPage') }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Bottom actions -->
    <div class="border-t border-border p-3">
      <button
        class="w-full rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        @click="emit('newBook')"
      >
        {{ t('story.newBook') }}
      </button>
    </div>
  </aside>
</template>
