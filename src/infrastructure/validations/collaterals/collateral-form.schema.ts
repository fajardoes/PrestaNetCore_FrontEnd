import * as yup from 'yup'

const guidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const personalGuarantorTypeCode = 'PERSONAL_GUARANTOR'

const normalizeOptionalString = (value: unknown) => {
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

const toNullableDateOnly = (value: unknown) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

export const collateralCreateSchema = yup.object({
  ownerClientId: yup
    .string()
    .trim()
    .matches(guidRegex, {
      message: 'El cliente debe ser un GUID válido.',
      excludeEmptyString: true,
    })
    .required('El cliente es requerido.'),
  collateralTypeId: yup
    .string()
    .trim()
    .matches(guidRegex, 'El tipo de garantía debe ser un GUID válido.')
    .required('El tipo de garantía es requerido.'),
  collateralTypeCode: yup.string().trim().nullable().notRequired(),
  guarantorClientId: yup
    .string()
    .trim()
    .nullable()
    .when('collateralTypeCode', {
      is: (typeCode?: string | null) =>
        (typeCode ?? '').trim().toUpperCase() === personalGuarantorTypeCode,
      then: (schema) =>
        schema
          .required('El cliente aval es requerido para aval personal.')
          .test(
            'guarantor-guid',
            'El cliente aval debe ser un GUID válido.',
            (value) => !value || guidRegex.test(value),
          )
          .test(
            'guarantor-different-owner',
            'El cliente aval debe ser distinto del titular.',
            function validateGuarantor(guarantorClientId) {
              const ownerClientId = (this.parent.ownerClientId ?? '').trim()
              const guarantor = (guarantorClientId ?? '').trim()
              if (!ownerClientId || !guarantor) return true
              return ownerClientId !== guarantor
            },
          ),
      otherwise: (schema) => schema.nullable().notRequired(),
    }),
  statusId: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      'status-guid',
      'El estado debe ser un GUID válido.',
      (value) => !value || guidRegex.test(value),
    ),
  referenceNo: yup
    .string()
    .transform(normalizeOptionalString)
    .nullable()
    .required('La referencia es requerida.')
    .max(60, 'La referencia no puede superar 60 caracteres.'),
  description: yup
    .string()
    .transform(normalizeOptionalString)
    .nullable()
    .required('La descripción es requerida.')
    .max(500, 'La descripción no puede superar 500 caracteres.'),
  appraisedValue: yup
    .number()
    .transform(toNullableNumber)
    .nullable()
    .typeError('El valor de avalúo debe ser numérico.')
    .min(0, 'El valor de avalúo debe ser mayor o igual a 0.')
    .required('El valor de avalúo es requerido.'),
  appraisedDate: yup
    .string()
    .transform(toNullableDateOnly)
    .nullable()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD.')
    .notRequired(),
})

export const collateralUpdateSchema = collateralCreateSchema.shape({
  statusId: yup
    .string()
    .trim()
    .matches(guidRegex, 'El estado debe ser un GUID válido.')
    .required('El estado es requerido.'),
  isActive: yup.boolean().required(),
})

export type CollateralCreateFormValues = yup.InferType<typeof collateralCreateSchema>
export type CollateralUpdateFormValues = yup.InferType<typeof collateralUpdateSchema>
