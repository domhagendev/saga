---
name: "i18n Sync"
description: "Verify and synchronize translation keys across locale files"
---

# i18n Sync Skill

Verifies and synchronizes translation keys between English (`en.json`) and Swedish (`sv.json`) locale files.

## Locale File Locations

- English: `saga.frontend/src/locales/en.json`
- Swedish: `saga.frontend/src/locales/sv.json`

## Key Structure Convention

Keys follow dot notation organized by namespace:

```json
{
  "common": {
    "login": "Log in",
    "logout": "Log out",
    "register": "Register",
    "loading": "Loading...",
    "back": "Back"
  },
  "nav": {
    "workspace": "Workspace",
    "about": "About",
    "contact": "Contact",
    "merch": "Merch"
  },
  "views": {
    "main": {
      "title": "SAGA"
    },
    "workspace": {
      "title": "Workspace"
    }
  },
  "story": {
    "newBook": "New Book",
    "characters": "Characters",
    "locations": "Locations",
    "rules": "World Rules"
  }
}
```

## Sync Procedure

### 1. Load Both Files
Read both `en.json` and `sv.json` and parse their key structures.

### 2. Find Missing Keys
Compare key trees to identify:
- Keys present in `en.json` but missing from `sv.json`
- Keys present in `sv.json` but missing from `en.json`

### 3. Add Missing Keys
For missing keys, add a placeholder value:
- In `sv.json`: Use `"[SV] <english value>"` as placeholder
- In `en.json`: Use `"[EN] <swedish value>"` as placeholder

### 4. Verify All Components Use i18n
```bash
grep -rn '>[A-Z][a-z]' saga.frontend/src/views/ --include="*.vue" | grep -v 't(' | grep -v '//'
grep -rn '>[A-Z][a-z]' saga.frontend/src/components/ --include="*.vue" | grep -v 't(' | grep -v '//'
```

### 5. Report Coverage
After sync, report total keys, placeholder keys remaining, and structural mismatches.

## Rules
- Both locale files must have **identical key structures**
- Never delete keys from one file without removing from the other
- All user-facing strings must use `t('key')` — no hardcoded text
- Key names use `camelCase`
- Namespace names use `camelCase`
