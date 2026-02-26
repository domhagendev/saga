<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed, watch } from 'vue'
import type { StoryPage } from '@/stores/book'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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
  <Card>
    <CardHeader class="flex-row items-center justify-between space-y-0 pb-3">
      <div class="flex items-center gap-3">
        <span
          class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground"
        >
          {{ page.pageNr }}
        </span>
        <Badge v-if="page.targetMood" variant="secondary">
          {{ page.targetMood }}
        </Badge>
      </div>
      <div v-if="!isEditing">
        <Button variant="ghost" size="sm" @click="startEditing">
          {{ t('common.edit') }}
        </Button>
      </div>
      <div v-else class="flex gap-2">
        <Button size="sm" @click="saveEdit">
          {{ t('common.save') }}
        </Button>
        <Button variant="ghost" size="sm" @click="cancelEdit">
          {{ t('common.cancel') }}
        </Button>
      </div>
    </CardHeader>

    <Separator />

    <CardContent class="pt-4">
      <!-- User note -->
      <div
        v-if="page.userNote"
        class="mb-4 rounded-md bg-muted px-3 py-2 text-xs italic text-muted-foreground"
      >
        {{ page.userNote }}
      </div>

      <!-- Skeleton content while generating -->
      <div v-if="isLoading" class="space-y-4">
        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-11/12 animate-pulse rounded bg-muted" />
        </div>
        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-10/12 animate-pulse rounded bg-muted" />
          <div class="h-4 w-9/12 animate-pulse rounded bg-muted" />
        </div>
        <div class="space-y-2">
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-full animate-pulse rounded bg-muted" />
          <div class="h-4 w-8/12 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <!-- Page content - reading mode -->
      <div v-else-if="!isEditing" class="prose max-w-none prose-stone">
        <p
          v-for="(paragraph, idx) in paragraphs"
          :key="idx"
          class="mb-3 text-[15px] leading-relaxed text-foreground last:mb-0"
          v-html="paragraph.replace(/\*(.*?)\*/g, '<em>$1</em>')"
        />
      </div>

      <!-- Page content - editing mode -->
      <Textarea
        v-else
        v-model="editContent"
        class="min-h-[400px] resize-y text-[15px] leading-relaxed"
      />
    </CardContent>
  </Card>
</template>
