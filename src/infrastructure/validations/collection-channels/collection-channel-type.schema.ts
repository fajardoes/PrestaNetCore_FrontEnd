import { z } from 'zod'

export const collectionChannelTypeSchema = z.object({
  code: z
    .string({ required_error: 'El código es obligatorio.' })
    .trim()
    .min(1, 'El código es obligatorio.')
    .max(50, 'Máximo 50 caracteres.'),
  name: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(150, 'Máximo 150 caracteres.'),
  description: z.string().trim().max(300, 'Máximo 300 caracteres.').optional().or(z.literal('')),
  sortOrder: z.coerce
    .number({ invalid_type_error: 'El orden es obligatorio.' })
    .min(0, 'El orden no puede ser negativo.'),
  isActive: z.boolean().default(true),
})

export type CollectionChannelTypeFormValues = z.infer<typeof collectionChannelTypeSchema>
