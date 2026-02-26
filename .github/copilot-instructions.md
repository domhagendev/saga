# Saga — Copilot Project Instructions

## Tech Stack
- **Frontend:** Vue 3 (Composition API, `<script setup lang="ts">`), Vite, Tailwind CSS v4, shadcn-vue
- **Backend:** Azure Functions v4 (Node.js 22, TypeScript, Windows Consumption Plan)
- **Database:** Azure Table Storage (single `SagaEntities` table, PartitionKey = `User_{UserId}`)
- **AI:** Google Gemini SDK (`@google/generative-ai`) — Gemini 2.0 Flash (speed) + Gemini 1.5 Pro (reasoning)
- **Auth:** Auth0 (`@auth0/auth0-vue`)
- **User Management:** External Arrival API (`func-arrival-api-dev.azurewebsites.net`)
- **IaC:** Bicep with Azure Verified Modules (AVM)
- **Hosting:** Azure Static Web Apps (frontend), Azure Functions consumption plan (backend)
- **Package Manager:** pnpm
- **Languages:** TypeScript everywhere (strict mode)

## Project Layout
- `saga.frontend/` — Vue 3 SPA (Static Web App)
- `saga.backend/` — Azure Functions API + Bicep IaC
- `saga.copilot/` — Agent memory, architecture docs, decision log
- `.github/agents/` — Custom Copilot agents (7 agents)
- `.github/skills/` — Reusable agent skills (8 skills)
- `.github/instructions/` — File-scoped coding rules (4 instruction files)
- `.github/workflows/` — CI/CD pipelines (3 workflows)

## Secret Management Rule
- **Schema Reference:** Always use `.env.example` as the source of truth for required variable names.
- **Local Storage:** All real secrets must stay in `.env.local` (gitignored).
- **Injection:** When generating config files (`local.settings.json`, Bicep params, etc.), use placeholders like `{{DB_PASSWORD}}` and instruct the user to sync their `.env.local`.
- **Safety:** NEVER output a plain-text password, client secret, API key, or connection string in a chat response. If you see a real secret in a file, mask it as `****`.
- **Frontend secrets:** Only `VITE_`-prefixed variables are exposed to the browser. Never put `AUTH0_CLIENT_SECRET` or `GEMINI_API_KEY` in frontend code.

## Required Reading
Before starting any session involving agents, read `saga.copilot/MEMORY.md` for current project state.

## Coding Conventions
- Use `<script setup lang="ts">` for all Vue components
- Prefer `defineProps` and `defineEmits` compiler macros
- Use Pinia for state management (`saga.frontend/src/stores/`)
- Use composables for reusable logic (`saga.frontend/src/composables/`)
- API calls go through `saga.frontend/src/services/`
- shadcn-vue primitives live in `saga.frontend/src/components/ui/` — do not edit directly
- Custom components go in `saga.frontend/src/components/`
- Views (page-level route components) go in `saga.frontend/src/views/`
- No `any` types — use explicit types with interfaces/enums
- Use `DefaultAzureCredential` for all Azure SDK calls (RBAC, not connection strings)
- Use Azure Verified Modules (AVM) for Bicep over raw resource blocks when available
- All Azure resources default to **North Europe** location and **free tier** pricing

## Build Commands
```bash
# Frontend
cd saga.frontend && pnpm install && pnpm dev    # dev server
cd saga.frontend && pnpm build                   # production build → dist/

# Backend
cd saga.backend && pnpm install && pnpm start    # local Azure Functions
cd saga.backend && pnpm run build                # compile TypeScript → dist/
```

## i18n
- Two languages: Swedish (`sv`) and English (`en`)
- Locale files: `saga.frontend/src/locales/{en,sv}.json`
- Use `vue-i18n` with `useI18n()` composable in components

## Theme
- Dark and light mode via shadcn-vue CSS variables
- Toggle via `class="dark"` on the `<html>` element
- User preference stored in `localStorage` and synced to Pinia store

## Story Engine — Key Patterns
- **Table Storage Design:** Single table `SagaEntities`, PartitionKey = `User_{UserId}`, RowKey prefix encodes entity type: `BOOK_`, `CHAR_`, `LOC_`, `RULE_`, `PAGE_`, `SUM_`
- **Gemini Model Routing:** Use `gemini-2.0-flash` for page generation, autocomplete, and JSON extraction. Use `gemini-1.5-pro` for world logic validation and deep reasoning tasks.
- **Sliding Window Prompt:** Never send the full book. Assemble: system instruction (world rules) → rolling summary → last 2 full pages → user beat instruction.
- **Content Chunking:** Page content exceeding 64KB must be split into `content_1`, `content_2`, etc. properties.
- **Hashtag Mentions:** When user types `#`, filter CHAR_, LOC_, RULE_ entities. Tagged entities are always included in AI context.

## External APIs
- **User Lookup:** `GET https://func-arrival-api-dev.azurewebsites.net/api/user/lookup` (query by email)
- **User Profile:** `GET/PATCH https://func-arrival-api-dev.azurewebsites.net/api/user/{userId}/profile`
- **Register User:** `POST https://func-arrival-api-dev.azurewebsites.net/api/register`

## Azure Resources
- **Resource Group:** `rg-saga-weu-dev` (existing, all Saga resources go here)
- **Location:** North Europe
- **Pricing:** Free tier wherever available, otherwise cheapest development tier
