import { TableClient } from '@azure/data-tables'
import { DefaultAzureCredential } from '@azure/identity'

const credential = new DefaultAzureCredential()
const storageAccount = process.env.AZURE_STORAGE_ACCOUNT || ''
const tableUrl = `https://${storageAccount}.table.core.windows.net`

const TABLE_NAME = 'SagaEntities'

let sagaTableClient: TableClient | undefined

export function getSagaTableClient(): TableClient {
  if (!sagaTableClient) {
    sagaTableClient = new TableClient(tableUrl, TABLE_NAME, credential)
  }
  return sagaTableClient
}
