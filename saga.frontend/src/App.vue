<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import AppHeader from '@/components/layout/AppHeader.vue'

const themeStore = useThemeStore()
themeStore.init()
</script>

<template>
  <AppHeader />
  <RouterView />
</template>
