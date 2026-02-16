import * as yup from 'yup'

export const holidaySchema = yup.object({
  date: yup
    .string()
    .trim()
    .required('La fecha es requerida.')
    .test('is-date', 'La fecha no es válida.', (value) => {
      if (!value) return false
      const parsed = new Date(value)
      return !Number.isNaN(parsed.getTime())
    }),
  name: yup
    .string()
    .trim()
    .required('El nombre del feriado es requerido.'),
  description: yup.string().trim().nullable().optional(),
  holidayTypeId: yup
    .mixed<string | number>()
    .test(
      'required-holiday-type',
      'El tipo de feriado es requerido.',
      (value) => value !== undefined && value !== null && String(value).trim() !== '',
    )
    .required('El tipo de feriado es requerido.'),
  isActive: yup.boolean().required(),
})

export type HolidayFormValues = yup.InferType<typeof holidaySchema>
