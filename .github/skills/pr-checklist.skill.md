---
name: "PR Checklist"
description: "Pre-pull-request verification checklist for code quality and security"
---

# PR Checklist Skill

Run this checklist before creating or reviewing a pull request.

## Automated Checks

### 1. TypeScript Type Safety

```bash
# Frontend type-check
cd saga.frontend && npx vue-tsc --noEmit

# Backend type-check
cd saga.backend && npx tsc --noEmit
```

### 2. No `any` Types

```bash
grep -rn ': any' saga.frontend/src/ --include="*.ts" --include="*.vue"
grep -rn ': any' saga.backend/src/ --include="*.ts"
grep -rn 'as any' saga.frontend/src/ --include="*.ts" --include="*.vue"
grep -rn 'as any' saga.backend/src/ --include="*.ts"
```

Should return zero results.

### 3. No Hardcoded Strings (i18n)

```bash
grep -rn '>[A-Z][a-z]' saga.frontend/src/views/ --include="*.vue" | grep -v 't(' | grep -v 'class=' | grep -v '//'
grep -rn '>[A-Z][a-z]' saga.frontend/src/components/ --include="*.vue" | grep -v 't(' | grep -v 'class=' | grep -v '//'
```

### 4. No Secrets Exposed

```bash
grep -rni 'AIzaSy\|password\|secret\|api_key\|apikey' saga.frontend/src/ --include="*.ts" --include="*.vue" | grep -v 'VITE_' | grep -v '.env' | grep -v 'import'
grep -rni 'AIzaSy\|password\|secret\|api_key\|apikey' saga.backend/src/ --include="*.ts" | grep -v 'process.env' | grep -v 'import' | grep -v '@secure'
```

### 5. RBAC Compliance (No Connection Strings)

```bash
grep -rn 'connectionString\|AccountKey=' saga.backend/src/ --include="*.ts"
```

Should return zero results.

### 6. i18n Key Sync

```bash
node -e "
const en = require('./saga.frontend/src/locales/en.json');
const sv = require('./saga.frontend/src/locales/sv.json');
const getKeys = (obj, prefix = '') => Object.keys(obj).flatMap(k => typeof obj[k] === 'object' ? getKeys(obj[k], prefix + k + '.') : [prefix + k]);
const enKeys = new Set(getKeys(en));
const svKeys = new Set(getKeys(sv));
const missingInSv = [...enKeys].filter(k => !svKeys.has(k));
const missingInEn = [...svKeys].filter(k => !enKeys.has(k));
if (missingInSv.length) console.log('Missing in sv.json:', missingInSv);
if (missingInEn.length) console.log('Missing in en.json:', missingInEn);
if (!missingInSv.length && !missingInEn.length) console.log('✅ i18n keys in sync');
"
```

### 7. Gemini API Key Safety

```bash
# Verify GEMINI_API_KEY is never in frontend code
grep -rn 'GEMINI_API_KEY\|AIzaSy' saga.frontend/ --include="*.ts" --include="*.vue" --include="*.json"
```

Should return zero results.

## Manual Review Checklist

- [ ] **Build passes:** `pnpm build` succeeds in both frontend and backend
- [ ] **Type-check passes:** No TypeScript errors
- [ ] **No `any` types:** All types are explicit
- [ ] **i18n complete:** All user-facing strings use `t('key')`, both locales have all keys
- [ ] **Secrets safe:** No plain-text secrets, `.env.example` updated if new vars needed
- [ ] **RBAC only:** No connection strings, uses `DefaultAzureCredential`
- [ ] **Dark/light theme:** New UI works in both modes
- [ ] **shadcn-vue untouched:** No modifications to `src/components/ui/`
- [ ] **Content chunking:** Page content >64KB splits correctly
- [ ] **Error handling:** Functions return proper HTTP status codes
