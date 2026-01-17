import { z } from 'zod'

export const economicActivitySchema = z.object({
  sectorId: z
    .string({ required_error: 'El sector es obligatorio.' })
    .trim()
    .min(1, 'Selecciona un sector.'),
  nombre: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(200, 'Máximo 200 caracteres.'),
  descripcion: z
    .string()
    .trim()
    .max(300, 'Máximo 300 caracteres.')
    .optional()
    .nullable(),
  activo: z.boolean().default(true),
})

export type EconomicActivityFormValues = z.infer<typeof economicActivitySchema>
