import { z } from 'zod'

export const paymentRegistrationSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'El monto es obligatorio.' })
    .positive('El monto debe ser mayor que cero.'),
  referenceNumber: z.string().trim().max(80, 'Máximo 80 caracteres.').optional().or(z.literal('')),
  externalReceiptNumber: z
    .string()
    .trim()
    .max(80, 'Máximo 80 caracteres.')
    .optional()
    .or(z.literal('')),
  notes: z.string().trim().max(500, 'Máximo 500 caracteres.').optional().or(z.literal('')),
})

export type PaymentRegistrationFormValues = z.infer<
  typeof paymentRegistrationSchema
>
