<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'
import type { Book, StoryPage } from '@/stores/book'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const props = defineProps<{
  book: Book
  pages: StoryPage[]
  currentPageNr: number
}>()

const emit = defineEmits<{
  selectPage: [pageNr: number]
  newBook: []
  updateTitle: [title: string]
}>()

const { t } = useI18n()

const isEditingTitle = ref(false)
const editTitle = ref(props.book.title)

watch(() => props.book.title, (val) => {
  editTitle.value = val
})

function startEditing(): void {
  editTitle.value = props.book.title
  isEditingTitle.value = true
}

function saveTitle(): void {
  isEditingTitle.value = false
  const trimmed = editTitle.value.trim()
  if (trimmed && trimmed !== props.book.title) {
    emit('updateTitle', trimmed)
  }
}

function cancelEditing(): void {
  isEditingTitle.value = false
  editTitle.value = props.book.title
}
</script>

<template>
  <aside class="flex h-full flex-col">
    <!-- Book info -->
    <div class="p-4">
      <input
        v-if="isEditingTitle"
        v-model="editTitle"
        class="w-full border-b border-border bg-transparent text-base font-semibold text-foreground outline-none focus:border-primary"
        @blur="saveTitle"
        @keydown.enter="saveTitle"
        @keydown.escape="cancelEditing"
        @vue:mounted="({ el }: { el: HTMLInputElement }) => el.focus()"
      />
      <h2
        v-else
        class="cursor-pointer text-base font-semibold text-foreground hover:text-muted-foreground"
        @click="startEditing"
      >
        {{ book.title }}
      </h2>
    </div>

    <Separator />

    <!-- Page list -->
    <ScrollArea class="flex-1">
      <div class="p-2">
        <h3 class="mb-2 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {{ t('story.pages') }}
        </h3>
        <nav class="space-y-0.5">
          <button
            v-for="page in pages"
            :key="page.pageNr"
            class="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors"
            :class="
              page.pageNr === currentPageNr
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            "
            @click="emit('selectPage', page.pageNr)"
          >
            <span
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium"
              :class="
                page.pageNr === currentPageNr
                  ? 'bg-stone-600 text-stone-100 dark:bg-stone-500'
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
    </ScrollArea>

  </aside>
</template>
