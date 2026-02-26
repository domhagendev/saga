import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Book {
  bookId: string
  title: string
  globalGenre: string
  globalMood: string
  createdAt: string
  updatedAt: string
}

export interface Character {
  charId: string
  bookId: string
  name: string
  description: string
  traits: string
  motivation: string
  isActive: boolean
}

export interface Location {
  locId: string
  bookId: string
  name: string
  description: string
  atmosphere: string
}

export interface WorldRule {
  ruleId: string
  bookId: string
  title: string
  description: string
}

export interface StoryPage {
  bookId: string
  pageNr: number
  content: string
  userNote: string
  targetMood: string
  orderIndex: number
}

export interface RollingSummary {
  bookId: string
  rollingSummary: string
  lastPageIndex: number
}

export const useBookStore = defineStore('book', () => {
  const books = ref<Book[]>([])
  const currentBook = ref<Book | null>(null)
  const characters = ref<Character[]>([])
  const locations = ref<Location[]>([])
  const worldRules = ref<WorldRule[]>([])
  const pages = ref<StoryPage[]>([])
  const summary = ref<RollingSummary | null>(null)
  const isLoading = ref(false)

  const sortedPages = computed(() =>
    [...pages.value].sort((a, b) => a.orderIndex - b.orderIndex)
  )

  const activeCharacters = computed(() =>
    characters.value.filter((c) => c.isActive)
  )

  const lastTwoPages = computed(() => {
    const sorted = sortedPages.value
    return sorted.slice(-2)
  })

  function setCurrentBook(book: Book) {
    currentBook.value = book
    characters.value = []
    locations.value = []
    worldRules.value = []
    pages.value = []
    summary.value = null
  }

  function clearCurrentBook() {
    currentBook.value = null
    characters.value = []
    locations.value = []
    worldRules.value = []
    pages.value = []
    summary.value = null
  }

  return {
    books,
    currentBook,
    characters,
    locations,
    worldRules,
    pages,
    summary,
    isLoading,
    sortedPages,
    activeCharacters,
    lastTwoPages,
    setCurrentBook,
    clearCurrentBook,
  }
})
