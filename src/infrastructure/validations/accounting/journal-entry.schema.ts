import * as yup from 'yup'

const lineSchema = yup
  .object({
    accountId: yup
      .string()
      .required('La cuenta es obligatoria.'),
    description: yup
      .string()
      .trim()
      .max(500, 'Máximo 500 caracteres.')
      .optional()
      .nullable(),
    debit: yup
      .number()
      .typeError('El debe debe ser un número.')
      .min(0, 'El debe no puede ser negativo.')
      .required('El debe es obligatorio.'),
    credit: yup
      .number()
      .typeError('El haber debe ser un número.')
      .min(0, 'El haber no puede ser negativo.')
      .required('El haber es obligatorio.'),
    reference: yup
      .string()
      .trim()
      .max(100, 'Máximo 100 caracteres.')
      .optional()
      .nullable(),
  })
  .test(
    'only-one-side',
    'No puedes registrar debe y haber en la misma línea.',
    (value) => {
      if (!value) return true
      const debit = Number(value.debit) || 0
      const credit = Number(value.credit) || 0
      return !(debit > 0 && credit > 0)
    },
  )

export const journalEntrySchema = yup.object({
  date: yup
    .string()
    .required('La fecha es obligatoria.'),
  description: yup
    .string()
    .trim()
    .min(3, 'Ingresa una descripción más detallada.')
    .required('La descripción es obligatoria.'),
  costCenterId: yup
    .string()
    .optional()
    .nullable(),
  lines: yup
    .array()
    .of(lineSchema)
    .min(1, 'Debes agregar al menos una línea.')
    .required('Debes agregar al menos una línea.'),
})

export type JournalEntryFormValues = yup.InferType<typeof journalEntrySchema>
