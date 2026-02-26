<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

const { t } = useI18n()
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center px-4">
    <div class="flex flex-col items-center gap-8">
      <!-- Logo -->
      <img
        src="@/assets/logo_one_reading.png"
        alt="Saga"
        class="h-48 w-auto"
      />

      <!-- Title -->
      <h1 class="text-4xl font-light tracking-[0.5em] text-foreground">
        {{ t('views.main.title') }}
      </h1>

      <!-- Navigation -->
      <nav class="flex items-center gap-6 text-sm text-muted-foreground">
        <RouterLink
          to="/workspace"
          class="transition-colors hover:text-foreground"
        >
          {{ t('nav.workspace') }}
        </RouterLink>
        <span class="text-border">·</span>
        <RouterLink to="/about" class="transition-colors hover:text-foreground">
          {{ t('nav.about') }}
        </RouterLink>
        <span class="text-border">·</span>
        <RouterLink
          to="/contact"
          class="transition-colors hover:text-foreground"
        >
          {{ t('nav.contact') }}
        </RouterLink>
        <span class="text-border">·</span>
        <RouterLink to="/merch" class="transition-colors hover:text-foreground">
          {{ t('nav.merch') }}
        </RouterLink>
      </nav>
    </div>
  </main>
</template>
