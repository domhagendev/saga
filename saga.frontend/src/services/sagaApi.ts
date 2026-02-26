import type { Book, Character, Location, WorldRule, StoryPage, RollingSummary } from '@/stores/book'
import { isDevMode } from '@/composables/useDevAuth'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }

  // In dev mode, pass user ID header instead of JWT bearer token
  if (isDevMode()) {
    headers['x-user-id'] = '6077a911-81fb-43f8-b325-2c1f79d37c1e'
  } else {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = await response.json() as { error?: string }
      if (body.error) detail = body.error
    } catch {
      // response body wasn't JSON
    }
    throw new Error(`Saga API error: ${response.status} ${detail}`)
  }

  return response.json() as Promise<T>
}

// --- Books ---

export const sagaApi = {
  async getBooks(token: string): Promise<Book[]> {
    return request<Book[]>('/books', token)
  },

  async getBook(bookId: string, token: string): Promise<Book> {
    return request<Book>(`/books/${bookId}`, token)
  },

  async createBook(data: Omit<Book, 'bookId' | 'createdAt' | 'updatedAt'>, token: string): Promise<Book> {
    return request<Book>('/books', token, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateBook(bookId: string, data: Partial<Book>, token: string): Promise<Book> {
    return request<Book>(`/books/${bookId}`, token, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deleteBook(bookId: string, token: string): Promise<void> {
    await request<void>(`/books/${bookId}`, token, { method: 'DELETE' })
  },

  // --- Characters ---

  async getCharacters(bookId: string, token: string): Promise<Character[]> {
    return request<Character[]>(`/books/${bookId}/characters`, token)
  },

  async createCharacter(bookId: string, data: Omit<Character, 'charId' | 'bookId'>, token: string): Promise<Character> {
    return request<Character>(`/books/${bookId}/characters`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateCharacter(bookId: string, charId: string, data: Partial<Character>, token: string): Promise<Character> {
    return request<Character>(`/books/${bookId}/characters/${charId}`, token, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deleteCharacter(bookId: string, charId: string, token: string): Promise<void> {
    await request<void>(`/books/${bookId}/characters/${charId}`, token, { method: 'DELETE' })
  },

  // --- Locations ---

  async getLocations(bookId: string, token: string): Promise<Location[]> {
    return request<Location[]>(`/books/${bookId}/locations`, token)
  },

  async createLocation(bookId: string, data: Omit<Location, 'locId' | 'bookId'>, token: string): Promise<Location> {
    return request<Location>(`/books/${bookId}/locations`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateLocation(bookId: string, locId: string, data: Partial<Location>, token: string): Promise<Location> {
    return request<Location>(`/books/${bookId}/locations/${locId}`, token, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deleteLocation(bookId: string, locId: string, token: string): Promise<void> {
    await request<void>(`/books/${bookId}/locations/${locId}`, token, { method: 'DELETE' })
  },

  // --- World Rules ---

  async getWorldRules(bookId: string, token: string): Promise<WorldRule[]> {
    return request<WorldRule[]>(`/books/${bookId}/rules`, token)
  },

  async createWorldRule(bookId: string, data: Omit<WorldRule, 'ruleId' | 'bookId'>, token: string): Promise<WorldRule> {
    return request<WorldRule>(`/books/${bookId}/rules`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateWorldRule(bookId: string, ruleId: string, data: Partial<WorldRule>, token: string): Promise<WorldRule> {
    return request<WorldRule>(`/books/${bookId}/rules/${ruleId}`, token, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deleteWorldRule(bookId: string, ruleId: string, token: string): Promise<void> {
    await request<void>(`/books/${bookId}/rules/${ruleId}`, token, { method: 'DELETE' })
  },

  // --- Pages ---

  async getPages(bookId: string, token: string): Promise<StoryPage[]> {
    return request<StoryPage[]>(`/books/${bookId}/pages`, token)
  },

  async generatePage(
    bookId: string,
    data: { userNote: string; targetMood: string; mentionedEntities?: string[] },
    token: string
  ): Promise<StoryPage> {
    return request<StoryPage>(`/books/${bookId}/pages/generate`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updatePage(bookId: string, pageNr: number, data: Partial<StoryPage>, token: string): Promise<StoryPage> {
    return request<StoryPage>(`/books/${bookId}/pages/${pageNr}`, token, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async deletePage(bookId: string, pageNr: number, token: string): Promise<void> {
    await request<void>(`/books/${bookId}/pages/${pageNr}`, token, { method: 'DELETE' })
  },

  // --- Summary ---

  async getSummary(bookId: string, token: string): Promise<RollingSummary> {
    return request<RollingSummary>(`/books/${bookId}/summary`, token)
  },
}
