import * as yup from 'yup'

export const businessDateSchema = yup.object({
  businessDate: yup
    .string()
    .trim()
    .required('La fecha operativa es requerida.')
    .test('is-date', 'La fecha operativa no es válida.', (value) => {
      if (!value) return false
      const parsed = new Date(value)
      return !Number.isNaN(parsed.getTime())
    }),
})

export type BusinessDateFormValues = yup.InferType<typeof businessDateSchema>
