targetScope = 'resourceGroup'

@description('The environment name (dev, prod)')
@allowed(['dev', 'prod'])
param environment string = 'dev'

@description('The Azure region for all resources')
param location string = 'northeurope'

@description('The storage account name for table storage')
param storageAccountName string

@description('The Gemini API key')
@secure()
param geminiApiKey string = ''

@description('The Auth0 domain')
param auth0Domain string = ''

@description('The Auth0 API identifier')
param auth0ApiIdentifier string = ''

// Storage account with SagaEntities table
module tableStorage 'modules/storageAccount.bicep' = {
  name: 'tableStorageDeployment'
  params: {
    storageAccountName: storageAccountName
    location: location
  }
}

// Static Web App for frontend
module staticWebApp 'modules/staticWebApp.bicep' = {
  name: 'staticWebAppDeployment'
  params: {
    name: 'swa-saga-${environment}'
    location: location
  }
}

// Function App for backend API
module functionApp 'modules/functionApp.bicep' = {
  name: 'functionAppDeployment'
  dependsOn: [
    tableStorage
  ]
  params: {
    name: 'func-saga-api-${environment}'
    location: location
    storageAccountName: storageAccountName
    geminiApiKey: geminiApiKey
    auth0Domain: auth0Domain
    auth0ApiIdentifier: auth0ApiIdentifier
  }
}

// RBAC: Function App → Storage Table Data Contributor
module roleAssignments 'modules/roleAssignments.bicep' = {
  name: 'roleAssignmentsDeployment'
  params: {
    functionAppPrincipalId: functionApp.outputs.principalId
    storageAccountName: storageAccountName
  }
}

output staticWebAppUrl string = staticWebApp.outputs.defaultHostname
output functionAppUrl string = functionApp.outputs.defaultHostname
output functionAppId string = functionApp.outputs.functionAppId
