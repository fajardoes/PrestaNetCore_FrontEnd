import * as yup from 'yup'
import type { BusinessDayAdjustmentRule } from '@/infrastructure/interfaces/organization/holidays/business-day-adjustment-rule'

const emptyToUndefined = <T>(value: T, originalValue: T) =>
  originalValue === '' ? undefined : value

export const businessDayCheckSchema = yup.object({
  date: yup
    .string()
    .trim()
    .required('La fecha es requerida.')
    .test('is-date', 'La fecha no es válida.', (value) => {
      if (!value) return false
      const parsed = new Date(value)
      return !Number.isNaN(parsed.getTime())
    }),
  agencyId: yup.string().transform(emptyToUndefined).optional(),
  portfolioTypeId: yup.string().transform(emptyToUndefined).optional(),
})

export type BusinessDayCheckFormValues = yup.InferType<
  typeof businessDayCheckSchema
>

export const adjustDateSchema = yup.object({
  date: yup
    .string()
    .trim()
    .required('La fecha es requerida.')
    .test('is-date', 'La fecha no es válida.', (value) => {
      if (!value) return false
      const parsed = new Date(value)
      return !Number.isNaN(parsed.getTime())
    }),
  rule: yup
    .number()
    .oneOf([1, 2])
    .typeError('La regla es requerida.')
    .required('La regla es requerida.'),
  agencyId: yup.string().transform(emptyToUndefined).optional(),
  portfolioTypeId: yup.string().transform(emptyToUndefined).optional(),
})

export type AdjustDateFormValues = yup.InferType<typeof adjustDateSchema>
