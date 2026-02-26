# Saga — Architecture Decision Records

## ADR-001: Monorepo Structure
**Date:** 2026-02-22 | **Status:** Accepted

Use a single monorepo with `saga.frontend/`, `saga.backend/`, and `saga.copilot/` directories. Consistent with the existing `arrival/` project pattern. Simplifies CI/CD and cross-project references.

## ADR-002: Azure Table Storage over SQL
**Date:** 2026-02-22 | **Status:** Accepted

The story engine data model (Books, Characters, Locations, Rules, Pages, Summaries) is entity-oriented with varied schemas per entity type. Azure Table Storage's schemaless design fits naturally. SQL would require complex JOIN operations that aren't needed. Single table design (`SagaEntities`) with PartitionKey = `User_{UserId}` provides clean multi-tenant isolation.

## ADR-003: Bicep over Terraform
**Date:** 2026-02-22 | **Status:** Accepted

Azure-only project benefits from native Bicep tooling and first-class AVM support. No multi-cloud requirement. Consistent with arrival project.

## ADR-004: pnpm with Hoisted Deploy Fix
**Date:** 2026-02-22 | **Status:** Accepted

pnpm for fast installs and strict dependency resolution. The symlink issue with Azure Functions zip deploy is solved by generating `.npmrc` with `node-linker=hoisted` at deploy time only (not committed). Proven pattern from the arrival project.

## ADR-005: Dual Gemini Models (Flash + Pro)
**Date:** 2026-02-22 | **Status:** Accepted

- **Gemini 2.0 Flash:** Page generation, hashtag autocomplete, JSON extraction — speed is critical for UX.
- **Gemini 1.5 Pro:** World logic validation, consistency checks — deep reasoning needed to catch inconsistencies.

Model selection is task-based, not user-configurable (keeps UX simple).

## ADR-006: User Management via Arrival API
**Date:** 2026-02-22 | **Status:** Accepted

User registration and profile management handled by the existing Arrival API (`func-arrival-api-dev.azurewebsites.net`). Saga doesn't duplicate user tables. After Auth0 registration, Saga calls `POST /api/register` to create the user record in Arrival's table storage.

## ADR-007: shadcn-vue for UI Components
**Date:** 2026-02-22 | **Status:** Accepted

Fully customizable, Vue-native, Tailwind-integrated component library. Dark/light themes via CSS custom properties. Components are copied into the project (not imported from npm) so they can be extended without forking.

## ADR-008: Single Table Design with RowKey Prefixes
**Date:** 2026-02-22 | **Status:** Accepted

All entity types in one `SagaEntities` table, differentiated by RowKey prefix (`BOOK_`, `CHAR_`, `LOC_`, `RULE_`, `PAGE_`, `SUM_`). PartitionKey = `User_{UserId}` for multi-tenant isolation. This avoids creating many small tables and simplifies operations.

## ADR-009: Sliding Window Prompt Strategy
**Date:** 2026-02-22 | **Status:** Accepted

Never send the full book to Gemini. Instead, assemble context in layers: system instruction (world rules + characters + locations) → rolling summary → last 2 full pages → user beat instruction. Keeps token usage bounded regardless of book length.

## ADR-010: Node.js 22 on Windows Consumption Plan
**Date:** 2026-02-22 | **Status:** Accepted

Windows consumption plan (Y1) for Azure Functions. Node.js 22 LTS for latest language features. Windows chosen for reliability with Azure Functions consumption tier.

## ADR-011: Content Chunking for Pages >64KB
**Date:** 2026-02-22 | **Status:** Accepted

Azure Table Storage limits individual properties to 64KB. Page content is split into `content_1`, `content_2`, etc. properties when exceeding the limit. A shared utility handles split/join operations.
