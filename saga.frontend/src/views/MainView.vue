<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useWorkspaceLoaderStore } from '@/stores/workspaceLoader'
import { Button } from '@/components/ui/button'
import AuthDropdown from '@/components/layout/AuthDropdown.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const loaderStore = useWorkspaceLoaderStore()

async function handleWorkspaceClick(): Promise<void> {
  if (loaderStore.isLoading) return

  if (authStore.isAuthenticated) {
    await loaderStore.loadAndNavigate(router)
  } else {
    await authStore.login()
  }
}
</script>

<template>
  <div class="fixed right-4 top-4 z-50">
    <AuthDropdown />
  </div>
  <main class="flex min-h-screen flex-col items-center justify-center px-4">
    <!-- Background image — hidden on mobile, covers full screen on md+ -->
    <img
      src="@/assets/bg_main.png"
      alt=""
      aria-hidden="true"
      class="pointer-events-none fixed inset-0 hidden h-full w-full object-fill md:block"
    />

    <div class="relative z-10 flex flex-col items-center gap-8">

      <!-- Title -->
      <h1 class="text-5xl font-light pl-[0.5em] tracking-[0.5em] text-foreground text-gray-500">
        {{ t('views.main.title') }}
      </h1>

      <!-- Navigation -->
      <nav class="flex items-center gap-6 text-m text-muted-foreground">
        <Button
          variant="outline"
          :disabled="loaderStore.isLoading"
          class="border-[#bcd3c5] bg-[#bcd3c5] px-12 text-lg text-white hover:border-[#dce8d7] hover:bg-[#dce8d7] hover:text-white"
          @click="handleWorkspaceClick"
        >
          {{ t('nav.workspace') }}
        </Button>
      </nav>
    </div>
  </main>
</template>
