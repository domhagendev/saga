<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref, computed, nextTick } from 'vue'
import { useBookStore } from '@/stores/book'
import { useWorkspaceLoaderStore } from '@/stores/workspaceLoader'
import type { Character, Location, WorldRule } from '@/stores/book'
import BookSidebar from '@/components/workspace/BookSidebar.vue'
import StoryPageComponent from '@/components/workspace/StoryPage.vue'
import BeatInput from '@/components/workspace/BeatInput.vue'
import CharacterPanel from '@/components/workspace/CharacterPanel.vue'
import LocationPanel from '@/components/workspace/LocationPanel.vue'
import WorldRulesPanel from '@/components/workspace/WorldRulesPanel.vue'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import AuthDropdown from '@/components/layout/AuthDropdown.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const { t } = useI18n()
const bookStore = useBookStore()
const loaderStore = useWorkspaceLoaderStore()

const currentPageNr = ref(1)
const isGenerating = ref(false)
const generateError = ref<string | null>(null)
const isInitialized = ref(loaderStore.dataReady)
const pageJustGenerated = ref(false)
const storyContentRef = ref<HTMLElement | null>(null)

const currentPage = computed(() =>
  bookStore.sortedPages.find((p) => p.pageNr === currentPageNr.value) ?? null
)

const isFirstPage = computed(() => bookStore.sortedPages.length === 0)

// Show edit-mode prompt when the current page already has content OR we just
// generated — this also keeps the prompt stable during the loading phase so
// the layout doesn't jump back to "What happens next? / Generate".
const showEditMode = computed(
  () => pageJustGenerated.value || (currentPage.value?.content ?? '').trim().length > 0
)

onMounted(async () => {
  // If data was not pre-fetched (e.g., direct nav or post-login redirect),
  // load it now with the loading overlay
  if (!loaderStore.dataReady) {
    await loaderStore.loadWorkspaceData()
  }

  // Navigate to the last page
  if (bookStore.sortedPages.length > 0) {
    const lastPage = bookStore.sortedPages[bookStore.sortedPages.length - 1]
    if (lastPage) {
      currentPageNr.value = lastPage.pageNr
    }
  }

  isInitialized.value = true
})

function handleSelectPage(pageNr: number): void {
  currentPageNr.value = pageNr
}

async function handleUpdateContent(content: string): Promise<void> {
  await bookStore.updatePageContent(currentPageNr.value, content)
}

async function handleGenerate(beat: string, mood: string, _mentionedIds: string[]): Promise<void> {
  isGenerating.value = true
  generateError.value = null
  // Do NOT reset pageJustGenerated here — keeps edit-mode prompt visible
  // during the loading phase when re-generating from an existing page.
  try {
    const page = await bookStore.generatePage(beat, mood, _mentionedIds)
    if (page) {
      currentPageNr.value = page.pageNr
      pageJustGenerated.value = true
      // Scroll the new page into view after DOM updates
      await nextTick()
      storyContentRef.value?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    } else {
      generateError.value = t('workspace.generateFailed')
    }
  } catch (error) {
    generateError.value = error instanceof Error ? error.message : t('workspace.generateFailed')
  } finally {
    isGenerating.value = false
  }
}

function handleDone(): void {
  const maxPageNr = bookStore.sortedPages.reduce((max, p) => Math.max(max, p.pageNr), 0)
  currentPageNr.value = maxPageNr + 1
  pageJustGenerated.value = false
}

async function handleAddCharacter(char: Omit<Character, 'charId' | 'bookId'>): Promise<void> {
  await bookStore.addCharacter(char)
}

async function handleToggleCharacter(charId: string): Promise<void> {
  await bookStore.toggleCharacter(charId)
}

async function handleRemoveCharacter(charId: string): Promise<void> {
  await bookStore.removeCharacter(charId)
}

async function handleAddLocation(loc: Omit<Location, 'locId' | 'bookId'>): Promise<void> {
  await bookStore.addLocation(loc)
}

async function handleRemoveLocation(locId: string): Promise<void> {
  await bookStore.removeLocation(locId)
}

async function handleAddRule(rule: Omit<WorldRule, 'ruleId' | 'bookId'>): Promise<void> {
  await bookStore.addRule(rule)
}

async function handleRemoveRule(ruleId: string): Promise<void> {
  await bookStore.removeRule(ruleId)
}

async function handleUpdateTitle(title: string): Promise<void> {
  await bookStore.updateBookTitle(title)
}

async function handleCreateBook(): Promise<void> {
  await bookStore.createBook('Untitled Book', 'Fantasy', 'Neutral')
}
</script>

