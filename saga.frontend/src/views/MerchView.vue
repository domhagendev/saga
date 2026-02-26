<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <main class="mx-auto min-h-screen max-w-3xl px-4 pt-20">
    <h1 class="text-2xl font-semibold text-foreground">
      {{ t('views.merch.title') }}
    </h1>
  </main>
</template>
