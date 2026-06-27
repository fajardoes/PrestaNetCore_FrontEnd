import { z } from 'zod'

export const paymentComponentPrioritySchema = z.object({
  componentCode: z
    .string({ required_error: 'El código del componente es obligatorio.' })
    .trim()
    .min(1, 'El código del componente es obligatorio.')
    .max(50, 'Máximo 50 caracteres.')
    .transform((value) => value.toUpperCase()),
  componentName: z
    .string({ required_error: 'El nombre del componente es obligatorio.' })
    .trim()
    .min(1, 'El nombre del componente es obligatorio.')
    .max(120, 'Máximo 120 caracteres.'),
  priorityOrder: z.coerce
    .number({ invalid_type_error: 'La prioridad es obligatoria.' })
    .int('La prioridad debe ser entera.')
    .min(1, 'La prioridad debe ser mayor que cero.'),
  isActive: z.boolean().default(true),
  notes: z.string().trim().max(300, 'Máximo 300 caracteres.').optional().or(z.literal('')),
})

export type PaymentComponentPriorityFormValues = z.infer<
  typeof paymentComponentPrioritySchema
>
