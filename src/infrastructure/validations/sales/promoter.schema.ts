import { z } from 'zod'

const normalizeOptional = (value: string | null | undefined) => {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export const promoterFormSchema = z.object({
  clientId: z
    .string({ required_error: 'El cliente es obligatorio.' })
    .trim()
    .min(1, 'El cliente es obligatorio.'),
  agencyId: z
    .string({ required_error: 'La agencia es obligatoria.' })
    .trim()
    .min(1, 'La agencia es obligatoria.'),
  code: z
    .string()
    .max(30, 'Maximo 30 caracteres.')
    .optional()
    .nullable()
    .transform(normalizeOptional),
  notes: z
    .string()
    .max(250, 'Maximo 250 caracteres.')
    .optional()
    .nullable()
    .transform(normalizeOptional),
  isActive: z.boolean().default(true),
})

export type PromoterFormValues = z.infer<typeof promoterFormSchema>
