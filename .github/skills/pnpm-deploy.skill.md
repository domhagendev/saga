---
name: "pnpm Deploy Fix"
description: "Handle pnpm symlink issue for Azure Functions zip deployment"
---

# pnpm Deploy Fix Skill

Documents and implements the fix for pnpm's symlinked `node_modules` breaking Azure Functions zip deployment.

## The Problem

pnpm uses a content-addressable store with symlinks by default. Azure Functions zip deploy doesn't follow symlinks, resulting in broken packages at runtime.

## The Solution

Generate a `.npmrc` file **at deploy time only** that forces pnpm to use a flat/hoisted layout:

```bash
# In the deploy job (NOT in the build job)
echo "node-linker=hoisted" > .npmrc
pnpm install --prod
```

## Key Design Points

1. **The `.npmrc` is NOT committed** — it's generated on-the-fly in the CI/CD pipeline only
2. **Local development** still uses pnpm's default efficient symlink structure
3. **Build job** uses normal `pnpm install --frozen-lockfile` (with devDependencies)
4. **Deploy job** does a fresh `--prod` install with hoisted linking

## GitHub Actions Implementation

```yaml
# Build job
build:
  steps:
    - uses: pnpm/action-setup@v4
    - run: pnpm install --frozen-lockfile
      working-directory: saga.backend
    - run: pnpm run build
      working-directory: saga.backend
    - uses: actions/upload-artifact@v4
      with:
        name: backend-build
        path: |
          saga.backend/dist/
          saga.backend/host.json
          saga.backend/package.json
          saga.backend/pnpm-lock.yaml

# Deploy job
deploy:
  steps:
    - uses: actions/download-artifact@v4
    - name: Install production dependencies (flat for zip deploy)
      working-directory: saga.backend
      run: |
        echo "node-linker=hoisted" > .npmrc
        pnpm install --prod
    - uses: Azure/functions-action@v1
```

## Verification

After deploying, verify the function app is running:
```bash
az functionapp show --name <APP_NAME> --resource-group rg-saga-weu-dev --query "state" -o tsv
# Expected: "Running"
```

## Rules
- Never commit `.npmrc` with `node-linker=hoisted` — it's deploy-time only
- Always include `pnpm-lock.yaml` in the deploy artifact
- The `.gitignore` should include `.npmrc`
- Local dev always uses default pnpm (symlinks) for efficiency
