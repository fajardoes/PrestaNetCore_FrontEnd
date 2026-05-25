import * as yup from 'yup'

const optionalNumber = yup
  .number()
  .transform((value, originalValue) => {
    if (originalValue === '' || originalValue === null || originalValue === undefined) {
      return undefined
    }
    return Number.isNaN(value) ? undefined : value
  })

export const loanApplicationCollateralSchema = yup.object({
  collateralId: yup.string().trim().required('La garantía es obligatoria.'),
  coverageValue: optionalNumber
    .nullable()
    .moreThan(0, 'La cobertura debe ser mayor a 0.')
    .optional(),
  notes: yup.string().trim().max(250, 'Máximo 250 caracteres.').nullable().optional(),
})

export type LoanApplicationCollateralFormValues = yup.InferType<
  typeof loanApplicationCollateralSchema
>
