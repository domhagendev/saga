using '../main.bicep'

param environment = 'dev'
param location = 'westeurope'
param storageAccountName = 'stsagadev'
param auth0Domain = '{{AUTH0_DOMAIN}}'
param auth0ApiIdentifier = '{{AUTH0_API_IDENTIFIER}}'
// geminiApiKey: set via deployment parameter or Key Vault reference
