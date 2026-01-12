import { z } from 'zod'

export const menuSchema = z.object({
  title: z
    .string({ required_error: 'El titulo es obligatorio.' })
    .max(200, 'Maximo 200 caracteres.'),
  slug: z
    .string({ required_error: 'El slug es obligatorio.' })
    .max(200, 'Maximo 200 caracteres.')
    .regex(/^[a-z0-9-]+$/, 'Solo minusculas, numeros y guiones.'),
  route: z
    .string()
    .trim()
    .nullable()
    .transform((value) => (value && value.length ? value : null)),
  icon: z
    .string()
    .trim()
    .nullable()
    .transform((value) => (value && value.length ? value : null)),
  order: z
    .number({ required_error: 'El orden es obligatorio.' })
    .int('El orden debe ser un entero.')
    .min(0, 'El orden debe ser positivo.'),
  isActive: z.boolean().default(true),
  parentId: z
    .string()
    .trim()
    .nullable()
    .transform((value) => (value && value.length ? value : null)),
  allowedRoleIds: z
    .array(z.string())
    .min(1, 'Selecciona al menos un rol.'),
})

export type MenuFormValues = z.infer<typeof menuSchema>
