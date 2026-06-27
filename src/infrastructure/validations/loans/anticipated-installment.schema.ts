import * as yup from 'yup'

const optionalText = yup.string().trim().max(500, 'Máximo 500 caracteres.').nullable()
const optionalNumber = () =>
  yup.number().transform((value, originalValue) => (originalValue === '' ? null : value)).nullable()

export const anticipatedInstallmentUpsertSchema = yup.object({
  amount: yup.number().typeError('Ingresa un monto válido.').moreThan(0, 'El monto debe ser mayor que cero.').required(),
  reason: optionalText.optional(),
  notes: optionalText.optional(),
})

export const anticipatedInstallmentReasonSchema = yup.object({
  reason: yup.string().trim().required('Debes ingresar un motivo.').max(500, 'Máximo 500 caracteres.'),
})

export const anticipatedInstallmentApplySchema = yup.object({
  applyFullPending: yup.boolean().required(),
  amount: yup.number().nullable().when('applyFullPending', {
    is: false,
    then: (schema) => schema.typeError('Ingresa un monto válido.').moreThan(0, 'El monto debe ser mayor que cero.').required(),
    otherwise: (schema) => schema.nullable(),
  }),
  reason: optionalText.optional(),
})

export const anticipatedInstallmentSettingSchema = yup.object({
  loanProductId: yup.string().nullable().when('isGlobal', {
    is: false,
    then: (schema) => schema.required('Selecciona un producto.'),
    otherwise: (schema) => schema.nullable(),
  }),
  isGlobal: yup.boolean().required(),
  isEnabled: yup.boolean().required(),
  maxAmount: optionalNumber().typeError('Ingresa un monto válido.').min(0, 'El monto no puede ser negativo.'),
  maxPercentageOfApprovedAmount: optionalNumber().typeError('Ingresa un porcentaje válido.').min(0, 'El porcentaje no puede ser negativo.'),
  limitStrategyCode: yup.string().trim().required('Selecciona una estrategia.'),
  requiresAuthorizationAboveLimit: yup.boolean().required(),
  authorizationThresholdAmount: optionalNumber().typeError('Ingresa un monto válido.').min(0, 'El monto no puede ser negativo.'),
  authorizationThresholdPercentage: optionalNumber().typeError('Ingresa un porcentaje válido.').min(0, 'El porcentaje no puede ser negativo.'),
  autoApplyRemainingAnticipatedInstallmentOnClosure: yup.boolean().required(),
  blockClosureWhenAnticipatedInstallmentPending: yup.boolean().required(),
  effectiveFrom: yup.string().nullable(),
  effectiveTo: yup.string().nullable(),
  isActive: yup.boolean().required(),
})

export type AnticipatedInstallmentUpsertValues = yup.InferType<typeof anticipatedInstallmentUpsertSchema>
export type AnticipatedInstallmentReasonValues = yup.InferType<typeof anticipatedInstallmentReasonSchema>
export type AnticipatedInstallmentApplyValues = yup.InferType<typeof anticipatedInstallmentApplySchema>
export type AnticipatedInstallmentSettingValues = yup.InferType<typeof anticipatedInstallmentSettingSchema>
