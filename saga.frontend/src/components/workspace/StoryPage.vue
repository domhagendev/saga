<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed, watch, nextTick } from 'vue'
import type { StoryPage } from '@/stores/book'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  page: StoryPage
  isLoading?: boolean
}>()

const emit = defineEmits<{
  'update:content': [content: string]
}>()

const { t } = useI18n()

const isEditing = ref(false)
const editContent = ref('')
const editTextareaRef = ref<HTMLTextAreaElement | null>(null)

function autoResizeEdit(): void {
  const el = editTextareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

watch(editContent, () => {
  nextTick(autoResizeEdit)
})

const hasContent = computed(() => props.page.content.trim().length > 0)

const paragraphs = computed(() =>
  props.page.content.split('\n').filter((p) => p.trim().length > 0)
)

function startEditing(): void {
  editContent.value = props.page.content
  isEditing.value = true
  nextTick(autoResizeEdit)
}

function saveEdit(): void {
  emit('update:content', editContent.value)
  isEditing.value = false
}

function cancelEdit(): void {
  isEditing.value = false
  editContent.value = ''
}

watch(
  () => props.page.pageNr,
  () => {
    isEditing.value = false
  }
)
</script>

<template>
  <div class="flex min-h-0 flex-col rounded-2xl bg-stone-50 dark:bg-stone-900/50">
    <!-- Page header -->
    <div class="h-16 flex items-center justify-between px-6 py-4">
      <div class="flex items-center gap-3">
        <!-- Page number — dark stone, not black -->
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-stone-600 text-xs font-semibold text-stone-100 dark:bg-stone-700">
          {{ page.pageNr }}
        </span>
      </div>

      <!-- Controls: pencil visible whenever page has content; save/cancel when editing -->
      <div class="flex items-center gap-1">
        <Button
          v-if="hasContent && !isEditing"
          variant="ghost"
          size="icon"
          class="h-8 w-8 text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200"
          @click="startEditing"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" class="h-4 w-4">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
            />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 7.125L18 8.625" />
          </svg>
        </Button>
        <template v-if="isEditing">
          <Button
            size="sm"
            class="bg-stone-700 text-stone-100 hover:bg-stone-600 dark:bg-stone-600 dark:hover:bg-stone-500"
            @click="saveEdit"
          >
            {{ t('common.save') }}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="text-stone-500 hover:text-stone-700 dark:text-stone-400"
            @click="cancelEdit"
          >
            {{ t('common.cancel') }}
          </Button>
        </template>
      </div>
    </div>

    <!-- Subtle divider -->
    <div class="mx-6 h-px bg-stone-200 dark:bg-stone-800" />

    <!-- Content area -->
    <div class="flex-1 px-6 py-5 overflow-y-auto mb-4 scrollbar-saga">
      <!-- User note -->
      <div
        v-if="page.userNote"
        class="mb-4 rounded-lg bg-stone-100 px-3 py-2 text-xs italic text-stone-500 dark:bg-stone-800/60 dark:text-stone-400"
      >
        {{ page.userNote }}
      </div>

      <!-- Skeleton while generating -->
      <div v-if="isLoading" class="space-y-4">
        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div class="h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div class="h-4 w-11/12 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        </div>
        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div class="h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div class="h-4 w-10/12 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div class="h-4 w-9/12 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        </div>
        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div class="h-4 w-full animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
          <div class="h-4 w-8/12 animate-pulse rounded bg-stone-200 dark:bg-stone-800" />
        </div>
      </div>

      <!-- Reading mode -->
      <div v-else-if="!isEditing">
        <p
          v-for="(paragraph, idx) in paragraphs"
          :key="idx"
          class="mb-3 text-[15px] leading-relaxed text-stone-700 last:mb-0 dark:text-stone-200"
          v-html="paragraph.replace(/\*(.*?)\*/g, '<em>$1</em>')"
          />
      </div>
      <!-- Edit mode — flush textarea, no inner card border -->
      <div v-else>
        <textarea
          
          ref="editTextareaRef"
          v-model="editContent"
          class="w-full resize-none bg-transparent py-1 text-[15px] leading-relaxed text-stone-800 placeholder:text-stone-400 focus:outline-none dark:text-stone-200"
        />
      </div>
    </div>
  </div>
</template>
