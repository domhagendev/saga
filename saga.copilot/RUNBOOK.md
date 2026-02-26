# Saga — Operational Runbook

> Last updated: 2026-02-26

## Local Development Setup

### Prerequisites
- Node.js 22+
- pnpm (`npm install -g pnpm`)
- Azure CLI (`az`) — logged in (`az login`)
- Azure Functions Core Tools v4 (`npm install -g azure-functions-core-tools@4`)
- RBAC: Your CLI user needs `Storage Table Data Contributor` on `stsagadev` storage account

### First-Time Setup
```bash
git clone <repo-url> && cd saga
cp .env.example .env.local  # Edit with real values from password manager

# Frontend
cd saga.frontend && pnpm install

# Backend
cd saga.backend && pnpm install
# Create local.settings.json from example
cp local.settings.json.example local.settings.json
# Edit local.settings.json:
#   AZURE_STORAGE_ACCOUNT = stsagadev
#   GEMINI_API_KEY = <your key>

# Grant yourself Table Storage access (if not already done)
MY_OID=$(az ad signed-in-user show --query id -o tsv)
STORAGE_ID=$(az storage account show -g rg-saga-weu-dev -n stsagadev --query id -o tsv)
az role assignment create --assignee "$MY_OID" --role "Storage Table Data Contributor" --scope "$STORAGE_ID"
# Note: RBAC propagation can take up to 10 minutes
```

### Daily Development
```bash
# Terminal 1 — Frontend dev server (:5173)
cd saga.frontend && pnpm dev

# Terminal 2 — Backend Azure Functions (:7071)
cd saga.backend && pnpm start
# (pnpm start runs: npm run build && func start)
```

The frontend dev mode auto-authenticates via `useDevAuth` composable (no Auth0 needed). API calls use `x-user-id: 6077a911-81fb-43f8-b325-2c1f79d37c1e` header.

Frontend connects to the API URL in `.env.local`:
- **Local backend:** `VITE_API_BASE_URL=http://localhost:7071/api`
- **Deployed backend:** `VITE_API_BASE_URL=https://func-saga-api-dev.azurewebsites.net/api`

## Build & Verify

```bash
# Frontend type-check + production build
cd saga.frontend && pnpm build

# Backend TypeScript compilation
cd saga.backend && pnpm run build
```

## Deployment

### Automatic (Recommended)
Push to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. **Deploy Infrastructure** — Bicep incremental deploy (idempotent, only adds/updates)
2. **Deploy Backend** — pnpm build → zip → `az functionapp deployment source config-zip`
3. **Deploy Frontend** — pnpm build → `Azure/static-web-apps-deploy@v1`

Jobs 2 and 3 run in parallel after job 1 completes.

**Required GitHub Secrets:**
| Secret | Description |
|---|---|
| `AZURE_CLIENT_ID` | Service principal for OIDC federation |
| `AZURE_TENANT_ID` | Azure AD tenant |
| `AZURE_SUBSCRIPTION_ID` | `e0a14b25-5709-4837-9fd1-bc36fb8d081b` |
| `GEMINI_API_KEY` | Google Gemini API key (passed to Bicep) |
| `SWA_DEPLOYMENT_TOKEN` | Static Web App deployment token |

**Required GitHub Vars:**
| Var | Description |
|---|---|
| `AUTH0_DOMAIN` | Auth0 tenant domain |
| `AUTH0_CLIENT_ID` | Auth0 SPA client ID |
| `AUTH0_API_IDENTIFIER` | Auth0 API audience |
| `API_BASE_URL` | `https://func-saga-api-dev.azurewebsites.net/api` |
| `ARRIVAL_API_BASE_URL` | `https://func-arrival-api-dev.azurewebsites.net/api` |

### Manual — Frontend (Static Web App)
```bash
cd saga.frontend && pnpm build
# Deploy via Azure SWA CLI or GitHub Actions
```

### Manual — Backend (Azure Functions)
```bash
cd saga.backend
echo "node-linker=hoisted" > .npmrc
pnpm install --prod
pnpm run build
zip -r deploy.zip dist/ node_modules/ host.json package.json -x "*.d.ts" "*.d.ts.map"
az functionapp deployment source config-zip -g rg-saga-weu-dev -n func-saga-api-dev --src deploy.zip
rm .npmrc  # Clean up after deploy
```

