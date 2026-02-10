import * as yup from 'yup'

export const delinquencyPolicyResolveSchema = yup.object({
  agencyId: yup
    .string()
    .trim()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .nullable()
    .optional(),
  portfolioTypeId: yup
    .string()
    .trim()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .nullable()
    .optional(),
})

export type DelinquencyPolicyResolveFormValues = yup.InferType<
  typeof delinquencyPolicyResolveSchema
>
