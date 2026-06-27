import { StyleSheet, Text, View } from '@react-pdf/renderer'
import type { LoanSchedulePreviewResponse } from '@/infrastructure/loans/responses/loan-schedule-preview-response'
import { ReportLayout } from '@/presentation/components/reports/report-layout'
import { formatRateAsPercent } from '@/core/helpers/rate-percent'
import {
  formatDate,
  formatInterestCalculationMethod,
  formatPaymentFrequencyCode,
  formatTermUnitCode,
  getInstallmentComponentAmount,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

export interface LoanPaymentPlanReportProps {
  preview: LoanSchedulePreviewResponse
  applicationLabel?: string
  organizationName?: string
}

const formatMoney = (value: number) => {
  if (!Number.isFinite(value)) return '0.00'
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
)

export const LoanPaymentPlanReport = ({
  preview,
  applicationLabel,
  organizationName = 'PrestaNet',
}: LoanPaymentPlanReportProps) => (
  <ReportLayout
    title="Plan de pagos"
    subtitle={applicationLabel ? `Solicitud ${applicationLabel}` : 'Vista previa del plan de pagos'}
    organizationName={organizationName}
    orientation="landscape"
  >
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>Resumen</Text>
      <View style={styles.grid}>
        <InfoItem
          label="Duracion contractual"
          value={`${preview.metadata.contractualTerm} ${formatTermUnitCode(preview.metadata.termUnitCode)}`}
        />
        <InfoItem
          label="Frecuencia de pago"
          value={formatPaymentFrequencyCode(preview.metadata.paymentFrequencyCode)}
        />
        <InfoItem
          label="Vencimiento contractual"
          value={formatDate(preview.metadata.maturityDate)}
        />
        <InfoItem
          label="Cuotas generadas"
          value={String(preview.metadata.installmentsCount)}
        />
        <InfoItem
          label="Tasa nominal"
          value={formatRateAsPercent(preview.metadata.nominalRate)}
        />
        <InfoItem
          label="Tasa efectiva por periodo"
          value={formatRateAsPercent(preview.metadata.effectivePeriodRate)}
        />
        <InfoItem
          label="Metodo de interes"
          value={formatInterestCalculationMethod(preview.metadata.interestCalculationMethod)}
        />
        <InfoItem
          label="Ajuste ultima cuota"
          value={formatMoney(preview.metadata.lastInstallmentAdjustment)}
        />
      </View>
    </View>

    {preview.disbursement ? (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Desembolso proyectado</Text>
        <View style={styles.grid}>
          <InfoItem label="Monto bruto" value={formatMoney(preview.disbursement.grossDisbursementAmount)} />
          <InfoItem label="Comisiones de desembolso" value={formatMoney(preview.disbursement.totalDisbursementFees)} />
          <InfoItem label="Seguro al desembolso" value={formatMoney(preview.disbursement.totalDisbursementInsurance)} />
          <InfoItem label="Cuota anticipada retenida" value={formatMoney(preview.disbursement.anticipatedInstallmentDeductionAmount)} />
          <InfoItem label="Neto a entregar" value={formatMoney(preview.disbursement.netDisbursementAmount)} />
        </View>
      </View>
    ) : null}

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Detalle de cuotas</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, styles.headerCell, styles.smallCell]}>#</Text>
          <Text style={[styles.cell, styles.headerCell]}>Fecha original</Text>
          <Text style={[styles.cell, styles.headerCell]}>Fecha cobro</Text>
          <Text style={[styles.cell, styles.headerCell, styles.amountCell]}>Capital</Text>
          <Text style={[styles.cell, styles.headerCell, styles.amountCell]}>Interes</Text>
          <Text style={[styles.cell, styles.headerCell, styles.amountCell]}>Seguro</Text>
          <Text style={[styles.cell, styles.headerCell, styles.amountCell]}>Total</Text>
        </View>
        {preview.installments.map((row) => (
          <View key={row.installmentNo} style={styles.tableRow}>
            <Text style={[styles.cell, styles.smallCell]}>{String(row.installmentNo)}</Text>
            <Text style={styles.cell}>{formatDate(row.dueDateOriginal)}</Text>
            <Text style={styles.cell}>{formatDate(row.dueDateAdjusted)}</Text>
            <Text style={[styles.cell, styles.amountCell]}>{formatMoney(row.principal)}</Text>
            <Text style={[styles.cell, styles.amountCell]}>{formatMoney(row.interest)}</Text>
            <Text style={[styles.cell, styles.amountCell]}>
              {formatMoney(getInstallmentComponentAmount(row.components, 'INSURANCE'))}
            </Text>
            <Text style={[styles.cell, styles.amountCell]}>{formatMoney(row.total)}</Text>
          </View>
        ))}
      </View>
    </View>
  </ReportLayout>
)

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 6,
    fontSize: 11,
    fontWeight: 700,
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
  tableHeader: {
    backgroundColor: '#f8fafc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cell: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 9,
    color: '#0f172a',
  },
  headerCell: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: '#475569',
  },
  smallCell: {
    flexBasis: '6%',
    flexGrow: 0,
  },
  amountCell: {
    textAlign: 'right',
  },
})
