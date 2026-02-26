<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed, watch } from 'vue'
import type { StoryPage } from '@/stores/book'

const props = defineProps<{
  page: StoryPage
}>()

const emit = defineEmits<{
  'update:content': [content: string]
}>()

const { t } = useI18n()

const isEditing = ref(false)
const editContent = ref('')

const paragraphs = computed(() =>
  props.page.content.split('\n').filter((p) => p.trim().length > 0)
)

function startEditing(): void {
  editContent.value = props.page.content
  isEditing.value = true
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
  <article class="rounded-lg border border-border bg-card p-6">
    <!-- Page header -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
        >
          {{ page.pageNr }}
        </span>
        <div>
          <span class="text-xs text-muted-foreground">
            {{ t('workspace.mood') }}: {{ page.targetMood }}
          </span>
        </div>
      </div>
      <button
        v-if="!isEditing"
        class="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        @click="startEditing"
      >
        {{ t('common.edit') }}
      </button>
      <div v-else class="flex gap-2">
        <button
          class="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
          @click="saveEdit"
        >
          {{ t('common.save') }}
        </button>
        <button
          class="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          @click="cancelEdit"
        >
          {{ t('common.cancel') }}
        </button>
      </div>
    </div>

    <!-- User note -->
    <div
      v-if="page.userNote"
      class="mb-4 rounded-md bg-muted px-3 py-2 text-xs italic text-muted-foreground"
    >
      {{ page.userNote }}
    </div>

    <!-- Page content - reading mode -->
    <div v-if="!isEditing" class="prose max-w-none prose-stone">
      <p
        v-for="(paragraph, idx) in paragraphs"
        :key="idx"
        class="mb-3 text-[15px] leading-relaxed text-foreground last:mb-0"
        v-html="paragraph.replace(/\*(.*?)\*/g, '<em>$1</em>')"
      />
    </div>

    <!-- Page content - editing mode -->
    <textarea
      v-else
      v-model="editContent"
      class="min-h-[400px] w-full resize-y rounded-md border border-input bg-background p-4 text-[15px] leading-relaxed text-foreground focus:border-ring focus:outline-none"
    />
  </article>
</template>
