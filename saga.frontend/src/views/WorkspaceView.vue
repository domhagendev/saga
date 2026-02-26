<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref, computed } from 'vue'
import { useBookStore } from '@/stores/book'
import { useWorkspaceLoaderStore } from '@/stores/workspaceLoader'
import type { Character, Location, WorldRule } from '@/stores/book'
import BookSidebar from '@/components/workspace/BookSidebar.vue'
import StoryPageComponent from '@/components/workspace/StoryPage.vue'
import StoryPageSkeleton from '@/components/workspace/StoryPageSkeleton.vue'
import BeatInput from '@/components/workspace/BeatInput.vue'
import CharacterPanel from '@/components/workspace/CharacterPanel.vue'
import LocationPanel from '@/components/workspace/LocationPanel.vue'
import WorldRulesPanel from '@/components/workspace/WorldRulesPanel.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const { t } = useI18n()
const bookStore = useBookStore()
const loaderStore = useWorkspaceLoaderStore()

const currentPageNr = ref(1)
const isGenerating = ref(false)
const isInitialized = ref(loaderStore.dataReady)

const currentPage = computed(() =>
  bookStore.sortedPages.find((p) => p.pageNr === currentPageNr.value) ?? null
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
  try {
    const page = await bookStore.generatePage(beat, mood, _mentionedIds)
    if (page) {
      currentPageNr.value = page.pageNr
    }
  } finally {
    isGenerating.value = false
  }
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

function handleNewBook(): void {
  bookStore.clearCurrentBook()
}
</script>

<template>
  <main class="min-h-screen pt-16">
    <template v-if="isInitialized">
    <!-- Loading state -->
    <div v-if="bookStore.isLoading" class="flex items-center justify-center py-20">
      <div class="flex flex-col items-center gap-3">
        <svg class="h-6 w-6 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-sm text-muted-foreground">{{ t('common.loading') }}</p>
      </div>
    </div>

    <!-- No book selected — empty state -->
    <div
      v-else-if="!bookStore.currentBook"
      class="flex flex-col items-center justify-center py-20"
    >
      <div class="flex flex-col items-center gap-2 text-center">
        <svg class="h-12 w-12 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <h2 class="text-xl font-semibold text-foreground">{{ t('workspace.welcome') }}</h2>
        <p class="max-w-sm text-sm text-muted-foreground">{{ t('workspace.selectOrCreate') }}</p>
        <Button class="mt-4" @click="handleCreateBook">
          {{ t('story.newBook') }}
        </Button>
      </div>
    </div>

    <!-- Workspace layout -->
    <div v-else class="flex h-[calc(100vh-4rem)]">
      <!-- Left sidebar - Book navigation -->
      <aside class="w-64 shrink-0 border-r border-border bg-card">
        <BookSidebar
          :book="bookStore.currentBook"
          :pages="bookStore.sortedPages"
          :current-page-nr="currentPageNr"
          @select-page="handleSelectPage"
          @new-book="handleNewBook"
          @update-title="handleUpdateTitle"
        />
      </aside>

      <!-- Center - Story pages + Beat input -->
      <div class="flex flex-1 flex-col overflow-hidden">
        <ScrollArea class="flex-1">
          <div class="p-6">
            <div class="mx-auto max-w-3xl space-y-6">
              <StoryPageComponent
                v-if="currentPage"
                :page="currentPage"
                @update:content="handleUpdateContent"
              />
              <div v-else-if="!isGenerating" class="flex flex-col items-center gap-2 py-16 text-center">
                <svg class="h-10 w-10 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <p class="text-sm text-muted-foreground">{{ t('workspace.noPages') }}</p>
              </div>

              <!-- Skeleton while AI is generating -->
              <StoryPageSkeleton v-if="isGenerating" />
            </div>
          </div>
        </ScrollArea>

        <!-- Beat input - fixed at bottom -->
        <div class="shrink-0 p-4">
          <div class="mx-auto max-w-3xl">
            <Card>
              <CardContent class="p-4">
                <BeatInput
                  :characters="bookStore.characters"
                  :locations="bookStore.locations"
                  :is-generating="isGenerating"
                  @generate="handleGenerate"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <!-- Right sidebar - Atlas + Summary tabs -->
      <aside class="w-80 shrink-0 border-l border-border bg-muted/30">
        <Tabs default-value="atlas" class="flex h-full flex-col">
          <div class="shrink-0 px-2 pt-2">
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
                <Card>
                  <CardHeader class="px-4 py-3">
                    <CardTitle class="text-sm">
                      {{ t('workspace.rollingSummary') }}
                    </CardTitle>
                  </CardHeader>
                  <CardContent class="px-4 pb-4 pt-0">
                    <p v-if="bookStore.summary" class="text-sm leading-relaxed text-muted-foreground">
                      {{ bookStore.summary.rollingSummary }}
                    </p>
                    <div v-else class="flex flex-col items-center gap-2 py-6 text-center">
                      <svg class="h-8 w-8 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                      </svg>
                      <p class="text-sm italic text-muted-foreground">{{ t('workspace.noSummary') }}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </aside>
    </div>
    </template>
  </main>
</template>
