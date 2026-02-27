<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import { useWorkspaceLoaderStore } from '@/stores/workspaceLoader'
import LoadingOverlay from '@/components/layout/LoadingOverlay.vue'

const themeStore = useThemeStore()
themeStore.init()

const loaderStore = useWorkspaceLoaderStore()
</script>

<template>
  <RouterView />
  <LoadingOverlay :visible="loaderStore.isLoading" />
</template>
