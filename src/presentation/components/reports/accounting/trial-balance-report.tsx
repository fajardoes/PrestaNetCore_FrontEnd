import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { ReportLayout } from '@/presentation/components/reports/report-layout'
import type { TrialBalanceResultDto } from '@/infrastructure/accounting/dtos/reports/trial-balance-result.dto'

export interface TrialBalanceReportProps {
  companyName: string
  logoUrl?: string
  result: TrialBalanceResultDto
  currencyCode: string
}

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0.00'
  return value.toFixed(2)
}

const formatDateFromString = (value?: string | null) => {
  if (!value) return null
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`
  }
  return value
}

const buildPeriodLabel = (result: TrialBalanceResultDto) => {
  const fromDate = formatDateFromString(result.fromDate)
  const toDate = formatDateFromString(result.toDate)

  if (fromDate && toDate) return `Del ${fromDate} al ${toDate}`
  if (fromDate) return `Desde ${fromDate}`
  if (toDate) return `Hasta ${toDate}`
  if (result.periodId) return `Periodo ${result.periodId}`
  return 'Periodo seleccionado'
}

export const TrialBalanceReport = ({
  companyName,
  logoUrl,
  result,
  currencyCode,
}: TrialBalanceReportProps) => {
  const subtitle = buildPeriodLabel(result)

  return (
    <ReportLayout
      title="Balance de comprobacion"
      subtitle={subtitle}
      organizationName={companyName}
      logoUrl={logoUrl}
      orientation="landscape"
    >
      <View style={styles.section}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Moneda:</Text>
          <Text style={styles.summaryValue}>{currencyCode}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Centro:</Text>
          <Text style={styles.summaryValue}>
            {result.costCenterName ? result.costCenterName : 'Todos'}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, styles.cellCode]}>Codigo</Text>
          <Text style={[styles.cell, styles.cellName]}>Cuenta</Text>
          <Text style={[styles.cell, styles.cellAmount]}>Saldo inicial</Text>
          <Text style={[styles.cell, styles.cellAmount]}>Debitos</Text>
          <Text style={[styles.cell, styles.cellAmount]}>Creditos</Text>
          <Text style={[styles.cell, styles.cellAmount]}>Saldo final</Text>
        </View>
        {result.rows.map((row) => (
          <View key={`${row.accountId}-${row.level}`} style={styles.tableRow}>
            <Text style={[styles.cell, styles.cellCode]}>{row.accountCode}</Text>
            <Text style={[styles.cell, styles.cellName]}>{row.accountName}</Text>
            <Text style={[styles.cell, styles.cellAmount]}>
              {formatAmount(row.openingBalance)}
            </Text>
            <Text style={[styles.cell, styles.cellAmount]}>
              {formatAmount(row.debit)}
            </Text>
            <Text style={[styles.cell, styles.cellAmount]}>
              {formatAmount(row.credit)}
            </Text>
            <Text style={[styles.cell, styles.cellAmount]}>
              {formatAmount(row.closingBalance)}
            </Text>
          </View>
        ))}
        <View style={[styles.tableRow, styles.totalRow]}>
          <Text style={[styles.cell, styles.cellCode, styles.totalLabel]}>Totales</Text>
          <Text style={[styles.cell, styles.cellName]} />
          <Text style={[styles.cell, styles.cellAmount, styles.totalValue]}>
            {formatAmount(result.totalOpeningBalance)}
          </Text>
          <Text style={[styles.cell, styles.cellAmount, styles.totalValue]}>
            {formatAmount(result.totalDebit)}
          </Text>
          <Text style={[styles.cell, styles.cellAmount, styles.totalValue]}>
            {formatAmount(result.totalCredit)}
          </Text>
          <Text style={[styles.cell, styles.cellAmount, styles.totalValue]}>
            {formatAmount(result.totalClosingBalance)}
          </Text>
        </View>
      </View>
    </ReportLayout>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  summaryLabel: {
    width: 70,
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 10,
    color: '#0f172a',
    flexGrow: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 4,
  },
  cell: {
    fontSize: 9,
    color: '#0f172a',
    paddingHorizontal: 6,
  },
  cellCode: {
    flex: 1.2,
  },
  cellName: {
    flex: 2.8,
  },
  cellAmount: {
    flex: 1.1,
    textAlign: 'right',
  },
  totalRow: {
    backgroundColor: '#f8fafc',
  },
  totalLabel: {
    fontWeight: 700,
  },
  totalValue: {
    fontWeight: 700,
  },
})
