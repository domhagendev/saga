import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBookStore } from '@/stores/book'

const MIN_LOADING_MS = 500

export const useWorkspaceLoaderStore = defineStore('workspaceLoader', () => {
  const isLoading = ref(false)
  const dataReady = ref(false)

  async function fetchAllData(): Promise<void> {
    const userStore = useUserStore()
    const bookStore = useBookStore()

    await userStore.fetchProfile()
    await bookStore.fetchBooks()

    if (bookStore.books.length > 0 && !bookStore.currentBook) {
      const firstBook = bookStore.books[0]
      if (firstBook) {
        await bookStore.selectBook(firstBook)
      }
    }

    dataReady.value = true
  }

  async function ensureMinDuration(startTime: number): Promise<void> {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(MIN_LOADING_MS - elapsed, 0)
    if (remaining > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, remaining))
    }
  }

  /** Load workspace data with loading overlay (used by WorkspaceView on direct nav) */
  async function loadWorkspaceData(): Promise<void> {
    isLoading.value = true
    const start = Date.now()

    try {
      await fetchAllData()
    } catch (error) {
      console.error('Failed to load workspace data:', error)
    } finally {
      await ensureMinDuration(start)
      isLoading.value = false
    }
  }

  /** Pre-fetch data, then navigate to workspace (used from MainView) */
  async function loadAndNavigate(router: Router): Promise<void> {
    isLoading.value = true
    const start = Date.now()

    try {
      await fetchAllData()
    } catch (error) {
      console.error('Failed to load workspace data:', error)
    }

    await ensureMinDuration(start)

    // Navigate first, then dismiss overlay after route settles
    await router.push('/workspace')
    await new Promise<void>((resolve) => setTimeout(resolve, 50))
    isLoading.value = false
  }

  return {
    isLoading,
    dataReady,
    loadWorkspaceData,
    loadAndNavigate,
  }
})
