import * as yup from 'yup'

export const delinquencyPolicyAssignmentSchema = yup.object({
  policyId: yup.string().trim().required('La política es requerida.'),
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
  priority: yup
    .number()
    .typeError('La prioridad es requerida.')
    .min(0, 'La prioridad debe ser mayor o igual a 0.')
    .required('La prioridad es requerida.'),
})

export type DelinquencyPolicyAssignmentFormValues = yup.InferType<
  typeof delinquencyPolicyAssignmentSchema
>
