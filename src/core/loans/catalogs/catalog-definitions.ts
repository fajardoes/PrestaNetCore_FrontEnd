import type { LoanCatalogKey } from '@/infrastructure/loans/api/loan-catalogs-api'

export interface LoanCatalogDefinition {
  key: LoanCatalogKey
  title: string
  description?: string
}

export const LOAN_CATALOG_DEFINITIONS: LoanCatalogDefinition[] = [
  { key: 'term-units', title: 'Unidades de plazo' },
  { key: 'interest-rate-types', title: 'Tipos de tasa' },
  { key: 'rate-bases', title: 'Bases de tasa' },
  { key: 'amortization-methods', title: 'Métodos de amortización' },
  { key: 'payment-frequencies', title: 'Frecuencias de pago' },
  { key: 'portfolio-types', title: 'Tipos de cartera' },
  { key: 'fee-types', title: 'Tipos de comisión' },
  { key: 'fee-charge-bases', title: 'Bases de cobro' },
  { key: 'fee-value-types', title: 'Tipos de valor' },
  { key: 'fee-charge-timings', title: 'Momentos de cobro' },
  { key: 'insurance-types', title: 'Tipos de seguro' },
  { key: 'insurance-calculation-bases', title: 'Bases de cálculo de seguro' },
  { key: 'insurance-coverage-periods', title: 'Períodos de cobertura' },
  { key: 'insurance-charge-timings', title: 'Momentos de cobro de seguro' },
  { key: 'collateral-types', title: 'Tipos de garantía' },
]
