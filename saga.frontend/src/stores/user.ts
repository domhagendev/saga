import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'
import { arrivalApi, type ArrivalUserProfile } from '@/services/arrivalApi'
import { isDevMode } from '@/composables/useDevAuth'

export const useUserStore = defineStore('user', () => {
  const profile = ref<ArrivalUserProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProfile() {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated || !authStore.userId) return

    isLoading.value = true
    error.value = null

    try {
      const token = await authStore.getToken()

      // In dev mode, use lookup by email (no auth required by Arrival API)
      if (isDevMode() && authStore.email) {
        profile.value = await arrivalApi.lookupUser(authStore.email, token)
        return
      }

      profile.value = await arrivalApi.getProfile(authStore.userId, token)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load profile'
      console.error('Failed to fetch user profile:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function lookupByEmail(email: string): Promise<ArrivalUserProfile | null> {
    const authStore = useAuthStore()
    try {
      const token = await authStore.getToken()
      return await arrivalApi.lookupUser(email, token)
    } catch {
      return null
    }
  }

  function clearProfile() {
    profile.value = null
    error.value = null
  }

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    lookupByEmail,
    clearProfile,
  }
})
