import * as yup from 'yup'

export const loanApplicationFeeOverrideSchema = yup.object({
  mode: yup
    .mixed<'INHERIT' | 'MODIFIED' | 'REMOVED'>()
    .oneOf(['INHERIT', 'MODIFIED', 'REMOVED'])
    .required(),
  overrideValue: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return null
      }
      return Number.isNaN(value) ? null : value
    })
    .nullable()
    .when('mode', {
      is: 'MODIFIED',
      then: (schema) =>
        schema
          .typeError('Ingresa un valor válido.')
          .required('Debes ingresar el valor de la comisión.')
          .min(0, 'El valor no puede ser negativo.'),
      otherwise: (schema) => schema.nullable(),
    }),
  overrideReason: yup
    .string()
    .trim()
    .max(500, 'El motivo no puede exceder 500 caracteres.')
    .when('mode', {
      is: (mode: string) => mode === 'MODIFIED' || mode === 'REMOVED',
      then: (schema) => schema.required('Debes ingresar un motivo.'),
      otherwise: (schema) => schema.nullable().default(''),
    }),
})

export type LoanApplicationFeeOverrideFormValues = yup.InferType<
  typeof loanApplicationFeeOverrideSchema
>
