# Saga — Project Memory

> This file is the persistent state for all Copilot agents. Read it at the start of every session.
> Last updated: 2026-02-26

## Project State

### Phase 1: Foundation Setup — Complete ✓
_(Completed 2026-02-22)_

- [x] Repository initialized (monorepo structure)
- [x] Secret management (.env.example / .env.local pattern)
- [x] Copilot instructions & file-scoped rules
- [x] Custom agents defined (7 agents in `.github/agents/`)
- [x] Skills defined (8 skills in `.github/skills/`)
- [x] MCP server configuration (azd, github, filesystem, shadcn)
- [x] VS Code workspace settings
- [x] Frontend scaffolded (Vue 3 + Vite + Tailwind v4 + shadcn-vue)
- [x] Backend scaffolded (Azure Functions v4, Node.js 22, TypeScript)
- [x] All entity types and Azure Functions defined
- [x] IaC Bicep modules + GitHub Actions CI/CD

### Phase 2: Infrastructure & Deployment — Complete ✓
_(Completed 2026-02-26)_

- [x] Azure resources deployed via Bicep (storage, function app, SWA, RBAC)
- [x] GitHub Actions CI/CD pipeline working (3 jobs: infra, backend, frontend)
- [x] OIDC federation for GitHub Actions → Azure (no stored credentials)
- [x] Function App managed identity + Storage Table Data Contributor role
- [x] SWA deployment token configured
- [x] Frontend environment variables wired via GitHub vars

### Phase 3: UI & UX Polish — Complete ✓
_(Completed 2026-02-26)_

- [x] shadcn-vue components installed (button, card, input, textarea, tabs, badge, separator, scroll-area, tooltip)
- [x] Card-style UI conversion (all workspace panels/components use shadcn Card)
- [x] Loading screen transition (LoadingOverlay + workspaceLoader store + pre-fetching)
- [x] MainView styled (hero background image, shadcn Button with cyan outline)
- [x] Header border with backdrop blur
- [x] Dark/light theme via shadcn CSS variables

### Phase 4: Story Engine Integration — Complete ✓
_(Completed 2026-02-26)_

- [x] Full AI generation pipeline (frontend → backend → Gemini → Table Storage → response)
- [x] Gemini API key configured (local + Azure Function App settings)
- [x] Backend mentionedEntities resolution (both hashtag text + frontend-provided entity IDs)
- [x] 800 character page limit in prompt builder
- [x] Skeleton loading UI during AI generation (StoryPageSkeleton.vue)
- [x] Error feedback visible in UI (generateError state + destructive banner)
- [x] 429 quota error detection and user-friendly message
- [x] sagaApi error parsing (reads response body JSON for detail)
- [x] Editable book title in sidebar (click-to-edit, Enter/blur save, Escape cancel)
- [x] Rolling summary auto-refresh after page generation

### Phase 5: Bug Fixes & Hardening — Complete ✓
_(Completed 2026-02-26)_

- [x] Fixed `AZURE_STORAGE_ACCOUNT` wrong name (`stsagaweudev` → `stsagadev`)
- [x] Fixed Bicep deployment wiping `GEMINI_API_KEY` (now passed via `${{ secrets.GEMINI_API_KEY }}`)
- [x] Fixed unused import build failure (BookSidebar.vue Card imports)
- [x] Granted local dev user `Storage Table Data Contributor` RBAC role
- [x] Dev mode bypass (useDevAuth composable — `x-user-id` header instead of JWT when localhost)

### Next Steps
1. **End-to-end test** page generation once Gemini free tier quota resets (daily reset)
2. **Enable Gemini billing** for higher daily limits (or wait for free tier reset)
3. **JWT auth middleware** in backend functions (currently x-user-id header only)
4. **Auth0 callback wiring** — post-login redirect to workspace
5. **Story page editing** — inline content editing after generation
6. **Page deletion** — allow removing generated pages
7. **Export** — ability to export book as text/PDF

## Architecture

