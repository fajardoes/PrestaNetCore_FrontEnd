import * as yup from 'yup'

const transformNumericValue = (_value: unknown, originalValue: unknown) => {
  if (typeof originalValue === 'number' && Number.isFinite(originalValue)) {
    return originalValue
  }

  if (typeof originalValue === 'string') {
    const normalized = originalValue.replace(/,/g, '').trim()
    if (!normalized) return Number.NaN
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : Number.NaN
  }

  if (originalValue == null || originalValue === '') {
    return Number.NaN
  }

  return Number(originalValue)
}

const nonNegativeNumberField = (label: string) =>
  yup
    .number()
    .transform(transformNumericValue)
    .typeError(`${label} debe ser numérico.`)
    .min(0, `${label} no puede ser negativo.`)
    .required(`${label} es obligatorio.`)

export const loanApplicationFinancialProfileSchema = yup.object({
  analysisPeriodType: yup
    .mixed<'monthly'>()
    .oneOf(['monthly'], 'Solo se permite analisis mensual.')
    .required('El periodo de analisis es obligatorio.'),
  notes: yup
    .string()
    .trim()
    .required('Las notas son obligatorias.')
    .max(2000, 'Máximo 2000 caracteres.'),
  analysisComments: yup
    .string()
    .trim()
    .max(2000, 'Máximo 2000 caracteres.')
    .nullable()
    .optional(),
  cashAndBanks: nonNegativeNumberField('Cajas y bancos'),
  accountsReceivable: nonNegativeNumberField('Cuentas por cobrar'),
  inventoryValue: nonNegativeNumberField('Valor inventario'),
  housesAndLand: nonNegativeNumberField('Casas y terrenos'),
  vehicles: nonNegativeNumberField('Vehiculos'),
  householdGoods: nonNegativeNumberField('Menajes'),
  accountsPayableSuppliers: nonNegativeNumberField('Cuentas por pagar proveedores'),
  loansPayable: nonNegativeNumberField('Prestamos por pagar'),
  otherLiabilities: yup
    .array()
    .of(
      yup.object({
        id: yup.string().trim().nullable().optional(),
        description: yup
          .string()
          .trim()
          .required('La descripcion es obligatoria.')
          .max(250, 'Máximo 250 caracteres.'),
        amount: nonNegativeNumberField('Monto'),
        sortOrder: yup.number().integer().min(1).nullable().optional(),
      }),
    )
    .required(),
  businessIncome: nonNegativeNumberField('Ingresos del negocio'),
  salaryIncome: nonNegativeNumberField('Ingreso por salario'),
  spouseChildrenIncome: nonNegativeNumberField('Conyuge e hijos'),
  remittancesIncome: nonNegativeNumberField('Remesas'),
  otherIncome: nonNegativeNumberField('Otros ingresos'),
  businessCostOfSales: nonNegativeNumberField('Costo de venta del negocio'),
  foodExpense: nonNegativeNumberField('Alimentacion'),
  healthEducationExpense: nonNegativeNumberField('Salud y educacion'),
  utilitiesExpense: nonNegativeNumberField('Servicios publicos'),
  loanInstallmentExpense: nonNegativeNumberField('Pago de cuotas de prestamos'),
})

export type LoanApplicationFinancialProfileFormValues = yup.InferType<
  typeof loanApplicationFinancialProfileSchema
>
