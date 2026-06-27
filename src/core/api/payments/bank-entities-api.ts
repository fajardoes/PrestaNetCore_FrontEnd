import { httpClient } from '@/infrastructure/api/httpClient'
import type { CreateBankEntityRequest } from '@/infrastructure/payments/requests/create-bank-entity-request'
import type { ListBankEntitiesRequest } from '@/infrastructure/payments/requests/list-bank-entities-request'
import type { UpdateBankEntityStatusRequest } from '@/infrastructure/payments/requests/update-bank-entity-status-request'
import type { UpdateBankEntityRequest } from '@/infrastructure/payments/requests/update-bank-entity-request'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'

const basePath = '/bank-payment-proofs/catalogs/bank-entities'

export const listBankEntities = async (
  params: ListBankEntitiesRequest,
): Promise<BankEntityResponse[]> => {
  const { data } = await httpClient.get<BankEntityResponse[]>(basePath, { params })
  return data
}

export const getBankEntity = async (id: string): Promise<BankEntityResponse> => {
  const { data } = await httpClient.get<BankEntityResponse>(`${basePath}/${id}`)
  return data
}

export const createBankEntity = async (
  payload: CreateBankEntityRequest,
): Promise<BankEntityResponse> => {
  const { data } = await httpClient.post<BankEntityResponse>(basePath, payload)
  return data
}

export const updateBankEntity = async (
  id: string,
  payload: UpdateBankEntityRequest,
): Promise<BankEntityResponse> => {
  const { data } = await httpClient.put<BankEntityResponse>(`${basePath}/${id}`, payload)
  return data
}

export const updateBankEntityStatus = async (
  id: string,
  payload: UpdateBankEntityStatusRequest,
): Promise<void> => {
  await httpClient.patch(`${basePath}/${id}/status`, payload)
}
