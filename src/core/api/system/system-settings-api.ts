import { httpClient } from '@/infrastructure/api/httpClient'
import type { CollectionTransitAccountSettingDto } from '@/infrastructure/interfaces/system/collection-transit-account-setting.dto'
import type { LoanDisbursementAccountSettingDto } from '@/infrastructure/interfaces/system/loan-disbursement-account-setting.dto'
import type { UpdateCollectionTransitAccountRequestDto } from '@/infrastructure/interfaces/system/update-collection-transit-account-request.dto'
import type { UpdateLoanDisbursementAccountRequestDto } from '@/infrastructure/interfaces/system/update-loan-disbursement-account-request.dto'
import type { AnticipatedInstallmentTransitAccountSettingDto } from '@/infrastructure/interfaces/system/anticipated-installment-transit-account-setting.dto'
import type { UpdateAnticipatedInstallmentTransitAccountRequestDto } from '@/infrastructure/interfaces/system/update-anticipated-installment-transit-account-request.dto'

const basePath = '/system/settings'

export const getLoanDisbursementAccountSetting =
  async (): Promise<LoanDisbursementAccountSettingDto> => {
    const { data } = await httpClient.get<LoanDisbursementAccountSettingDto>(
      `${basePath}/loan-disbursement-account`,
    )
    return data
  }

export const updateLoanDisbursementAccountSetting = async (
  payload: UpdateLoanDisbursementAccountRequestDto,
): Promise<LoanDisbursementAccountSettingDto> => {
  const { data } = await httpClient.put<LoanDisbursementAccountSettingDto>(
    `${basePath}/loan-disbursement-account`,
    payload,
  )
  return data
}

export const getCollectionTransitAccountSetting =
  async (): Promise<CollectionTransitAccountSettingDto> => {
    const { data } = await httpClient.get<CollectionTransitAccountSettingDto>(
      `${basePath}/collection-transit-account`,
    )
    return data
  }

export const updateCollectionTransitAccountSetting = async (
  payload: UpdateCollectionTransitAccountRequestDto,
): Promise<CollectionTransitAccountSettingDto> => {
  const { data } = await httpClient.put<CollectionTransitAccountSettingDto>(
    `${basePath}/collection-transit-account`,
    payload,
  )
  return data
}

export const getAnticipatedInstallmentTransitAccountSetting =
  async (): Promise<AnticipatedInstallmentTransitAccountSettingDto> => {
    const { data } = await httpClient.get<AnticipatedInstallmentTransitAccountSettingDto>(
      `${basePath}/anticipated-installment-transit-account`,
    )
    return data
  }

export const updateAnticipatedInstallmentTransitAccountSetting = async (
  payload: UpdateAnticipatedInstallmentTransitAccountRequestDto,
): Promise<AnticipatedInstallmentTransitAccountSettingDto> => {
  const { data } = await httpClient.put<AnticipatedInstallmentTransitAccountSettingDto>(
    `${basePath}/anticipated-installment-transit-account`,
    payload,
  )
  return data
}