<template>
  <main class="flex h-screen flex-col">
    <!-- Workspace header -->
    <header class="flex shrink-0 items-center justify-end border-b bg-stone-200 bg-stone-50 px-4 pt-4 dark:border-stone-800 dark:bg-stone-950">
      <AuthDropdown />
    </header>
    <template v-if="isInitialized">

    <!-- Loading state -->
    <div v-if="bookStore.isLoading" class="flex flex-1 items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <svg class="h-6 w-6 animate-spin text-stone-400 dark:text-stone-500" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-sm text-stone-400 dark:text-stone-500">{{ t('common.loading') }}</p>
      </div>
    </div>

    <!-- No book selected — empty state -->
    <div
      v-else-if="!bookStore.currentBook"
      class="flex flex-1 flex-col items-center justify-center"
    >
      <div class="flex flex-col items-center gap-2 text-center">
        <svg class="h-12 w-12 text-stone-300 dark:text-stone-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <h2 class="text-xl font-semibold text-stone-700 dark:text-stone-200">{{ t('workspace.welcome') }}</h2>
        <p class="max-w-sm text-sm text-stone-400 dark:text-stone-500">{{ t('workspace.selectOrCreate') }}</p>
        <Button class="mt-4 bg-stone-700 text-stone-100 hover:bg-stone-600 dark:bg-stone-600 dark:hover:bg-stone-500" @click="handleCreateBook">
          {{ t('story.newBook') }}
        </Button>
      </div>
    </div>

    <!-- Workspace layout -->
    <div v-else class="flex flex-1 overflow-hidden bg-stone-200">
      <div class="bg-stone-200 mx-auto flex w-full max-w-[1400px] min-w-0 overflow-hidden">
      <!-- Left sidebar - Book navigation -->
      <aside class="w-64 shrink-0 border-r border-stone-200 bg-stone-200 dark:border-stone-800 dark:bg-stone-950">
        <BookSidebar
          :book="bookStore.currentBook"
          :pages="bookStore.sortedPages"
          :current-page-nr="currentPageNr"
          @select-page="handleSelectPage"
          @update-title="handleUpdateTitle"
        />
      </aside>

      <!-- Center - Story pages + Beat input -->
      <div class="flex flex-1 flex-col overflow-hidden pb-12 bg-stone-200 dark:bg-stone-900/40">
        <div class="flex flex-1 flex-col overflow-hidden">
          <div ref="storyContentRef" class="flex min-h-0 flex-1 flex-col overflow-hidden pt-6 pb-0">
            <div class="mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col">
              <StoryPageComponent
                v-if="currentPage || isGenerating"
                :page="currentPage ?? { pageNr: (bookStore.sortedPages.length || 0) + 1, bookId: bookStore.currentBook?.bookId ?? '', content: '', userNote: '', targetMood: '', orderIndex: 0 }"
                :is-loading="isGenerating"
                class="flex-1"
                @update:content="handleUpdateContent"
              />
              <div v-else class="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <svg class="h-10 w-10 text-stone-300 dark:text-stone-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p class="text-sm text-stone-400 dark:text-stone-500">{{ t('workspace.noPages') }}</p>
              </div>

              <!-- Error message -->
              <div v-if="generateError" class="mt-6 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                <p>{{ generateError }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Beat input - fixed at bottom -->
        <div class="shrink-0 bg-stone-200 px-4 py-4 dark:border-stone-800 dark:bg-stone-950">
          <div class="mx-auto max-w-3xl">
            <BeatInput
              :characters="bookStore.characters"
              :locations="bookStore.locations"
              :is-generating="isGenerating"
              :is-first-page="isFirstPage"
              :page-just-generated="showEditMode"
              @generate="handleGenerate"
              @done="handleDone"
            />
          </div>
        </div>
      </div>

      <!-- Right sidebar - Atlas + Summary tabs -->
      <aside class="pt-6 w-80 shrink-0 border-l border-stone-200 bg-stone-200 dark:border-stone-800 dark:bg-stone-950/80">
        <Tabs default-value="atlas" class="flex h-full flex-col">
          <div class="shrink-0 px-2">
            <TabsList class="w-full">
              <TabsTrigger value="atlas" class="flex-1">
                {{ t('workspace.atlas') }}
              </TabsTrigger>
              <TabsTrigger value="summary" class="flex-1">
                {{ t('story.summary') }}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="atlas" class="mt-0 flex-1 overflow-hidden">
            <ScrollArea class="h-full">
              <div class="space-y-3 p-3">
                <CharacterPanel
                  :characters="bookStore.characters"
                  @add="handleAddCharacter"
                  @toggle="handleToggleCharacter"
                  @remove="handleRemoveCharacter"
                />

                <LocationPanel
                  :locations="bookStore.locations"
                  @add="handleAddLocation"
                  @remove="handleRemoveLocation"
                />

                <WorldRulesPanel
                  :rules="bookStore.worldRules"
                  @add="handleAddRule"
                  @remove="handleRemoveRule"
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="summary" class="mt-0 flex-1 overflow-hidden">
            <ScrollArea class="h-full">
              <div class="p-3">
                <div class="rounded-xl bg-stone-100/80 dark:bg-stone-900/60">
                  <div class="px-4 py-3">
                    <p class="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                      {{ t('workspace.rollingSummary') }}
                    </p>
                  </div>
                  <div class="px-4 pb-4 pt-0">
                    <p v-if="bookStore.summary" class="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                      {{ bookStore.summary.rollingSummary }}
                    </p>
                    <div v-else class="flex flex-col items-center gap-2 py-6 text-center">
                      <svg class="h-8 w-8 text-stone-300 dark:text-stone-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                      </svg>
                      <p class="text-sm italic text-stone-400 dark:text-stone-500">{{ t('workspace.noSummary') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </aside>
      </div>
    </div>
    </template>
  </main>
</template>
