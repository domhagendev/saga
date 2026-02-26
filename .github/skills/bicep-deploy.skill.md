---
name: "Bicep Deploy"
description: "Validate and deploy Bicep infrastructure to Azure for the Saga project"
---

# Bicep Deploy Skill

Validates and deploys Azure infrastructure using Bicep templates for the Saga project.

## Pre-flight Checks

1. Ensure Azure CLI is authenticated: `az account show`
2. Verify target subscription is correct

## Validation

```bash
az bicep build --file saga.backend/infra/main.bicep
```

## Preview Changes

```bash
az deployment group what-if \
  --resource-group rg-saga-weu-dev \
  --template-file saga.backend/infra/main.bicep \
  --parameters saga.backend/infra/parameters/dev.bicepparam
```

## Deploy

```bash
az deployment group create \
  --resource-group rg-saga-weu-dev \
  --template-file saga.backend/infra/main.bicep \
  --parameters saga.backend/infra/parameters/dev.bicepparam
```

## Post-deploy Verification

```bash
# Verify storage account and table
az storage table list --account-name <storageAccountName> --auth-mode login -o table

# Verify function app
az functionapp show --name <functionAppName> --resource-group rg-saga-weu-dev --query "state" -o tsv

# Verify static web app
az staticwebapp show --name <swaName> --resource-group rg-saga-weu-dev --query "defaultHostname" -o tsv
```

## Resource Group

| Resource Group | Contains | Bicep File |
|---|---|---|
| `rg-saga-weu-dev` | All Saga resources | `main.bicep` |

## Rules
- Always run `what-if` before `create`
- Never pass secrets directly — use `@secure()` parameters
- Verify existing resources are referenced, not recreated
- Update `saga.copilot/MEMORY.md` after successful deployment
- All resources in **North Europe**, **free tier** where possible
