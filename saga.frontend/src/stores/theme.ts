import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  function init() {
    // Light mode only — dark mode disabled
    document.documentElement.classList.remove('dark')
  }

  return { isDark, init }
})
