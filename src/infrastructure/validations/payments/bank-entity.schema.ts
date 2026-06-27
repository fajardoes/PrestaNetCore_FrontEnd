import { z } from 'zod'

export const bankEntitySchema = z.object({
  code: z
    .string({ required_error: 'El código es obligatorio.' })
    .trim()
    .min(1, 'El código es obligatorio.')
    .max(30, 'Máximo 30 caracteres.')
    .transform((value) => value.toUpperCase()),
  name: z
    .string({ required_error: 'El nombre es obligatorio.' })
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(120, 'Máximo 120 caracteres.'),
  description: z.string().trim().max(300, 'Máximo 300 caracteres.').optional().or(z.literal('')),
  bankGlAccountId: z
    .string({ required_error: 'La cuenta contable bancaria es obligatoria.' })
    .trim()
    .min(1, 'La cuenta contable bancaria es obligatoria.'),
  isActive: z.boolean().default(true),
})

export type BankEntityFormValues = z.infer<typeof bankEntitySchema>
