import { z } from 'zod'

export const createUserSchema = z
  .object({
    email: z
      .string({ required_error: 'El correo es obligatorio.' })
      .email('Ingresa un correo válido.'),
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
    password: z
      .string({ required_error: 'La contraseña temporal es obligatoria.' })
      .min(8, 'Debe tener al menos 8 caracteres.'),
    confirmPassword: z
      .string({ required_error: 'Confirma la contraseña.' })
      .min(8, 'Debe tener al menos 8 caracteres.'),
    agencyId: z
      .string({ required_error: 'Selecciona una agencia.' })
      .min(1, 'Selecciona una agencia.'),
    roles: z.array(z.string()).min(1, 'Selecciona al menos un rol.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

export type CreateUserFormValues = z.infer<typeof createUserSchema>
