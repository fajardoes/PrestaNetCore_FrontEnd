import * as yup from 'yup'

export const loanApplicationSchema = yup.object({
  clientId: yup.string().trim().required('El cliente es obligatorio.'),
  loanProductId: yup.string().trim().required('El producto es obligatorio.'),
  promoterId: yup.string().trim().required('El promotor es obligatorio.'),
  requestedPrincipal: yup
    .number()
    .typeError('El monto solicitado debe ser numérico.')
    .moreThan(0, 'El monto solicitado debe ser mayor a 0.')
    .required('El monto solicitado es obligatorio.'),
  requestedTerm: yup
    .number()
    .typeError('El plazo solicitado debe ser numérico.')
    .integer('El plazo solicitado debe ser entero.')
    .moreThan(0, 'El plazo solicitado debe ser mayor a 0.')
    .required('El plazo solicitado es obligatorio.'),
  requestedPaymentFrequencyId: yup
    .string()
    .trim()
    .required('La frecuencia de pago solicitada es obligatoria.'),
  suggestedPaymentFrequencyId: yup.string().trim().nullable().optional(),
  notes: yup.string().trim().max(500, 'Máximo 500 caracteres.').nullable().optional(),
})

export type LoanApplicationFormValues = yup.InferType<typeof loanApplicationSchema>
