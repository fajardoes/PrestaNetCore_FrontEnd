import { z } from 'zod'

export const municipalitySchema = z.object({
  departmentId: z
    .string({ required_error: 'El departamento es obligatorio.' })
    .trim()
    .min(1, 'Selecciona un departamento.'),
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
  isActive: z.boolean().default(true),
})

export type MunicipalityFormValues = z.infer<typeof municipalitySchema>
