import { z } from 'zod'

export const agencySchema = z.object({
  name: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .max(200, 'Máximo 200 caracteres.'),
  slug: z
    .string({ required_error: 'El slug es obligatorio.' })
    .max(200, 'Máximo 200 caracteres.')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones.'),
  code: z
    .string({ required_error: 'El código es obligatorio.' })
    .max(50, 'Máximo 50 caracteres.'),
  isActive: z.boolean().default(true),
})

export type AgencyFormValues = z.infer<typeof agencySchema>
