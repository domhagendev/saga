import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sagaApi } from '@/services/sagaApi'
import { useAuthStore } from '@/stores/auth'

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

  async function fetchBooks(): Promise<void> {
    const authStore = useAuthStore()
    isLoading.value = true
    try {
      const token = await authStore.getToken()
      books.value = await sagaApi.getBooks(token)
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function createBook(title: string, genre: string, mood: string): Promise<Book | null> {
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      const book = await sagaApi.createBook({ title, globalGenre: genre, globalMood: mood }, token)
      books.value.push(book)
      setCurrentBook(book)
      return book
    } catch (error) {
      console.error('Failed to create book:', error)
      return null
    }
  }

  async function updateBookTitle(title: string): Promise<void> {
    if (!currentBook.value) return
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      const updated = await sagaApi.updateBook(currentBook.value.bookId, { title }, token)
      currentBook.value = updated
      const idx = books.value.findIndex((b) => b.bookId === updated.bookId)
      if (idx !== -1) {
        books.value[idx] = updated
      }
    } catch (error) {
      console.error('Failed to update book title:', error)
    }
  }

  async function selectBook(book: Book): Promise<void> {
    setCurrentBook(book)
    const authStore = useAuthStore()
    isLoading.value = true
    try {
      const token = await authStore.getToken()
      const [chars, locs, rules, pgs, sum] = await Promise.all([
        sagaApi.getCharacters(book.bookId, token),
        sagaApi.getLocations(book.bookId, token),
        sagaApi.getWorldRules(book.bookId, token),
        sagaApi.getPages(book.bookId, token),
        sagaApi.getSummary(book.bookId, token),
      ])
      characters.value = chars
      locations.value = locs
      worldRules.value = rules
      pages.value = pgs
      summary.value = sum
    } catch (error) {
      console.error('Failed to load book data:', error)
    } finally {
      isLoading.value = false
    }
  }

  // --- Character actions ---

  async function addCharacter(data: Omit<Character, 'charId' | 'bookId'>): Promise<Character | null> {
    if (!currentBook.value) return null
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      const char = await sagaApi.createCharacter(currentBook.value.bookId, data, token)
      characters.value.push(char)
      return char
    } catch (error) {
      console.error('Failed to create character:', error)
      return null
    }
  }

  async function toggleCharacter(charId: string): Promise<void> {
    if (!currentBook.value) return
    const char = characters.value.find((c) => c.charId === charId)
    if (!char) return
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      const updated = await sagaApi.updateCharacter(
        currentBook.value.bookId,
        charId,
        { isActive: !char.isActive },
        token
      )
      const idx = characters.value.findIndex((c) => c.charId === charId)
      if (idx !== -1) characters.value[idx] = updated
    } catch (error) {
      console.error('Failed to toggle character:', error)
    }
  }

  async function removeCharacter(charId: string): Promise<void> {
    if (!currentBook.value) return
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      await sagaApi.deleteCharacter(currentBook.value.bookId, charId, token)
      characters.value = characters.value.filter((c) => c.charId !== charId)
    } catch (error) {
      console.error('Failed to delete character:', error)
    }
  }

  // --- Location actions ---

  async function addLocation(data: Omit<Location, 'locId' | 'bookId'>): Promise<Location | null> {
    if (!currentBook.value) return null
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      const loc = await sagaApi.createLocation(currentBook.value.bookId, data, token)
      locations.value.push(loc)
      return loc
    } catch (error) {
      console.error('Failed to create location:', error)
      return null
    }
  }

  async function removeLocation(locId: string): Promise<void> {
    if (!currentBook.value) return
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      await sagaApi.deleteLocation(currentBook.value.bookId, locId, token)
      locations.value = locations.value.filter((l) => l.locId !== locId)
    } catch (error) {
      console.error('Failed to delete location:', error)
    }
  }

  // --- World Rule actions ---

  async function addRule(data: Omit<WorldRule, 'ruleId' | 'bookId'>): Promise<WorldRule | null> {
    if (!currentBook.value) return null
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      const rule = await sagaApi.createWorldRule(currentBook.value.bookId, data, token)
      worldRules.value.push(rule)
      return rule
    } catch (error) {
      console.error('Failed to create world rule:', error)
      return null
    }
  }

  async function removeRule(ruleId: string): Promise<void> {
    if (!currentBook.value) return
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      await sagaApi.deleteWorldRule(currentBook.value.bookId, ruleId, token)
      worldRules.value = worldRules.value.filter((r) => r.ruleId !== ruleId)
    } catch (error) {
      console.error('Failed to delete world rule:', error)
    }
  }

  // --- Page actions ---

  async function generatePage(userNote: string, targetMood: string, mentionedIds: string[]): Promise<StoryPage | null> {
    if (!currentBook.value) return null
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      const page = await sagaApi.generatePage(
        currentBook.value.bookId,
        { userNote, targetMood, mentionedEntities: mentionedIds },
        token
      )
      pages.value.push(page)
      // Refresh summary after page generation
      refreshSummary()
      return page
    } catch (error) {
      console.error('Failed to generate page:', error)
      return null
    }
  }

  async function editPage(pageNr: number, userNote: string, targetMood: string, mentionedIds: string[]): Promise<StoryPage | null> {
    if (!currentBook.value) return null
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      const updated = await sagaApi.editPage(
        currentBook.value.bookId,
        pageNr,
        { userNote, targetMood, mentionedEntities: mentionedIds },
        token
      )
      const idx = pages.value.findIndex((p) => p.pageNr === pageNr)
      if (idx !== -1) pages.value[idx] = updated
      return updated
    } catch (error) {
      console.error('Failed to edit page:', error)
      return null
    }
  }

  async function updatePageContent(pageNr: number, content: string): Promise<void> {
    if (!currentBook.value) return
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      const updated = await sagaApi.updatePage(currentBook.value.bookId, pageNr, { content }, token)
      const idx = pages.value.findIndex((p) => p.pageNr === pageNr)
      if (idx !== -1) pages.value[idx] = updated
    } catch (error) {
      console.error('Failed to update page:', error)
    }
  }

  // --- Summary ---

  async function refreshSummary(): Promise<void> {
    if (!currentBook.value) return
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      summary.value = await sagaApi.getSummary(currentBook.value.bookId, token)
    } catch (error) {
      console.error('Failed to refresh summary:', error)
    }
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
    fetchBooks,
    createBook,
    updateBookTitle,
    selectBook,
    addCharacter,
    toggleCharacter,
    removeCharacter,
    addLocation,
    removeLocation,
    addRule,
    removeRule,
    generatePage,
    editPage,
    updatePageContent,
    refreshSummary,
  }
})
