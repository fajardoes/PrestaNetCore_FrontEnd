import { z } from 'zod'

export const chartAccountSchema = z.object({
  code: z
    .string({ required_error: 'El código es obligatorio.' })
    .max(100, { message: 'Máximo 100 caracteres.' })
    .regex(/^[A-Za-z0-9. -]+$/, 'Solo letras, números, espacios, puntos y guiones.'),
  name: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .max(200, { message: 'Máximo 200 caracteres.' }),
  slug: z
    .string({ required_error: 'El slug es obligatorio.' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones.'),
  level: z
    .preprocess((value) => {
      if (value === '' || value === null) return undefined
      return value
    }, z.coerce.number({ invalid_type_error: 'Debe ser un número entero.' }).int('Debe ser un número entero.').min(1, 'Debe ser al menos 1.'))
    .optional()
    .nullable(),
  parentId: z
    .union([
      z
        .string({ invalid_type_error: 'Debe ser un GUID válido.' })
        .uuid('Debe ser un GUID válido.'),
      z.literal(''),
      z.null(),
      z.undefined(),
    ])
    .transform((value) => {
      if (value === '' || value === null) return undefined
      return value
    })
    .optional()
    .nullable(),
  isGroup: z.boolean({ required_error: 'Define si es grupo.' }),
  normalBalance: z.enum(['debit', 'credit'], {
    required_error: 'Selecciona la naturaleza.',
    invalid_type_error: 'Debe ser Debe o Haber.',
  }),
  isActive: z.boolean({ required_error: 'Define si está activa.' }),
})

export type ChartAccountFormValues = z.infer<typeof chartAccountSchema>
