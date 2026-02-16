import { z } from 'zod'

export const editUserSchema = z.object({
  email: z
    .string({ required_error: 'El correo es obligatorio.' })
    .email('Ingresa un correo válido.'),
  agencyId: z
    .string({ required_error: 'Selecciona una agencia.' })
    .min(1, 'Selecciona una agencia.'),
  queryOfficeIds: z.array(z.string()).default([]),
  phoneNumber: z
    .string()
    .max(30, 'Máximo 30 caracteres.')
    .optional()
    .nullable()
    .transform((value) => {
      if (!value) return null
      const trimmed = value.trim()
      return trimmed.length ? trimmed : null
    }),
  isDeleted: z.boolean(),
  roles: z.array(z.string()).min(1, 'Selecciona al menos un rol.'),
})

export type EditUserFormValues = z.infer<typeof editUserSchema>
