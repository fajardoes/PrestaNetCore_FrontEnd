import { z } from 'zod'

export const clientCatalogSchema = z.object({
  parentId: z.string().trim().optional().nullable(),
  slug: z
    .string({ required_error: 'El slug es obligatorio.' })
    .trim()
    .min(1, 'El slug es obligatorio.')
    .max(150, 'Máximo 150 caracteres.'),
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

export type ClientCatalogFormValues = z.infer<typeof clientCatalogSchema>
