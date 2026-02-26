import { ref, computed, type Ref, type ComputedRef } from 'vue'

/**
 * Dev authentication bypass for localhost development.
 * Skips Auth0 entirely and uses the Arrival API user lookup
 * for domhagen.dev@outlook.com.
 */

const DEV_EMAIL = 'domhagen.dev@outlook.com'
const DEV_USER_ID = '6077a911-81fb-43f8-b325-2c1f79d37c1e'

interface DevAuthState {
  isAuthenticated: Ref<boolean>
  isLoading: Ref<boolean>
  user: ComputedRef<{
    sub: string
    email: string
    name: string
    nickname: string
    picture: string | null
  } | null>
  loginWithRedirect: () => Promise<void>
  logout: (options?: { logoutParams?: { returnTo?: string } }) => void
  getAccessTokenSilently: () => Promise<string>
}

const _isAuthenticated = ref(true)
const _isLoading = ref(false)

const _user = computed(() => ({
  sub: DEV_USER_ID,
  email: DEV_EMAIL,
  name: 'Dev User',
  nickname: 'domhagen',
  picture: null,
}))

export function useDevAuth(): DevAuthState {
  return {
    isAuthenticated: _isAuthenticated,
    isLoading: _isLoading,
    user: _user,
    loginWithRedirect: async () => {
      _isAuthenticated.value = true
    },
    logout: () => {
      _isAuthenticated.value = false
    },
    getAccessTokenSilently: async () => {
      return 'dev-token-no-auth'
    },
  }
}

export function isDevMode(): boolean {
  return import.meta.env.DEV && window.location.hostname === 'localhost'
}
