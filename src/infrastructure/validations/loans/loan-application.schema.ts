import * as yup from 'yup'

const optionalNumber = yup
  .number()
  .transform((value, originalValue) => {
    if (originalValue === '' || originalValue === null || originalValue === undefined) {
      return undefined
    }
    return Number.isNaN(value) ? undefined : value
  })

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
    .typeError('La duración solicitada debe ser numérica.')
    .integer('La duración solicitada debe ser entera.')
    .moreThan(0, 'La duración solicitada debe ser mayor a 0.')
    .required('La duración solicitada es obligatoria.'),
  requestedRateOverride: optionalNumber
    .nullable()
    .min(0, 'La tasa nominal manual no puede ser negativa.')
    .optional(),
  requestedPaymentFrequencyId: yup
    .string()
    .trim()
    .required('La frecuencia de pago solicitada es obligatoria.'),
  suggestedPaymentFrequencyId: yup.string().trim().nullable().optional(),
  notes: yup.string().trim().max(500, 'Máximo 500 caracteres.').nullable().optional(),
})

export type LoanApplicationFormValues = yup.InferType<typeof loanApplicationSchema>
