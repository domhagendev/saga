<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import AuthDropdown from '@/components/layout/AuthDropdown.vue'

const route = useRoute()
const router = useRouter()

const isMainPage = computed(() => route.path === '/')
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3">
    <!-- Back button (hidden on main page) -->
    <button
      v-if="!isMainPage"
      class="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
      @click="router.back()"
    >
      <ArrowLeft class="h-5 w-5" />
    </button>
    <div v-else class="w-9" />

    <!-- Right side: auth -->
    <AuthDropdown />
  </header>
</template>
