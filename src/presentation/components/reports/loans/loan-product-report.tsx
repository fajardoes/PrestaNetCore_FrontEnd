import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { ReportLayout } from '@/presentation/components/reports/report-layout'
import type { LoanProductDetailDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-detail.dto'
import { formatRateAsPercent } from '@/core/helpers/rate-percent'

export interface LoanProductReportData {
  product: LoanProductDetailDto
  labels: {
    termUnit?: string
    interestRateType?: string
    rateBase?: string
    amortizationMethod?: string
    paymentFrequency?: string
    portfolioType?: string
  }
  glAccounts: {
    loanPortfolio?: string
    interestIncome?: string
    interestSuspense?: string | null
    feeIncome?: string | null
    insurancePayable?: string | null
  }
  fees: Array<{
    feeType: string
    chargeBase: string
    valueType: string
    value: number
    chargeTiming: string
    isActive: boolean
  }>
  insurances: Array<{
    insuranceType: string
    calculationBase: string
    coveragePeriod: string
    rate: number
    chargeTiming: string
    isActive: boolean
  }>
  collateralRules: Array<{
    collateralType: string
    minCoverageRatio: number
    maxItems?: number | null
    isActive: boolean
  }>
}

export interface LoanProductReportProps {
  data: LoanProductReportData
  organizationName?: string
}

export const LoanProductReport = ({
  data,
  organizationName = 'PrestaNet',
}: LoanProductReportProps) => {
  const { product } = data

  return (
    <ReportLayout
      title="Detalle de producto de prestamo"
      subtitle={`Producto ${product.code} - ${product.name}`}
      organizationName={organizationName}
    >
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Datos generales</Text>
        <View style={styles.grid}>
          <InfoItem label="Codigo" value={product.code} />
          <InfoItem label="Nombre" value={product.name} />
          <InfoItem label="Estado" value={product.isActive ? 'Activo' : 'Inactivo'} />
          <InfoItem label="Moneda" value={product.currencyCode} />
          <InfoItem label="Descripcion" value={product.description || '—'} />
        </View>
      </View>

      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Condiciones</Text>
        <View style={styles.grid}>
          <InfoItem label="Monto minimo" value={formatAmount(product.minAmount)} />
          <InfoItem label="Monto maximo" value={formatAmount(product.maxAmount)} />
          <InfoItem label="Plazo minimo" value={`${product.minTerm} ${data.labels.termUnit ?? ''}`.trim()} />
          <InfoItem label="Plazo maximo" value={`${product.maxTerm} ${data.labels.termUnit ?? ''}`.trim()} />
          <InfoItem label="Unidad plazo" value={data.labels.termUnit || product.termUnitId} />
        </View>
      </View>

      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Interes y amortizacion</Text>
        <View style={styles.grid}>
          <InfoItem label="Tipo de tasa" value={data.labels.interestRateType || product.interestRateTypeId} />
          <InfoItem label="Tasa nominal" value={formatRateAsPercent(product.nominalRate)} />
          <InfoItem label="Base de tasa" value={data.labels.rateBase || product.rateBaseId} />
          <InfoItem label="Metodo" value={data.labels.amortizationMethod || product.amortizationMethodId} />
          <InfoItem label="Frecuencia" value={data.labels.paymentFrequency || product.paymentFrequencyId} />
          <InfoItem label="Gracia capital" value={product.gracePrincipal.toString()} />
          <InfoItem label="Gracia interes" value={product.graceInterest.toString()} />
        </View>
      </View>

      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Garantias y seguros</Text>
        <View style={styles.grid}>
          <InfoItem label="Requiere garantia" value={product.requiresCollateral ? 'Si' : 'No'} />
          <InfoItem
            label="Ratio minimo garantia"
            value={
              product.requiresCollateral && product.minCollateralRatio != null
                ? product.minCollateralRatio.toString()
                : '—'
            }
          />
          <InfoItem label="Tiene seguro" value={product.hasInsurance ? 'Si' : 'No'} />
        </View>
      </View>

      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Regulacion</Text>
        <View style={styles.grid}>
          <InfoItem label="Tipo cartera" value={data.labels.portfolioType || product.portfolioTypeId} />
        </View>
      </View>

      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Mapeo contable (GL)</Text>
        <View style={styles.grid}>
          <InfoItem label="Cuenta cartera" value={data.glAccounts.loanPortfolio || product.glLoanPortfolioAccountId} />
          <InfoItem label="Intereses" value={data.glAccounts.interestIncome || product.glInterestIncomeAccountId} />
          <InfoItem label="Intereses suspendidos" value={data.glAccounts.interestSuspense || '—'} />
          <InfoItem label="Comisiones" value={data.glAccounts.feeIncome || '—'} />
          <InfoItem label="Seguros por pagar" value={data.glAccounts.insurancePayable || '—'} />
        </View>
      </View>

      <CollectionSection
        title="Comisiones"
        headers={["Tipo", "Base", "Tipo valor", "Valor", "Momento", "Estado"]}
        rows={data.fees.map((item) => [
          item.feeType,
          item.chargeBase,
          item.valueType,
          formatAmount(item.value),
          item.chargeTiming,
          item.isActive ? 'Activo' : 'Inactivo',
        ])}
      />

      <CollectionSection
        title="Seguros"
        headers={["Tipo", "Base calculo", "Cobertura", "Tasa", "Momento", "Estado"]}
        rows={data.insurances.map((item) => [
          item.insuranceType,
          item.calculationBase,
          item.coveragePeriod,
          formatAmount(item.rate),
          item.chargeTiming,
          item.isActive ? 'Activo' : 'Inactivo',
        ])}
      />

      <CollectionSection
        title="Garantias"
        headers={["Tipo", "Ratio minimo", "Max items", "Estado"]}
        rows={data.collateralRules.map((item) => [
          item.collateralType,
          item.minCoverageRatio != null ? String(item.minCoverageRatio) : '—',
          item.maxItems != null ? String(item.maxItems) : '—',
          item.isActive ? 'Activo' : 'Inactivo',
        ])}
      />
    </ReportLayout>
  )
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
)

const CollectionSection = ({
  title,
  headers,
  rows,
}: {
  title: string
  headers: string[]
  rows: string[][]
}) => (
  <View style={styles.section} wrap={false}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {rows.length ? (
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          {headers.map((header) => (
            <Text key={header} style={styles.tableHeaderCell}>
              {header}
            </Text>
          ))}
        </View>
        {rows.map((row, index) => (
          <View key={`${title}-${index}`} style={styles.tableRow}>
            {row.map((cell, cellIndex) => (
              <Text key={`${title}-${index}-${cellIndex}`} style={styles.tableCell}>
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </View>
    ) : (
      <Text style={styles.emptyText}>Sin registros.</Text>
    )}
  </View>
)

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0.00'
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    color: '#0f172a',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoItem: {
    width: '48%',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    color: '#0f172a',
  },
  table: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 4,
    fontSize: 8,
    fontWeight: 700,
    color: '#475569',
  },
  tableCell: {
    flex: 1,
    padding: 4,
    fontSize: 8,
    color: '#0f172a',
  },
  emptyText: {
    fontSize: 9,
    color: '#64748b',
  },
})
