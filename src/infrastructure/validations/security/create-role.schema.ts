import { z } from 'zod'

export const createRoleSchema = z.object({
  name: z
    .string({ required_error: 'El nombre del rol es obligatorio.' })
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(60, 'El nombre no puede exceder 60 caracteres.')
    .regex(/^[a-z0-9_]+$/, 'Usa solo minúsculas, números y guion bajo.'),
})

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>