### Frontend (saga.frontend/)
- Vue 3 SPA with Composition API (`<script setup lang="ts">`)
- Vite 7.3 build tool
- Tailwind CSS v4 (CSS-based config, no tailwind.config.js) + shadcn-vue (radix-vue 1.9)
- Vue Router 4 for navigation (5 views: Main, Workspace, About, Contact, Merch)
- Pinia 3 for state management (theme, auth, user, book, workspaceLoader stores)
- Auth0 via @auth0/auth0-vue (+ useDevAuth composable for localhost bypass)
- vue-i18n for Swedish/English
- Hosted on Azure Static Web Apps (`swa-saga-dev`)

#### Key Components
| Component | Location | Purpose |
|---|---|---|
| LoadingOverlay | `components/layout/` | Full-screen loading transition between views |
| AppHeader | `components/layout/` | Top nav bar with auth dropdown |
| AuthDropdown | `components/layout/` | Login/register/logout menu |
| BookSidebar | `components/workspace/` | Book nav, page list, editable title |
| BeatInput | `components/workspace/` | Prompt input with #mention support |
| StoryPage | `components/workspace/` | Rendered story page content |
| StoryPageSkeleton | `components/workspace/` | Shimmer placeholder during generation |
| CharacterPanel | `components/workspace/` | CRUD for characters |
| LocationPanel | `components/workspace/` | CRUD for locations |
| WorldRulesPanel | `components/workspace/` | CRUD for world rules |

#### shadcn-vue Components Installed
`button`, `card`, `input`, `textarea`, `tabs`, `badge`, `separator`, `scroll-area`, `tooltip`

### Backend (saga.backend/)
- Azure Functions v4 (Node.js 22, TypeScript 5.9, Windows Consumption Plan Y1)
- @azure/data-tables for Table Storage (SagaEntities single-table)
- @azure/identity for RBAC auth (DefaultAzureCredential)
- @google/generative-ai v0.24.0 for Gemini SDK (2.0 Flash for page generation)
- Sliding window prompt strategy for page generation
- Hosted on Azure Functions consumption plan (`func-saga-api-dev`)

### Data Layer
- **Azure Table Storage:** Single table `SagaEntities` on `stsagadev`
  - PartitionKey: `User_{UserId}`
  - RowKey prefixes: `BOOK_`, `CHAR_`, `LOC_`, `RULE_`, `PAGE_`, `SUM_`
  - Content chunking for pages >64KB

### User Management
- **Auth0** for authentication (login, register, JWT)
- **Dev mode bypass:** `useDevAuth` composable auto-authenticates on localhost with hardcoded user ID `6077a911-81fb-43f8-b325-2c1f79d37c1e`
- **Arrival API** for user data:
  - `POST /api/register` — create user record after Auth0 registration
  - `GET /api/user/lookup` — find user by email
  - `GET /api/user/{userId}/profile` — get user profile
  - `PATCH /api/user/{userId}/profile` — update user profile

### AI Story Engine
- **Gemini 2.0 Flash:** Page generation (800 character limit per page)
- **Gemini 1.5 Pro:** Available but unused currently — reserved for world logic validation
- **Sliding Window:** System instruction (world rules + chars + locs) → rolling summary → last 2 pages → user beat
- **Hashtag Mentions:** #EntityName resolves to full entity data in prompt context; also supports frontend-provided entity IDs
- **Rolling Summary:** Auto-updated after page generation, keeps history compact
- **API Key:** Gemini free tier — daily quota resets daily; for production, enable billing on Google Cloud project

## Azure Resources

