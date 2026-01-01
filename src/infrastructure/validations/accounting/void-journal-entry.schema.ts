import * as yup from 'yup'

export const voidJournalEntrySchema = yup.object({
  reason: yup
    .string()
    .trim()
    .min(5, 'Describe brevemente el motivo de la anulación.')
    .required('El motivo es obligatorio.'),
  date: yup
    .string()
    .optional()
    .nullable(),
})

export type VoidJournalEntryFormValues = yup.InferType<typeof voidJournalEntrySchema>
