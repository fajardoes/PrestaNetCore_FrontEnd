import * as yup from 'yup'

export const loanDisbursementReversalSchema = yup.object({
  reason: yup
    .string()
    .trim()
    .max(500, 'El motivo no puede superar 500 caracteres.')
    .required('El motivo de reversión es obligatorio.'),
  notes: yup
    .string()
    .trim()
    .max(1000, 'Las notas no pueden superar 1000 caracteres.')
    .optional()
    .nullable(),
})

export type LoanDisbursementReversalFormValues = yup.InferType<
  typeof loanDisbursementReversalSchema
>
