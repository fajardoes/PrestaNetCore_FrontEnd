import { StyleSheet, Text, View } from '@react-pdf/renderer'
import type { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry'
import { ReportLayout } from '@/presentation/components/reports/report-layout'

export interface JournalEntryVoucherReportProps {
  entry: JournalEntryDetail
  organizationName?: string
  logoUrl?: string
}

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return '0.00'
  try {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2,
    }).format(value)
  } catch {
    return value.toFixed(2)
  }
}

const formatDate = (value?: string | null) => {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('es-HN')
}

const formatState = (state: JournalEntryDetail['state']) => {
  if (state === 'posted') return 'Contabilizado'
  if (state === 'voided') return 'Anulado'
  return 'Borrador'
}

const formatSource = (source: JournalEntryDetail['source']) =>
  source === 'system' ? 'Sistema' : 'Manual'

const formatIdentifier = (value?: string | null) => {
  if (!value) return '-'
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  return isUuid ? '-' : value
}

export const JournalEntryVoucherReport = ({
  entry,
  organizationName,
  logoUrl,
}: JournalEntryVoucherReportProps) => {
  const subtitle = entry.number ? `Asiento N. ${entry.number}` : undefined

  return (
    <ReportLayout
      title="Comprobante de Asiento Contable"
      subtitle={subtitle}
      organizationName={organizationName}
      logoUrl={logoUrl}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Encabezado del asiento</Text>
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Numero</Text>
            <Text style={styles.infoValue}>{entry.number || '-'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoValue}>{formatDate(entry.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Periodo</Text>
            <Text style={styles.infoValue}>
              {entry.periodName ? entry.periodName : formatIdentifier(entry.periodId)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado</Text>
            <Text style={styles.infoValue}>{formatState(entry.state)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Origen</Text>
            <Text style={styles.infoValue}>{formatSource(entry.source)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Centro de costo</Text>
            <Text style={styles.infoValue}>
              {entry.costCenterName
                ? entry.costCenterName
                : formatIdentifier(entry.costCenterId)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Descripcion</Text>
            <Text style={styles.infoValue}>{entry.description}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalle de lineas</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.cellCode]}>Codigo</Text>
            <Text style={[styles.cell, styles.cellName]}>Cuenta</Text>
            <Text style={[styles.cell, styles.cellDescription]}>Descripcion</Text>
            <Text style={[styles.cell, styles.cellAmount]}>Debe</Text>
            <Text style={[styles.cell, styles.cellAmount]}>Haber</Text>
          </View>
          {entry.lines.map((line, index) => (
            <View
              key={`${line.accountId}-${index}`}
              style={styles.tableRow}
            >
              <Text style={[styles.cell, styles.cellCode]}>
                {line.accountCode ? line.accountCode : line.accountId}
              </Text>
              <Text style={[styles.cell, styles.cellName]}>
                {line.accountName ? line.accountName : '-'}
              </Text>
              <Text style={[styles.cell, styles.cellDescription]}>
                {line.description ? line.description : '-'}
              </Text>
              <Text style={[styles.cell, styles.cellAmount]}>
                {formatCurrency(line.debit)}
              </Text>
              <Text style={[styles.cell, styles.cellAmount]}>
                {formatCurrency(line.credit)}
              </Text>
            </View>
          ))}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.cell, styles.cellCode]}> </Text>
            <Text style={[styles.cell, styles.cellName]}> </Text>
            <Text style={[styles.cell, styles.cellDescription, styles.totalLabel]}>
              Totales
            </Text>
            <Text style={[styles.cell, styles.cellAmount, styles.totalValue]}>
              {formatCurrency(entry.totalDebit)}
            </Text>
            <Text style={[styles.cell, styles.cellAmount, styles.totalValue]}>
              {formatCurrency(entry.totalCredit)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Firmas</Text>
        <View style={styles.signatures}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Elaborado por</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Revisado por</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Autorizado por</Text>
          </View>
        </View>
      </View>
    </ReportLayout>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#0f172a',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  infoLabel: {
    width: 110,
    fontSize: 9,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 10,
    color: '#0f172a',
    flexGrow: 1,
    flexShrink: 1,
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
    flex: 1.1,
  },
  cellName: {
    flex: 2,
  },
  cellDescription: {
    flex: 2.4,
  },
  cellAmount: {
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    backgroundColor: '#f8fafc',
  },
  totalLabel: {
    fontWeight: 700,
    textAlign: 'right',
  },
  totalValue: {
    fontWeight: 700,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  signatureBlock: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
    paddingTop: 12,
  },
  signatureLine: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
    marginBottom: 8,
  },
  signatureLabel: {
    fontSize: 9,
    color: '#475569',
  },
})
