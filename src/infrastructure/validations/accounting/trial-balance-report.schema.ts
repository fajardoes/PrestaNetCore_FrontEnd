import * as yup from 'yup'

const emptyToUndefined = <T>(value: T, originalValue: T) =>
  originalValue === '' ? undefined : value

export const trialBalanceReportSchema = yup.object({
  periodId: yup.string().transform(emptyToUndefined).optional(),
  fromDate: yup.string().transform(emptyToUndefined).optional(),
  toDate: yup.string().transform(emptyToUndefined).optional(),
  costCenterId: yup.string().transform(emptyToUndefined).optional(),
  includeSubaccounts: yup.boolean().required(),
  includeZeroBalanceAccounts: yup.boolean().required(),
})

export type TrialBalanceReportFormValues = yup.InferType<
  typeof trialBalanceReportSchema
>
