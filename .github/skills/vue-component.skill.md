---
name: "Vue Component Scaffold"
description: "Generate a new Vue 3 component following Saga project conventions"
---

# Vue Component Scaffold Skill

Creates a new Vue 3 SFC component following Saga project conventions.

## Decision: Component vs View

| Type | Location | When to Use |
|---|---|---|
| **View** | `saga.frontend/src/views/` | Page-level route component |
| **Component** | `saga.frontend/src/components/` | Reusable UI element |
| **Layout** | `saga.frontend/src/components/layout/` | App shell (header, navigation) |
| **Auth** | `saga.frontend/src/components/auth/` | Authentication-related UI |
| **Workspace** | `saga.frontend/src/components/workspace/` | Story writing workspace components |

## Component Template

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Props
interface Props {
  // Define props with explicit types
}

const props = defineProps<Props>()

// Emits
interface Emits {
  // Define emits with explicit types
}

const emit = defineEmits<Emits>()

// Composables
const { t } = useI18n()

// State
// const someState = ref<string>('')

// Computed
// const derivedValue = computed(() => ...)
</script>

<template>
  <div>
    <!-- Use t('key') for all user-facing strings -->
    <!-- Use shadcn-vue components from @/components/ui/ -->
    <!-- Use Tailwind classes for styling -->
  </div>
</template>
```

## View Template (with route)

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold">{{ t('views.pageName.title') }}</h1>
  </div>
</template>
```

When creating a view, also add the route to `saga.frontend/src/router/index.ts`:

```typescript
{
  path: '/page-name',
  name: 'page-name',
  component: () => import('@/views/PageNameView.vue'),
}
```

## Checklist

- [ ] Uses `<script setup lang="ts">`
- [ ] No `any` types — all props/emits have explicit types
- [ ] All user-facing strings use `t('key')` from `useI18n()`
- [ ] Translation keys added to both `src/locales/en.json` and `src/locales/sv.json`
- [ ] Uses shadcn-vue components from `@/components/ui/` (not raw HTML)
- [ ] Styled with Tailwind classes (no `<style>` blocks unless necessary)
- [ ] Dark/light theme compatible (uses CSS variables, no hardcoded colors)
- [ ] Does NOT modify files in `src/components/ui/`

## shadcn-vue Import Example

```typescript
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
```
