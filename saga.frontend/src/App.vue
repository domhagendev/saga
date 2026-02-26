<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { useWorkspaceLoaderStore } from '@/stores/workspaceLoader'
import AppHeader from '@/components/layout/AppHeader.vue'
import LoadingOverlay from '@/components/layout/LoadingOverlay.vue'

const themeStore = useThemeStore()
themeStore.init()

const loaderStore = useWorkspaceLoaderStore()
</script>

<template>
  <AppHeader />
  <RouterView />
  <LoadingOverlay :visible="loaderStore.isLoading" />
</template>
