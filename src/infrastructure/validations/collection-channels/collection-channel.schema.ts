import { z } from 'zod'

const requiredText = (label: string, max: number) =>
  z
    .string({ required_error: `${label} es obligatorio.` })
    .trim()
    .min(1, `${label} es obligatorio.`)
    .max(max, `Máximo ${max} caracteres.`)

const nonNegativeMoney = (label: string) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return undefined
      if (typeof value === 'number' && Number.isNaN(value)) return undefined
      return value
    },
    z
      .number({
        required_error: `${label} es obligatorio.`,
        invalid_type_error: `${label} es obligatorio.`,
      })
      .min(0, `${label} no puede ser negativo.`),
  )

export const collectionChannelSchema = z.object({
  code: requiredText('El código', 50),
  name: requiredText('El nombre', 150),
  channelTypeCode: requiredText('El tipo de canal', 50),
  currencyCode: z.literal('HNL', {
    errorMap: () => ({ message: 'La moneda debe ser HNL.' }),
  }),
  maxSinglePaymentAmount: nonNegativeMoney('El límite por pago'),
  maxDailyAmount: nonNegativeMoney('El límite diario'),
  maxOutstandingAmount: nonNegativeMoney('El límite pendiente'),
  notes: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres.')
    .optional()
    .or(z.literal('')),
})

export type CollectionChannelFormValues = z.infer<typeof collectionChannelSchema>
