# Saga — Project Memory

> This file is the persistent state for all Copilot agents. Read it at the start of every session.
> Last updated: 2026-02-22

## Project State

### Phase: Foundation Setup — Complete ✓

- [x] Repository initialized (monorepo structure)
- [x] Secret management (.env.example / .env.local pattern)
- [x] Copilot instructions & file-scoped rules
- [x] Custom agents defined (orchestrator, frontend, backend, infrastructure, reviewer, security, story-engine)
- [x] Skills defined (8 skills in `.github/skills/`)
- [x] MCP server configuration (azd, github, filesystem, shadcn)
- [x] VS Code workspace settings
- [x] Frontend scaffolded (Vue 3 + Vite + Tailwind v4 + shadcn-vue)
- [x] Pinia stores (theme, auth, user, book)
- [x] API services (arrivalApi, sagaApi)
- [x] Views created (Main, Workspace, About, Contact, Merch)
- [x] Layout components (AppHeader, AuthDropdown)
- [x] Auth0 integration (Vue SDK, AuthDropdown component)
- [x] i18n setup (en/sv locale files)
- [x] Dark/light theme (CSS variables + Pinia store)
- [x] Backend scaffolded (Azure Functions v4, Node.js 22, TypeScript)
- [x] Table Storage service (SagaEntities, DefaultAzureCredential)
- [x] Gemini service (dual model: Flash + Pro)
- [x] Prompt builder service (sliding window strategy)
- [x] Entity types defined (Book, Character, Location, WorldRule, StoryPage, Summary)
- [x] Azure Functions created (books, characters, locations, worldRules, pages, summary)
- [x] Content chunking utility (>64KB split/join)
- [x] Hashtag parsing utility
- [x] IaC Bicep modules (storage, function app, static web app, RBAC)
- [x] GitHub Actions workflows (deploy-frontend, deploy-backend, deploy-infrastructure)
- [x] Frontend production build verified
- [x] Backend TypeScript compilation verified
- [x] Secret scan completed (no leaks)
- [ ] shadcn-vue components installed (Button, DropdownMenu via CLI)
- [ ] Azure resources deployed

### Next Steps
1. Install shadcn-vue components via CLI (`pnpx shadcn-vue@latest init` + add Button, DropdownMenu, Card, Input, Avatar, Tooltip)
2. Deploy Azure resources via Bicep (`az deployment group create -g rg-saga-weu-dev ...`)
3. Build out story editor UI (workspace view with beat input, page display, entity panels)
4. Implement JWT auth middleware in backend functions
5. End-to-end integration testing

## Architecture

### Frontend (saga.frontend/)
- Vue 3 SPA with Composition API
- Vite build tool
- Tailwind CSS v4 + shadcn-vue component library
- Vue Router 4 for navigation (5 views)
- Pinia for state management (theme, auth, user, book stores)
- Auth0 via @auth0/auth0-vue
- vue-i18n for Swedish/English
- Hosted on Azure Static Web Apps

### Backend (saga.backend/)
- Azure Functions v4 (Node.js 22, TypeScript, Windows Consumption Plan)
- @azure/data-tables for Table Storage (SagaEntities single-table)
- @azure/identity for RBAC auth (DefaultAzureCredential)
- @google/generative-ai for Gemini SDK (2.0 Flash + 1.5 Pro)
- Sliding window prompt strategy for page generation
- Hosted on Azure Functions consumption plan

### Data Layer
- **Azure Table Storage:** Single table `SagaEntities`
  - PartitionKey: `User_{UserId}`
  - RowKey prefixes: `BOOK_`, `CHAR_`, `LOC_`, `RULE_`, `PAGE_`, `SUM_`
  - Content chunking for pages >64KB

### User Management
- **Auth0** for authentication (login, register, JWT)
- **Arrival API** for user data:
  - `POST /api/register` — create user record after Auth0 registration
  - `GET /api/user/lookup` — find user by email
  - `GET /api/user/{userId}/profile` — get user profile
  - `PATCH /api/user/{userId}/profile` — update user profile

### AI Story Engine
- **Gemini 2.0 Flash:** Page generation, autocomplete, JSON extraction
- **Gemini 1.5 Pro:** World logic validation, consistency checks
- **Sliding Window:** System instruction (world rules) → rolling summary → last 2 pages → user beat
- **Hashtag Mentions:** #EntityName resolves to full entity data in prompt context
- **Rolling Summary:** Auto-updated after page save, keeps history compact

## Azure Resources

| Resource | Resource Group | Region | Status |
|---|---|---|---|
| Storage Account (TBD) | `rg-saga-weu-dev` | North Europe | **To Be Created** |
| SagaEntities Table | `rg-saga-weu-dev` | North Europe | **To Be Created** |
| Function App (TBD) | `rg-saga-weu-dev` | North Europe | **To Be Created** |
| Static Web App (TBD) | `rg-saga-weu-dev` | North Europe | **To Be Created** |
| RBAC Role Assignment | `rg-saga-weu-dev` | — | **To Be Created** |

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
- RBAC everywhere — no connection strings
- DefaultAzureCredential for Azure SDK
- shadcn-vue components in `src/components/ui/` — do not edit directly
- VITE_ prefix for browser-exposed env vars only
- Free tier for all Azure resources
- Theme toggle: `useThemeStore().toggleTheme()` — persisted to localStorage
- Dual Gemini model strategy: Flash for speed, Pro for reasoning
- pnpm with `node-linker=hoisted` at deploy time only (not committed)

## Known Issues
- None yet (greenfield project)

## Decisions Log
See `saga.copilot/DECISIONS.md` for full ADR records.
