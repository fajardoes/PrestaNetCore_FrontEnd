import * as yup from 'yup'

const normalizeOptional = (value: unknown) => {
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const toNullableNumber = (value: unknown, originalValue: unknown) => {
  if (originalValue === '' || originalValue === null || originalValue === undefined) {
    return null
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }
  return Number(originalValue)
}

export const collateralCatalogItemSchema = yup.object({
  code: yup
    .string()
    .trim()
    .max(30, 'El código no puede superar 30 caracteres.')
    .required('El código es requerido.'),
  name: yup
    .string()
    .trim()
    .max(80, 'El nombre no puede superar 80 caracteres.')
    .required('El nombre es requerido.'),
  sortOrder: yup
    .number()
    .transform(toNullableNumber)
    .nullable()
    .typeError('El orden debe ser numérico.')
    .min(0, 'El orden debe ser mayor o igual a 0.'),
  isActive: yup.boolean().required(),
})

export const normalizeCatalogPayload = (
  values: yup.InferType<typeof collateralCatalogItemSchema>,
) => {
  return {
    code: values.code.trim().toUpperCase(),
    name: values.name.trim(),
    sortOrder: values.sortOrder ?? 0,
    isActive: values.isActive,
    description: normalizeOptional(null),
  }
}

export type CollateralCatalogItemFormValues = yup.InferType<
  typeof collateralCatalogItemSchema
>
