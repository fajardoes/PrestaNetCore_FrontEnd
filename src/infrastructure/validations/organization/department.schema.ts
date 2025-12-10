import { z } from 'zod'

export const departmentSchema = z.object({
  name: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .trim()
    .min(1, 'Ingresa un nombre.')
    .max(200, 'Máximo 200 caracteres.'),
  slug: z
    .string({ required_error: 'El slug es obligatorio.' })
    .trim()
    .min(1, 'Ingresa un slug.')
    .max(200, 'Máximo 200 caracteres.')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones.'),
  code: z
    .string({ required_error: 'El código es obligatorio.' })
    .trim()
    .min(1, 'Ingresa un código.')
    .max(10, 'Máximo 10 caracteres.'),
  isActive: z.boolean().default(true),
})

export type DepartmentFormValues = z.infer<typeof departmentSchema>
