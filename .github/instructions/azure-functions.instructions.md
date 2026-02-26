---
name: "Azure Functions Standards"
description: "Coding conventions for Azure Functions (Node.js v4, Node.js 22)"
applyTo: "saga.backend/src/**/*.ts"
---

# Azure Functions Standards (Node.js v4)

## Programming Model
- Use the **v4 programming model** (`@azure/functions` v4)
- Register functions with `app.http()`, `app.timer()`, etc.
- Each function in its own file under `src/functions/`

## Runtime
- **Node.js 22** on **Windows Consumption Plan** (Y1)
- TypeScript compiled to `dist/` via `tsc`

## Authentication & Authorization
- Use `DefaultAzureCredential` from `@azure/identity` for all Azure SDK calls
- Never use connection strings or account keys
- RBAC roles are assigned via Bicep IaC — functions only need identity

## Azure Table Storage
- Use `@azure/data-tables` SDK (`TableClient`, `TableServiceClient`)
- Single table design: `SagaEntities`
- `PartitionKey = User_{UserId}`, RowKey prefix encodes entity type
- Entity types: `BOOK_`, `CHAR_`, `LOC_`, `RULE_`, `PAGE_`, `SUM_`

## Gemini SDK
- Use `@google/generative-ai` for AI operations
- `GEMINI_API_KEY` from `process.env` — NEVER expose to frontend
- Route to `gemini-2.0-flash` for speed tasks, `gemini-1.5-pro` for reasoning
- Use `systemInstruction` for persistent world rules

## Content Chunking
- Azure Table Storage has 64KB per-property limit
- Use `src/utils/chunking.ts` to split/join large page content
- Properties named `content_1`, `content_2`, etc.

## Error Handling
- Return proper HTTP status codes: 200, 201, 400, 401, 404, 500
- Use `HttpResponseInit` typed responses
- Log errors with `context.log` or `context.error`
- Never expose stack traces to clients in production

## Environment Variables
- Access via `process.env.VARIABLE_NAME`
- All required variables defined in `.env.example`
- Local development uses `local.settings.json` (gitignored)
- Production uses Azure App Settings configured via Bicep
