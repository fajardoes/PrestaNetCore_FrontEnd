import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { ReportLayout } from '@/presentation/components/reports/report-layout'

export interface GeneralLedgerLine {
  date: string
  documentNumber: string
  journalEntryNumber?: string
  description: string
  debit: number
  credit: number
  balance: number
}

export interface GeneralLedgerReportProps {
  accountCode: string
  accountName: string
  currencyCode: string
  periodLabel: string
  openingBalance: number
  lines: GeneralLedgerLine[]
  totals: {
    totalDebit: number
    totalCredit: number
    finalBalance: number
  }
  organizationName?: string
  logoUrl?: string
}

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0.00'
  return value.toFixed(2)
}

export const GeneralLedgerReport = ({
  accountCode,
  accountName,
  currencyCode,
  periodLabel,
  openingBalance,
  lines,
  totals,
  organizationName,
  logoUrl,
}: GeneralLedgerReportProps) => {
  const subtitle = `Cuenta ${accountCode} - ${accountName} (${periodLabel})`

  return (
    <ReportLayout
      title="Mayor contable"
      subtitle={subtitle}
      organizationName={organizationName}
      logoUrl={logoUrl}
      orientation="landscape"
    >
      <View style={styles.section}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Cuenta:</Text>
          <Text style={styles.summaryValue}>
            {accountCode} - {accountName}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Moneda:</Text>
          <Text style={styles.summaryValue}>{currencyCode}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Periodo:</Text>
          <Text style={styles.summaryValue}>{periodLabel}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Saldo inicial:</Text>
          <Text style={styles.summaryValue}>
            {formatAmount(openingBalance)} {currencyCode}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.cell, styles.cellDate]}>Fecha</Text>
          <Text style={[styles.cell, styles.cellDoc]}>Doc.</Text>
          <Text style={[styles.cell, styles.cellEntry]}>Asiento</Text>
          <Text style={[styles.cell, styles.cellDescription]}>Descripcion</Text>
          <Text style={[styles.cell, styles.cellAmount]}>Debe</Text>
          <Text style={[styles.cell, styles.cellAmount]}>Haber</Text>
          <Text style={[styles.cell, styles.cellAmount]}>Saldo</Text>
        </View>
        {lines.map((line, index) => (
          <View style={styles.tableRow} key={`${line.documentNumber}-${index}`}>
            <Text style={[styles.cell, styles.cellDate]}>{line.date}</Text>
            <Text style={[styles.cell, styles.cellDoc]}>{line.documentNumber}</Text>
            <Text style={[styles.cell, styles.cellEntry]}>
              {line.journalEntryNumber || '-'}
            </Text>
            <Text style={[styles.cell, styles.cellDescription]}>
              {line.description}
            </Text>
            <Text style={[styles.cell, styles.cellAmount]}>
              {formatAmount(line.debit)}
            </Text>
            <Text style={[styles.cell, styles.cellAmount]}>
              {formatAmount(line.credit)}
            </Text>
            <Text style={[styles.cell, styles.cellAmount]}>
              {formatAmount(line.balance)}
            </Text>
          </View>
        ))}
        <View style={[styles.tableRow, styles.totalRow]}>
          <Text style={[styles.cell, styles.cellDate]} />
          <Text style={[styles.cell, styles.cellDoc]} />
          <Text style={[styles.cell, styles.cellEntry]} />
          <Text style={[styles.cell, styles.cellDescription, styles.totalLabel]}>
            Totales
          </Text>
          <Text style={[styles.cell, styles.cellAmount, styles.totalValue]}>
            {formatAmount(totals.totalDebit)}
          </Text>
          <Text style={[styles.cell, styles.cellAmount, styles.totalValue]}>
            {formatAmount(totals.totalCredit)}
          </Text>
          <Text style={[styles.cell, styles.cellAmount, styles.totalValue]}>
            {formatAmount(totals.finalBalance)}
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
    width: 80,
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
  cellDate: {
    flex: 1,
  },
  cellDoc: {
    flex: 1.2,
  },
  cellEntry: {
    flex: 1.2,
  },
  cellDescription: {
    flex: 2.8,
  },
  cellAmount: {
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    backgroundColor: '#f8fafc',
  },
  totalLabel: {
    textAlign: 'right',
    fontWeight: 700,
  },
  totalValue: {
    fontWeight: 700,
  },
})
