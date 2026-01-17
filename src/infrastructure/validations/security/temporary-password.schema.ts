import { z } from 'zod'

export const temporaryPasswordSchema = (expectedEmail?: string) =>
  z.object({
    emailConfirmation: z
      .string({ required_error: 'Confirma el correo del usuario.' })
      .email('Correo inválido.')
      .refine(
        (value) =>
          !expectedEmail ||
          value.trim().toLowerCase() === expectedEmail.trim().toLowerCase(),
        { message: 'El correo no coincide con el usuario seleccionado.' },
      ),
    temporaryPassword: z
      .string({ required_error: 'Ingresa la contraseña temporal.' })
      .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmTemporaryPassword: z
      .string({ required_error: 'Confirma la contraseña temporal.' })
      .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  })
  .refine(
    (data) => data.temporaryPassword === data.confirmTemporaryPassword,
    {
      message: 'Las contraseñas no coinciden.',
      path: ['confirmTemporaryPassword'],
    },
  )

export type TemporaryPasswordFormValues = z.infer<
  ReturnType<typeof temporaryPasswordSchema>
>
