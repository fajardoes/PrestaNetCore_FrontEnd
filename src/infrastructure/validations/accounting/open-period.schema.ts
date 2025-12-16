import { z } from 'zod'

export const openPeriodSchema = z.object({
  fiscalYear: z
    .coerce.number({
      required_error: 'El año fiscal es obligatorio.',
      invalid_type_error: 'El año fiscal es obligatorio.',
    })
    .min(2000, { message: 'El año debe ser mayor o igual a 2000.' }),
  month: z
    .coerce.number({
      required_error: 'El mes es obligatorio.',
      invalid_type_error: 'El mes es obligatorio.',
    })
    .int('El mes debe ser entero.')
    .min(1, 'Mes mínimo 1.')
    .max(12, 'Mes máximo 12.'),
  notes: z.string().max(1000, { message: 'Máximo 1000 caracteres.' }).optional().nullable(),
})

export type OpenPeriodFormValues = z.infer<typeof openPeriodSchema>
