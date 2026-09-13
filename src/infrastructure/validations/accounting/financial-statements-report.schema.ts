import * as yup from 'yup'

const emptyToUndefined = <T>(value: T, originalValue: T) =>
  originalValue === '' ? undefined : value

export const financialStatementsReportSchema = yup.object({
  periodId: yup.string().transform(emptyToUndefined).optional(),
  fromDate: yup.string().transform(emptyToUndefined).optional(),
  toDate: yup.string().transform(emptyToUndefined).optional(),
  costCenterId: yup.string().transform(emptyToUndefined).optional(),
  withoutCostCenter: yup.boolean().required(),
})

export type FinancialStatementsReportFormValues = yup.InferType<
  typeof financialStatementsReportSchema
>