### Manual — Infrastructure (Bicep)
```bash
# Validate
az bicep build --file saga.backend/infra/main.bicep

# Preview changes
az deployment group what-if \
  --resource-group rg-saga-weu-dev \
  --template-file saga.backend/infra/main.bicep \
  --parameters saga.backend/infra/parameters/dev.bicepparam

# Deploy
az deployment group create \
  --resource-group rg-saga-weu-dev \
  --template-file saga.backend/infra/main.bicep \
  --parameters saga.backend/infra/parameters/dev.bicepparam \
  --parameters geminiApiKey=<YOUR_KEY>
```

## Troubleshooting

### Frontend
- **Won't start:** Check Node 22+, delete `node_modules`, run `pnpm install`, verify `.env.local` has `VITE_AUTH0_*` vars
- **Auth0 redirect loop:** Verify `VITE_AUTH0_*` env vars, check Auth0 Dashboard callback/logout URLs include `http://localhost:5173`
- **Theme not switching:** Check `useThemeStore` is initialized in `App.vue`, verify `dark` class on `<html>` element
- **Build fails with unused imports:** vue-tsc strict mode catches these. Fix by removing unused imports (e.g., TS6192 errors)
- **Loading overlay stuck:** Check `workspaceLoader` store — `loadAndNavigate()` has a min 500ms display time. Errors during pre-fetch will also release the overlay.

### Backend
- **Functions not registering:** Check `func --version` (v4+), verify `host.json`, check `local.settings.json` exists with `FUNCTIONS_WORKER_RUNTIME: node`
- **Table Storage `ENOTFOUND`:** Storage account name is wrong. Must be `stsagadev` (not `stsagaweudev`). Check `AZURE_STORAGE_ACCOUNT` in `local.settings.json`.
- **Table Storage `403 AuthorizationPermissionMismatch`:** Your CLI user lacks RBAC role. Run: `az role assignment create --assignee $(az ad signed-in-user show --query id -o tsv) --role "Storage Table Data Contributor" --scope $(az storage account show -g rg-saga-weu-dev -n stsagadev --query id -o tsv)`. Wait up to 10 min for propagation.
- **Gemini `429` quota error:** Free tier daily limit exhausted. Resets daily. For higher limits, enable billing on Google Cloud project. Backend returns `{ status: 429, error: 'AI quota exceeded...' }`.
- **Gemini API errors / empty key:** Check `GEMINI_API_KEY` in `local.settings.json` (local) or Azure Function App settings (deployed). The Bicep deploy can wipe it if the GitHub secret `GEMINI_API_KEY` is not set.
- **Port 7071 in use:** Kill existing: `lsof -ti:7071 | xargs kill -9`

### Infrastructure
- **Bicep build fails:** Run `az bicep upgrade`, check module versions in registry
- **Deployment fails:** Check resource group exists (`rg-saga-weu-dev`), verify subscription, check quotas
- **RBAC not working:** Role assignments can take up to 10 minutes to propagate
- **GEMINI_API_KEY blanked after deploy:** Ensure `GEMINI_API_KEY` GitHub Actions secret is set. The Bicep template defaults to `''` if the parameter isn't provided.

### CI/CD
- **Frontend build fails:** Usually unused imports (TS6192). vue-tsc runs before vite build.
- **Backend deploy fails:** Check that `node-linker=hoisted` .npmrc is generated in the workflow. Zip must include `dist/`, `node_modules/`, `host.json`, `package.json`.
- **Infra deploy fails but is harmless:** Bicep is incremental/idempotent. Re-running is safe.

## Useful Commands

```bash
# Check deployed Function App settings
az functionapp config appsettings list -g rg-saga-weu-dev -n func-saga-api-dev -o table

# Restart Function App
az functionapp restart -g rg-saga-weu-dev -n func-saga-api-dev

# Test API (books list)
curl -s "https://func-saga-api-dev.azurewebsites.net/api/books" \
  -H "x-user-id: 6077a911-81fb-43f8-b325-2c1f79d37c1e"

# Test generate page
curl -s -X POST "https://func-saga-api-dev.azurewebsites.net/api/books/{bookId}/pages/generate" \
  -H "x-user-id: 6077a911-81fb-43f8-b325-2c1f79d37c1e" \
  -H "Content-Type: application/json" \
  -d '{"userNote":"Describe what happens next","targetMood":"Adventurous"}'

# Type-check frontend
cd saga.frontend && npx vue-tsc -b --noEmit

# Type-check backend
cd saga.backend && npx tsc --noEmit

# Check storage account RBAC roles
STORAGE_ID=$(az storage account show -g rg-saga-weu-dev -n stsagadev --query id -o tsv)
az role assignment list --scope "$STORAGE_ID" -o table
```
