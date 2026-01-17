import { z } from 'zod'

export const costCenterSchema = z.object({
  code: z
    .string({ required_error: 'El código es obligatorio.' })
    .max(100, { message: 'Máximo 100 caracteres.' }),
  name: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .max(200, { message: 'Máximo 200 caracteres.' }),
  slug: z
    .string({ required_error: 'El slug es obligatorio.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones.'),
  agencyId: z
    .string({ required_error: 'La agencia es obligatoria.' })
    .uuid('Selecciona una agencia válida.'),
  isActive: z.boolean({ required_error: 'Define si está activo.' }),
})

export type CostCenterFormValues = z.infer<typeof costCenterSchema>
