import { isDevMode } from '@/composables/useDevAuth'

const BASE_URL = import.meta.env.VITE_ARRIVAL_API_BASE_URL

export interface ArrivalUserProfile {
  userId: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

interface RegisterPayload {
  email: string
  displayName: string
  auth0Id: string
}

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  }

  // Only send Authorization header when not in dev mode
  if (!isDevMode()) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    throw new Error(`Arrival API error: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export const arrivalApi = {
  async lookupUser(email: string, token: string): Promise<ArrivalUserProfile> {
    return request<ArrivalUserProfile>(
      `/user/lookup?email=${encodeURIComponent(email)}`,
      token
    )
  },

  async getProfile(userId: string, token: string): Promise<ArrivalUserProfile> {
    return request<ArrivalUserProfile>(`/user/${userId}/profile`, token)
  },

  async updateProfile(
    userId: string,
    data: Partial<ArrivalUserProfile>,
    token: string
  ): Promise<ArrivalUserProfile> {
    return request<ArrivalUserProfile>(`/user/${userId}/profile`, token, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  async registerUser(
    payload: RegisterPayload,
    token: string
  ): Promise<ArrivalUserProfile> {
    return request<ArrivalUserProfile>('/register', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