| Resource | Name | Resource Group | Region | Status |
|---|---|---|---|---|
| Storage Account | `stsagadev` | `rg-saga-weu-dev` | West Europe | **Deployed** ✓ |
| SagaEntities Table | on `stsagadev` | `rg-saga-weu-dev` | West Europe | **Deployed** ✓ |
| Function App | `func-saga-api-dev` | `rg-saga-weu-dev` | West Europe | **Deployed** ✓ |
| App Service Plan | `func-saga-api-dev-plan` | `rg-saga-weu-dev` | West Europe | **Deployed** ✓ (Y1 Dynamic) |
| Static Web App | `swa-saga-dev` | `rg-saga-weu-dev` | West Europe | **Deployed** ✓ |
| RBAC: FA → Storage | Storage Table Data Contributor | `rg-saga-weu-dev` | — | **Deployed** ✓ |
| RBAC: Dev User → Storage | Storage Table Data Contributor | `rg-saga-weu-dev` | — | **Deployed** ✓ |

### Azure Subscription
- **ID:** `e0a14b25-5709-4837-9fd1-bc36fb8d081b`
- **Resource Group:** `rg-saga-weu-dev`
- **GitHub Repo:** `domhagendev/saga`

## Copilot Agents

| Agent | File | Specialization |
|---|---|---|
| Orchestrator | `.github/agents/orchestrator.agent.md` | Task decomposition, routing, state management |
| Frontend | `.github/agents/frontend.agent.md` | Vue 3, Tailwind, shadcn-vue |
| Backend | `.github/agents/backend.agent.md` | Azure Functions, Table Storage |
| Story Engine | `.github/agents/story-engine.agent.md` | Gemini SDK, prompt engineering |
| Infrastructure | `.github/agents/infrastructure.agent.md` | Bicep, AVM, RBAC |
| Reviewer | `.github/agents/reviewer.agent.md` | Code quality review |
| Security | `.github/agents/security.agent.md` | Secret scanning, auth audit |

## Copilot Skills

| Skill | File | Used By |
|---|---|---|
| Vue Component | `.github/skills/vue-component.skill.md` | frontend |
| i18n Sync | `.github/skills/i18n-sync.skill.md` | frontend |
| Azure Function | `.github/skills/azure-function.skill.md` | backend |
| Table Storage CRUD | `.github/skills/table-storage-crud.skill.md` | backend, story-engine |
| Gemini Prompt | `.github/skills/gemini-prompt.skill.md` | story-engine |
| Bicep Deploy | `.github/skills/bicep-deploy.skill.md` | orchestrator, infrastructure |
| PR Checklist | `.github/skills/pr-checklist.skill.md` | orchestrator, frontend, backend |
| pnpm Deploy | `.github/skills/pnpm-deploy.skill.md` | orchestrator |

## Key Patterns
- PartitionKey `User_{UserId}` for multi-tenant isolation
- RowKey prefix pattern for entity type discrimination
- RBAC everywhere — no connection strings (except AzureWebJobsStorage for Functions runtime)
- DefaultAzureCredential for Azure SDK
- shadcn-vue components in `src/components/ui/` — do not edit directly
- VITE_ prefix for browser-exposed env vars only
- Free tier for all Azure resources
- Theme toggle: `useThemeStore().toggleTheme()` — persisted to localStorage
- Dual Gemini model strategy: Flash for speed, Pro for reasoning (Pro not yet active)
- pnpm with `node-linker=hoisted` at deploy time only (not committed)
- Dev auth bypass: `useDevAuth` composable on localhost skips Auth0, sends `x-user-id` header
- Error feedback: visible banners in UI, backend returns structured JSON errors

## Known Issues
- **Gemini free tier quota:** Daily limit depletes quickly. Once depleted, generate returns 429. Resets daily. For production, enable billing on Google Cloud.
- **GEMINI_API_KEY in CI/CD:** Must be stored as GitHub Actions secret `GEMINI_API_KEY`. The Bicep deploy passes it via workflow parameter — if the secret is missing, the key gets blanked on deploy.
- **No JWT validation:** Backend currently trusts `x-user-id` header. JWT middleware not yet implemented.
- **Local dev RBAC propagation:** After granting `Storage Table Data Contributor`, role can take up to 10 minutes to propagate.

## Decisions Log
See `saga.copilot/DECISIONS.md` for full ADR records.
