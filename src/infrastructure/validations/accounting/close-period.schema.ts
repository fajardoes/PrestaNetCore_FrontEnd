import { z } from 'zod'

export const closePeriodSchema = z.object({
  notes: z.string().max(1000, { message: 'Máximo 1000 caracteres.' }).optional().nullable(),
})

export type ClosePeriodFormValues = z.infer<typeof closePeriodSchema>
