<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()
const isOpen = ref(false)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function handleLogin() {
  closeMenu()
  authStore.login()
}

function handleRegister() {
  closeMenu()
  authStore.register()
}

function handleLogout() {
  closeMenu()
  authStore.logoutUser()
}
</script>

<template>
  <div class="relative">
    <button
      class="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
      @click="toggleMenu"
      aria-label="Profile"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 rounded-md bg-background border border-border shadow-lg py-1 z-50"
    >
      <!-- Logged-in state -->
      <template v-if="authStore.isAuthenticated">
        <button
          class="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          @click="handleLogout"
        >
          {{ t('auth.logoutButton') }}
        </button>
      </template>

      <!-- Logged-out state -->
      <template v-else>
        <button
          class="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          @click="handleRegister"
        >
          {{ t('auth.registerButton') }}
        </button>
        <button
          class="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          @click="handleLogin"
        >
          {{ t('auth.loginButton') }}
        </button>
      </template>
    </div>

    <!-- Click outside to close -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="closeMenu"
    />
  </div>
</template>
