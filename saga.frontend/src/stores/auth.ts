import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useDevAuth, isDevMode } from '@/composables/useDevAuth'

export const useAuthStore = defineStore('auth', () => {
  const auth = isDevMode() ? useDevAuth() : useAuth0()

  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = auth

  const userId = computed(() => user.value?.sub ?? null)
  const email = computed(() => user.value?.email ?? null)
  const displayName = computed(
    () => user.value?.name ?? user.value?.nickname ?? null
  )
  const avatarUrl = computed(() => user.value?.picture ?? null)

  async function login() {
    await loginWithRedirect()
  }

  async function register() {
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    })
  }

  function logoutUser() {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
  }

  async function getToken(): Promise<string> {
    return await getAccessTokenSilently()
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    userId,
    email,
    displayName,
    avatarUrl,
    login,
    register,
    logoutUser,
    getToken,
  }
})
