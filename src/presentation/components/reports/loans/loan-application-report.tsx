import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from '@react-pdf/renderer'
import { formatHnIdentity } from '@/core/helpers/hn-identity'
import { formatRateAsPercent } from '@/core/helpers/rate-percent'
import type {
  LoanApplicationReportClientActivity,
  LoanApplicationReportCollateral,
  LoanApplicationReportFinancialProfile,
  LoanApplicationReportResponse,
} from '@/infrastructure/loans/responses/loan-application-report-response'
import { ReportLayout } from '@/presentation/components/reports/report-layout'
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatRatio,
  translateLoanApplicationStatus,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

export interface LoanApplicationReportProps {
  data: LoanApplicationReportResponse
  organizationName?: string
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
)

const Section = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <View style={styles.section} wrap={false}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionBody}>{children}</View>
  </View>
)

const buildWorkflowNotes = (data: LoanApplicationReportResponse) =>
  [
    {
      label: 'Notas de solicitud',
      value: data.application.notes,
    },
    {
      label: 'Motivo de rechazo',
      value: data.application.rejectedReason,
    },
    {
      label: 'Motivo de cancelacion',
      value: data.application.cancelledReason,
    },
    {
      label: 'Motivo de devolucion a borrador',
      value: data.application.returnedToDraftReason,
    },
  ].filter((item) => (item.value ?? '').trim().length > 0)

const getPrimaryActivity = (activities: LoanApplicationReportClientActivity[]) =>
  activities.find((item) => item.isPrimary) ?? activities[0] ?? null

const formatBoolean = (value: boolean) => (value ? 'Si' : 'No')

const formatMonths = (value?: number | null) => {
  if (value == null) return '—'
  return `${value} meses`
}

const renderCollateralTable = (items: LoanApplicationReportCollateral[]) => {
  if (!items.length) {
    return <Text style={styles.emptyText}>No hay garantias vinculadas.</Text>
  }

  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.cell, styles.headerCell, styles.mediumCell]}>Tipo</Text>
        <Text style={[styles.cell, styles.headerCell, styles.largeCell]}>Propietario</Text>
        <Text style={[styles.cell, styles.headerCell, styles.mediumCell]}>Estado</Text>
        <Text style={[styles.cell, styles.headerCell, styles.amountCell]}>Avaluo</Text>
        <Text style={[styles.cell, styles.headerCell, styles.amountCell]}>Cobertura</Text>
      </View>
      {items.map((item) => (
        <View key={item.linkId} style={styles.tableRow}>
          <Text style={[styles.cell, styles.mediumCell]}>
            {[item.collateralTypeName, item.referenceNo].filter(Boolean).join(' · ') || '—'}
          </Text>
          <Text style={[styles.cell, styles.largeCell]}>{item.ownerClientFullName || '—'}</Text>
          <Text style={[styles.cell, styles.mediumCell]}>
            {item.collateralStatusName || '—'}
          </Text>
          <Text style={[styles.cell, styles.amountCell]}>
            {formatMoney(item.appraisedValue)}
          </Text>
          <Text style={[styles.cell, styles.amountCell]}>
            {formatMoney(item.coverageValue)}
          </Text>
        </View>
      ))}
    </View>
  )
}

const renderActivitiesTable = (items: LoanApplicationReportClientActivity[]) => {
  if (!items.length) {
    return <Text style={styles.emptyText}>No hay actividades registradas.</Text>
  }

  return (
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.cell, styles.headerCell, styles.mediumCell]}>Actividad</Text>
        <Text style={[styles.cell, styles.headerCell, styles.mediumCell]}>Empresa</Text>
        <Text style={[styles.cell, styles.headerCell]}>Tipo</Text>
        <Text style={[styles.cell, styles.headerCell, styles.amountCell]}>Ingreso</Text>
        <Text style={[styles.cell, styles.headerCell, styles.amountCell]}>Gasto</Text>
      </View>
      {items.map((item) => (
        <View key={item.id} style={styles.tableRow}>
          <Text style={[styles.cell, styles.mediumCell]}>
            {item.isPrimary ? `${item.activityName} (Principal)` : item.activityName}
          </Text>
          <Text style={[styles.cell, styles.mediumCell]}>
            {item.companyName || item.activityLocation || '—'}
          </Text>
          <Text style={styles.cell}>
            {item.isBusiness ? 'Negocio' : 'Laboral'} / {item.isActive ? 'Activa' : 'Inactiva'}
          </Text>
          <Text style={[styles.cell, styles.amountCell]}>
            {formatMoney(item.monthlyIncome)}
          </Text>
          <Text style={[styles.cell, styles.amountCell]}>
            {formatMoney(item.monthlyExpense)}
          </Text>
        </View>
      ))}
    </View>
  )
}

