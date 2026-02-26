# Saga — Architecture

> Last updated: 2026-02-26

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Vue 3 SPA (saga.frontend)               │    │
│  │  Tailwind v4 + shadcn-vue + Pinia + Vue Router      │    │
│  │  Hosted: swa-saga-dev (Azure Static Web Apps)        │    │
│  └──────────┬──────────────────┬───────────────────┘    │
│             │                  │                         │
└─────────────┼──────────────────┼─────────────────────────┘
              │                  │
    ┌─────────▼──────┐  ┌───────▼──────────┐
    │    Auth0        │  │  Saga Backend     │
    │  (Login/JWT)    │  │  func-saga-api-dev│
    │  + useDevAuth   │  │  Azure Functions  │
    │  (localhost)    │  │  (Node.js 22)     │
    └─────────┬──────┘  └───┬──────┬────────┘
              │             │      │
              │    ┌────────▼──┐  ┌▼───────────────┐
              │    │  Azure     │  │  Google Gemini  │
              │    │  Table     │  │  2.0 Flash      │
              │    │  Storage   │  │  (free tier)    │
              │    │ stsagadev  │  └─────────────────┘
              │    └───────────┘
              │
    ┌─────────▼──────────────────┐
    │  Arrival API (External)     │
    │  func-arrival-api-dev       │
    │  /register, /lookup,        │
    │  /user/{id}/profile         │
    └────────────────────────────┘
```

## CI/CD Pipeline (GitHub Actions)

```
Push to main
    │
    ├─► Job 1: Deploy Infrastructure (Bicep)
    │     └── az arm-deploy → rg-saga-weu-dev
    │         (idempotent/incremental — only adds/updates, never removes)
    │         Passes: geminiApiKey=${{ secrets.GEMINI_API_KEY }}
    │
    ├─► Job 2: Deploy Backend (needs: infra)
    │     └── pnpm build → zip → az functionapp deployment source config-zip
    │         (node-linker=hoisted .npmrc for flat node_modules)
    │
    └─► Job 3: Deploy Frontend (needs: infra)
          └── pnpm build → Azure/static-web-apps-deploy@v1
              (VITE_* env vars from GitHub vars)
```

## Table Storage Schema: `SagaEntities`

All entities share one table. `PartitionKey = User_{UserId}` ensures multi-tenant isolation.

### Book
| Field | Type | Description |
|---|---|---|
| **PartitionKey** | string | `User_{UserId}` |
| **RowKey** | string | `BOOK_{BookId}` |
| `title` | string | Book title |
| `globalGenre` | string | Primary genre (fantasy, sci-fi, etc.) |
| `globalMood` | string | Overall mood (dark, whimsical, etc.) |
| `createdAt` | string | ISO 8601 timestamp |
| `updatedAt` | string | ISO 8601 timestamp |

### Character
| Field | Type | Description |
|---|---|---|
| **PartitionKey** | string | `User_{UserId}` |
| **RowKey** | string | `CHAR_{BookId}_{CharId}` |
| `name` | string | Character name |
| `description` | string | Physical/background description |
| `traits` | string | Personality traits (comma-separated or JSON) |
| `motivation` | string | What drives this character |
| `isActive` | boolean | Whether included in AI context by default |

### Location
| Field | Type | Description |
|---|---|---|
| **PartitionKey** | string | `User_{UserId}` |
| **RowKey** | string | `LOC_{BookId}_{LocId}` |
| `name` | string | Location name |
| `description` | string | Physical description |
| `atmosphere` | string | Mood/feeling of the place |

### World Rule
| Field | Type | Description |
|---|---|---|
| **PartitionKey** | string | `User_{UserId}` |
| **RowKey** | string | `RULE_{BookId}_{RuleId}` |
| `title` | string | Rule title (e.g., "Magic System") |
| `description` | string | Detailed rule description |

### Story Page
| Field | Type | Description |
|---|---|---|
| **PartitionKey** | string | `User_{UserId}` |
| **RowKey** | string | `PAGE_{BookId}_{PageNr}` |
| `content_1` | string | Page text chunk 1 (max 64KB) |
| `content_2` | string | Page text chunk 2 (if needed) |
| `content_N` | string | Additional chunks as needed |
| `userNote` | string | User's beat instruction |
| `targetMood` | string | Desired mood for this page |
| `orderIndex` | number | Page sequence number |

### Summary
| Field | Type | Description |
|---|---|---|
| **PartitionKey** | string | `User_{UserId}` |
| **RowKey** | string | `SUM_{BookId}` |
| `rollingSummary` | string | Condensed narrative history |
| `lastPageIndex` | number | Last page included in summary |

## Sliding Window Prompt Flow

```
┌──────────────────────────────────────────────────────┐
│              SYSTEM INSTRUCTION                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────┐   │
│  │ World Rules  │  │  Characters  │  │ Locations │   │
│  │ RULE_*       │  │  CHAR_*      │  │ LOC_*     │   │
│  └─────────────┘  └──────────────┘  └──────────┘   │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│              USER MESSAGE                             │
│                                                       │
│  1. Rolling Summary (SUM_{BookId})                   │
│     "Pages 1-8: Erik discovered..."                  │
│                                                       │
│  2. Last 2 Pages (PAGE_{BookId}_{N-1}, PAGE_.._{N})  │
│     Full text for prose style continuity              │
│                                                       │
│  3. User Beat + #Hashtag Entities                    │
│     "#Erik meets #TheDragon in #DeepForest"          │
│     + injected entity definitions                    │
└──────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│              AI RESPONSE                              │
│  Generated page text                                  │
│  → Stored as PAGE_{BookId}_{N+1}                     │
│  → Triggers rolling summary update                   │
└──────────────────────────────────────────────────────┘
```

## Authentication Flow

```
1. User clicks Login → Auth0 Universal Login
2. Auth0 returns JWT → stored in memory (not localStorage)
3. If new user → POST /api/register to Arrival API
4. Frontend fetches profile → GET /api/user/{userId}/profile
5. Protected API calls → JWT in Authorization header
6. Backend validates JWT → extracts userId for PartitionKey

Dev mode shortcut (localhost only):
1. useDevAuth composable auto-authenticates
2. Sends x-user-id header (hardcoded: 6077a911-81fb-43f8-b325-2c1f79d37c1e)
3. No Auth0 round-trip needed for local development
```

## RBAC Relationships

| Source | Target | Role |
|---|---|---|
| Function App MI (`b21f62da-...`) | Storage Account `stsagadev` | Storage Table Data Contributor |
| Dev User (`7b70e7fb-...`) | Storage Account `stsagadev` | Storage Table Data Contributor |
| Frontend SPA | Function App | API calls with Auth0 JWT (or x-user-id in dev) |
| Frontend SPA | Arrival API | API calls with Auth0 JWT |

## Function App Settings (func-saga-api-dev)

| Setting | Value | Source |
|---|---|---|
| `AZURE_STORAGE_ACCOUNT` | `stsagadev` | Bicep |
| `GEMINI_API_KEY` | (secret) | GitHub Actions secret → Bicep param |
| `FUNCTIONS_WORKER_RUNTIME` | `node` | Bicep |
| `WEBSITE_NODE_DEFAULT_VERSION` | `~22` | Bicep |
| `WEBSITE_RUN_FROM_PACKAGE` | `1` | Bicep |
| `AUTH0_DOMAIN` | (configurable) | Bicep param |
| `AUTH0_API_IDENTIFIER` | (configurable) | Bicep param |
