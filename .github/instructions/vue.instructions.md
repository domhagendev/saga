---
name: "Vue Component Standards"
description: "Coding conventions for Vue SFC files"
applyTo: "saga.frontend/**/*.vue"
---

# Vue Component Standards

## Script Setup
- Always use `<script setup lang="ts">`
- Use `defineProps<T>()` with TypeScript interface for props
- Use `defineEmits<T>()` with TypeScript interface for events
- Use `defineExpose` only when parent needs access

## Composition API
- Prefer composables (`use*`) over mixins
- Keep composables in `src/composables/`
- Destructure `ref`, `computed`, `watch` from `vue`

## Component Structure Order
1. `<script setup lang="ts">` — imports, props, emits, composables, reactive state, computed, watchers, functions
2. `<template>` — single root element preferred, use semantic HTML
3. `<style scoped>` — scoped styles, use Tailwind classes in template instead when possible

## shadcn-vue
- Import from `@/components/ui/` — e.g., `import { Button } from '@/components/ui/button'`
- Do NOT modify files in `src/components/ui/` — they are managed by shadcn-vue CLI
- Create wrapper components in `src/components/` if you need custom behavior

## i18n
- Use `const { t } = useI18n()` for translations
- All user-facing strings must use `t('key')` — no hardcoded strings
- Keys follow dot notation: `views.main.title`, `common.login`

## Routing
- Page-level components go in `src/views/` and match the route name
- Use `<RouterLink>` for navigation, not programmatic `router.push` in templates