const renderFinancialProfile = (profile: LoanApplicationReportFinancialProfile | null) => {
  if (!profile) {
    return <Text style={styles.emptyText}>La solicitud no tiene ficha financiera registrada.</Text>
  }

  return (
    <View style={styles.stack}>
      <View style={styles.grid}>
        <InfoItem label="Periodo analisis" value={profile.analysisPeriodType || '—'} />
        <InfoItem
          label="Estado ficha"
          value={profile.isComplete ? 'Completa' : 'Incompleta'}
        />
        <InfoItem label="Total activos" value={formatMoney(profile.totalAssets)} />
        <InfoItem label="Total pasivos" value={formatMoney(profile.totalLiabilities)} />
        <InfoItem label="Patrimonio" value={formatMoney(profile.equity)} />
        <InfoItem label="Resultado periodo" value={formatMoney(profile.periodProfit)} />
        <InfoItem label="Ratio deuda" value={formatRatio(profile.debtRatio)} />
        <InfoItem
          label="Ratio deuda patrimonio"
          value={formatRatio(profile.debtToEquityRatio)}
        />
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, styles.headerCell, styles.largeCell]}>Concepto</Text>
          <Text style={[styles.cell, styles.headerCell, styles.amountCell]}>Monto</Text>
        </View>
        {[
          ['Caja y bancos', profile.cashAndBanks],
          ['Cuentas por cobrar', profile.accountsReceivable],
          ['Inventario', profile.inventoryValue],
          ['Casas y terrenos', profile.housesAndLand],
          ['Vehiculos', profile.vehicles],
          ['Enseres del hogar', profile.householdGoods],
          ['Cuentas por pagar proveedores', profile.accountsPayableSuppliers],
          ['Prestamos por pagar', profile.loansPayable],
          ['Otros pasivos', profile.totalOtherLiabilities],
          ['Ingresos negocio', profile.businessIncome],
          ['Ingresos salario', profile.salaryIncome],
          ['Ingresos conyuge/hijos', profile.spouseChildrenIncome],
          ['Ingresos remesas', profile.remittancesIncome],
          ['Otros ingresos', profile.otherIncome],
          ['Costo de ventas', profile.businessCostOfSales],
          ['Gasto alimentacion', profile.foodExpense],
          ['Gasto salud/educacion', profile.healthEducationExpense],
          ['Gasto servicios', profile.utilitiesExpense],
          ['Cuotas prestamos', profile.loanInstallmentExpense],
          ['Total ingresos', profile.totalIncome],
          ['Total gastos', profile.totalExpenses],
        ].map(([label, value]) => (
          <View key={label} style={styles.tableRow}>
            <Text style={[styles.cell, styles.largeCell]}>{label}</Text>
            <Text style={[styles.cell, styles.amountCell]}>
              {formatMoney(value as number)}
            </Text>
          </View>
        ))}
      </View>

      {profile.otherLiabilities.length ? (
        <View wrap={false}>
          <View style={styles.subsectionHeader}>
            <Text style={styles.subsectionTitle}>Otros pasivos</Text>
          </View>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cell, styles.headerCell, styles.largeCell]}>
                Descripcion
              </Text>
              <Text style={[styles.cell, styles.headerCell, styles.amountCell]}>Monto</Text>
            </View>
            {profile.otherLiabilities
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={[styles.cell, styles.largeCell]}>{item.description}</Text>
                  <Text style={[styles.cell, styles.amountCell]}>
                    {formatMoney(item.amount)}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      ) : null}

      {(profile.notes || profile.analysisComments) ? (
        <View style={styles.noteBox}>
          {profile.notes ? <Text style={styles.noteText}>Notas: {profile.notes}</Text> : null}
          {profile.analysisComments ? (
            <Text style={styles.noteText}>
              Comentarios de analisis: {profile.analysisComments}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

export const LoanApplicationReport = ({
  data,
  organizationName = 'PrestaNet',
}: LoanApplicationReportProps) => {
  const primaryActivity = getPrimaryActivity(data.clientActivities)
  const workflowNotes = buildWorkflowNotes(data)

  return (
    <ReportLayout
      title="Solicitud de credito"
      subtitle={`No. ${data.application.applicationNo}`}
      organizationName={organizationName}
    >
      <Section title="Encabezado">
        <View style={styles.grid}>
          <InfoItem
            label="Estado"
            value={translateLoanApplicationStatus(
              data.application.statusCode,
              data.application.statusName,
            )}
          />
          <InfoItem
            label="Fecha creacion"
            value={formatDate(data.application.createdOperationalDate)}
          />
          <InfoItem
            label="Fecha envio"
            value={formatDate(data.application.submittedOperationalDate)}
          />
          <InfoItem
            label="Fecha aprobacion"
            value={formatDate(data.application.approvedOperationalDate)}
          />
          <InfoItem
            label="Fecha desembolso"
            value={formatDate(data.application.disbursedOperationalDate)}
          />
          <InfoItem
            label="Fecha rechazo"
            value={formatDate(data.application.rejectedOperationalDate)}
          />
          <InfoItem
            label="Fecha cancelacion"
            value={formatDate(data.application.cancelledOperationalDate)}
          />
        </View>
      </Section>

      <Section title="Solicitante">
        <View style={styles.grid}>
          <InfoItem label="Cliente" value={data.client.fullName} />
          <InfoItem
            label="Identidad"
            value={formatHnIdentity(data.client.identityNo) || '—'}
          />
          <InfoItem label="RTN" value={data.client.rtn || '—'} />
          <InfoItem label="Telefono" value={data.client.phone || '—'} />
          <InfoItem label="Nacimiento" value={formatDate(data.client.birthDate)} />
          <InfoItem label="Genero" value={data.client.genderName || '—'} />
          <InfoItem
            label="Estado civil"
            value={data.client.maritalStatusName || '—'}
          />
          <InfoItem label="Profesion" value={data.client.professionName || '—'} />
          <InfoItem label="Vivienda" value={data.client.housingTypeName || '—'} />
          <InfoItem
            label="Dependientes"
            value={data.client.dependentsName || '—'}
          />
          <InfoItem
            label="Tiempo residiendo"
            value={formatMonths(data.client.timeLivingMonths)}
          />
          <InfoItem
            label="Ubicacion"
            value={[data.client.municipalityName, data.client.departmentName]
              .filter(Boolean)
              .join(', ') || '—'}
          />
          <InfoItem
            label="Es empleado"
            value={formatBoolean(data.client.isEmployee)}
          />
          <InfoItem label="Direccion" value={data.client.address || '—'} />
        </View>
      </Section>

      <Section title="Solicitud y producto">
        <View style={styles.grid}>
          <InfoItem
            label="Producto"
            value={`${data.loanProduct.code} - ${data.loanProduct.name}`}
          />
          <InfoItem
            label="Principal solicitado"
            value={formatMoney(data.application.requestedPrincipal)}
          />
          <InfoItem label="Plazo solicitado" value={String(data.application.requestedTerm)} />
          <InfoItem
            label="Frecuencia solicitada"
            value={data.application.requestedPaymentFrequencyName || '—'}
          />
          <InfoItem
            label="Frecuencia sugerida"
            value={data.application.suggestedPaymentFrequencyName || '—'}
          />
          <InfoItem
            label="Tasa ajustada"
            value={formatRateAsPercent(data.application.requestedRateOverride)}
          />
          <InfoItem
            label="Tasa nominal producto"
            value={formatRateAsPercent(data.loanProduct.nominalRate)}
          />
          <InfoItem
            label="Tipo de tasa"
            value={data.loanProduct.interestRateTypeName || '—'}
          />
          <InfoItem
            label="Base"
            value={data.loanProduct.rateBaseName || '—'}
          />
          <InfoItem
            label="Metodo amortizacion"
            value={data.loanProduct.amortizationMethodName || '—'}
          />
          <InfoItem
            label="Portafolio"
            value={data.loanProduct.portfolioTypeName || '—'}
          />
          <InfoItem
            label="Requiere garantia"
            value={formatBoolean(data.loanProduct.requiresCollateral)}
          />
          <InfoItem
            label="Cobertura minima"
            value={formatRatio(data.loanProduct.minCollateralRatio)}
          />
          <InfoItem
            label="Gracia capital"
            value={String(data.loanProduct.gracePrincipal)}
          />
          <InfoItem
            label="Gracia interes"
            value={String(data.loanProduct.graceInterest)}
          />
          <InfoItem
            label="Frecuencia por defecto"
            value={data.loanProduct.defaultPaymentFrequencyName || '—'}
          />
          <InfoItem
            label="Unidad plazo"
            value={data.loanProduct.termUnitName || '—'}
          />
          <InfoItem
            label="Rango monto"
            value={`${formatMoney(data.loanProduct.minAmount)} a ${formatMoney(data.loanProduct.maxAmount)}`}
          />
          <InfoItem
            label="Rango plazo"
            value={`${data.loanProduct.minTerm} a ${data.loanProduct.maxTerm}`}
          />
        </View>
      </Section>

      <Section title="Promotor">
        <View style={styles.grid}>
          <InfoItem label="Nombre" value={data.promoter.fullName || '—'} />
          <InfoItem label="Codigo" value={data.promoter.code || '—'} />
          <InfoItem
            label="Identidad"
            value={formatHnIdentity(data.promoter.identityNo) || '—'}
          />
          <InfoItem
            label="Agencia"
            value={`${data.promoter.agencyCode} - ${data.promoter.agencyName}`}
          />
        </View>
      </Section>

      <Section title="Actividad economica">
        {primaryActivity ? (
          <View style={styles.grid}>
            <InfoItem label="Principal" value={primaryActivity.activityName || '—'} />
            <InfoItem
              label="Sector"
              value={primaryActivity.sectorName || '—'}
            />
            <InfoItem
              label="Empresa"
              value={primaryActivity.companyName || '—'}
            />
            <InfoItem
              label="Ubicacion"
              value={primaryActivity.activityLocation || '—'}
            />
            <InfoItem
              label="Antiguedad"
              value={formatMonths(primaryActivity.timeActivityMonths)}
            />
            <InfoItem
              label="Ingreso mensual"
              value={formatMoney(primaryActivity.monthlyIncome)}
            />
            <InfoItem
              label="Gasto mensual"
              value={formatMoney(primaryActivity.monthlyExpense)}
            />
            <InfoItem
              label="Descripcion"
              value={primaryActivity.description || '—'}
            />
          </View>
        ) : (
          <Text style={styles.emptyText}>No hay actividad principal registrada.</Text>
        )}
        <View style={styles.tableSection}>{renderActivitiesTable(data.clientActivities)}</View>
      </Section>

      <Section title="Garantias">
        {renderCollateralTable(data.collaterals)}
      </Section>

      <Section title="Ficha financiera">
        {renderFinancialProfile(data.financialProfile)}
      </Section>

      {workflowNotes.length ? (
        <Section title="Observaciones">
          <View style={styles.noteBox}>
            {workflowNotes.map((item) => (
              <Text key={item.label} style={styles.noteText}>
                {item.label}: {item.value}
              </Text>
            ))}
            <Text style={styles.noteText}>
              Ficha financiera actualizada: {formatDateTime(data.application.financialProfileUpdatedAt)}
            </Text>
            <Text style={styles.noteText}>
              Creado en sistema: {formatDateTime(data.application.createdAt)}
            </Text>
          </View>
        </Section>
      ) : (
        <Section title="Observaciones">
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              Ficha financiera actualizada: {formatDateTime(data.application.financialProfileUpdatedAt)}
            </Text>
            <Text style={styles.noteText}>
              Creado en sistema: {formatDateTime(data.application.createdAt)}
            </Text>
          </View>
        </Section>
      )}
    </ReportLayout>
  )
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d9e2ec',
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#c3d0dd',
    backgroundColor: '#f3f7fa',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  sectionBody: {
    padding: 9,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#243b53',
  },
  subsectionHeader: {
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e1e8ef',
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  subsectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#486581',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stack: {
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
  tableSection: {
    marginTop: 6,
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
  mediumCell: {
    flexBasis: '24%',
    flexGrow: 0,
  },
  largeCell: {
    flexBasis: '34%',
    flexGrow: 0,
  },
  amountCell: {
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 9,
    color: '#64748b',
  },
  noteBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    padding: 8,
    gap: 4,
  },
  noteText: {
    fontSize: 9,
    color: '#334155',
  },
})
