---
name: "Bicep IaC Standards"
description: "Infrastructure as Code conventions for Azure Bicep"
applyTo: "**/*.bicep"
---

# Bicep IaC Standards

## Azure Verified Modules (AVM)
- **Always prefer AVM** over raw resource blocks when a module exists
- Reference AVM modules from the Bicep public module registry: `br/public:avm/res/<provider>/<resource>:<version>`
- Check https://azure.github.io/Azure-Verified-Modules/ for availability

## Parameters
- Use strongly typed parameters — avoid `object` or loose `string` types
- Use `@allowed` decorator for constrained values
- Use `@description` decorator on every parameter
- Use `@secure()` for secrets — never hardcode passwords or keys
- Reference secrets via parameter files; check `.env.example` for key names
- Use `{{PLACEHOLDER}}` syntax in parameter files for values that come from `.env.local`

## Security
- **RBAC over connection strings** — always assign roles via `roleAssignments` instead of passing keys
- **Managed Identity** — use System-Assigned Managed Identity; never use `client_secret` in IaC
- **No hardcoded secrets** — passwords must be `@secure()` parameters

## Defaults
- **Location:** `northeurope` (North Europe)
- **SKU/Tier:** Always use free tier when available, otherwise the cheapest option suitable for development
- **Resource naming:** `{resource-type}-saga-{purpose}-{environment}` — e.g., `func-saga-api-dev`

## Resource Group
- **`rg-saga-weu-dev`** — All Saga Azure resources go here (existing)

## Modules
- One module per resource type in `infra/modules/`
- Orchestrator in `infra/main.bicep` calls modules
- Parameter files in `infra/parameters/` per environment

## Existing Resources
These exist and should NOT be recreated:
- `rg-saga-weu-dev` (resource group — already created)
