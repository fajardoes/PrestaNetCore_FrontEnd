import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { ReportLayout } from '@/presentation/components/reports/report-layout'
import type { IncomeStatementResultDto } from '@/infrastructure/accounting/dtos/reports/income-statement-result.dto'

export interface IncomeStatementReportProps {
  companyName: string
  logoUrl?: string
  result: IncomeStatementResultDto
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

const buildPeriodLabel = (result: IncomeStatementResultDto) => {
  const fromDate = formatDateFromString(result.fromDate)
  const toDate = formatDateFromString(result.toDate)

  if (fromDate && toDate) return `Del ${fromDate} al ${toDate}`
  if (fromDate) return `Desde ${fromDate}`
  if (toDate) return `Hasta ${toDate}`
  if (result.periodId) return `Periodo ${result.periodId}`
  return 'Periodo seleccionado'
}

export const IncomeStatementReport = ({
  companyName,
  logoUrl,
  result,
  currencyCode,
}: IncomeStatementReportProps) => {
  const subtitle = buildPeriodLabel(result)

  return (
    <ReportLayout
      title="Estado de resultados"
      subtitle={subtitle}
      organizationName={companyName}
      logoUrl={logoUrl}
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

      <View style={styles.totalsRow}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total ingresos</Text>
          <Text style={styles.totalValue}>{formatAmount(result.totalIncome)}</Text>
        </View>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total gastos</Text>
          <Text style={styles.totalValue}>{formatAmount(result.totalExpenses)}</Text>
        </View>
        <View style={[styles.totalCard, styles.totalCardLast]}>
          <Text style={styles.totalLabel}>Resultado neto</Text>
          <Text style={styles.totalValue}>{formatAmount(result.netResult)}</Text>
        </View>
      </View>

      {result.groups.map((group) => (
        <View key={group.groupKey} style={styles.groupSection}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>{group.groupName}</Text>
            <Text style={styles.groupTotal}>{formatAmount(group.total)}</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cell, styles.cellCode]}>Codigo</Text>
              <Text style={[styles.cell, styles.cellName]}>Cuenta</Text>
              <Text style={[styles.cell, styles.cellAmount]}>Saldo</Text>
            </View>
            {group.accounts.map((account) => (
              <View key={account.accountId} style={styles.tableRow}>
                <Text style={[styles.cell, styles.cellCode]}>{account.accountCode}</Text>
                <Text style={[styles.cell, styles.cellName]}>{account.accountName}</Text>
                <Text style={[styles.cell, styles.cellAmount]}>
                  {formatAmount(account.balance)}
                </Text>
              </View>
            ))}
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.cell, styles.cellCode, styles.totalLabel]}>Total</Text>
              <Text style={[styles.cell, styles.cellName]} />
              <Text style={[styles.cell, styles.cellAmount, styles.totalValue]}>
                {formatAmount(group.total)}
              </Text>
            </View>
          </View>
        </View>
      ))}
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
  totalsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  totalCard: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
    marginRight: 8,
  },
  totalCardLast: {
    marginRight: 0,
  },
  totalLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    color: '#64748b',
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 700,
    color: '#0f172a',
    marginTop: 4,
  },
  groupSection: {
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomWidth: 0,
  },
  groupTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#0f172a',
  },
  groupTotal: {
    fontSize: 10,
    fontWeight: 700,
    color: '#0f172a',
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
    flex: 3,
  },
  cellAmount: {
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    backgroundColor: '#f8fafc',
  },
})
