# Saga — Operational Runbook

## Local Development Setup

### Prerequisites
- Node.js 22+
- pnpm (`npm install -g pnpm`)
- Azure CLI (`az`)
- Azure Functions Core Tools v4 (`npm install -g azure-functions-core-tools@4`)
- Azure Developer CLI (`azd`) — optional, for infrastructure

### First-Time Setup
```bash
git clone <repo-url> && cd saga
cp .env.example .env.local  # Edit with real values from password manager

# Frontend
cd saga.frontend && pnpm install

# Backend
cd saga.backend && pnpm install
# Create local.settings.json from local.settings.json.example
cp local.settings.json.example local.settings.json
# Edit local.settings.json with values from .env.local
```

### Daily Development
```bash
# Terminal 1 — Frontend dev server (:5173)
cd saga.frontend && pnpm dev

# Terminal 2 — Backend Azure Functions (:7071)
cd saga.backend && pnpm start
```

## Build & Verify

```bash
# Frontend type-check + production build
cd saga.frontend && pnpm build

# Backend TypeScript compilation
cd saga.backend && pnpm run build
```

## Deployment

### Frontend (Static Web App)
Automatic on push to `main` via GitHub Actions, or manual:
```bash
cd saga.frontend && pnpm build
# Deploy via Azure SWA CLI or GitHub Actions
```

### Backend (Azure Functions)
Automatic on push to `main` via GitHub Actions, or manual:
```bash
cd saga.backend
pnpm run build
func azure functionapp publish <FUNCTION_APP_NAME>
```

**Note: For manual deployment with pnpm**, the symlink fix is needed:
```bash
cd saga.backend
echo "node-linker=hoisted" > .npmrc
pnpm install --prod
func azure functionapp publish <FUNCTION_APP_NAME>
rm .npmrc  # Clean up after deploy
```

### Infrastructure (Bicep)
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
  --parameters saga.backend/infra/parameters/dev.bicepparam
```

## Troubleshooting

### Frontend
- **Won't start:** Check Node 22+, delete `node_modules`, run `pnpm install`, verify `.env.local` has `VITE_AUTH0_*` vars
- **Auth0 redirect loop:** Verify `VITE_AUTH0_*` env vars, check Auth0 Dashboard callback/logout URLs include `http://localhost:5173`
- **Theme not switching:** Check `useThemeStore` is initialized in `App.vue`, verify `dark` class on `<html>` element

### Backend
- **Functions not registering:** Check `func --version` (v4+), verify `host.json`, check `local.settings.json` exists with `FUNCTIONS_WORKER_RUNTIME: node`
- **Table Storage access denied:** Verify `DefaultAzureCredential` — run `az login`, check storage account name in `local.settings.json`
- **Gemini API errors:** Verify `GEMINI_API_KEY` in `local.settings.json`, check API quotas

### Infrastructure
- **Bicep build fails:** Run `az bicep upgrade`, check module versions in registry
- **Deployment fails:** Check resource group exists, verify subscription, check quotas
- **RBAC not working:** Role assignments can take up to 10 minutes to propagate
