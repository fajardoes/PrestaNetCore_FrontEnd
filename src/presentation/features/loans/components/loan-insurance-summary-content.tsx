import type {
  LoanInsuranceDefinitionResponse,
  LoanInsuranceResponse,
} from '@/infrastructure/loans/responses/loan-insurance-response'
import {
  formatCurrency,
  formatDateTime,
  formatInsuranceCalculationBaseCode,
  formatInsuranceStatusCode,
  formatInsuranceValueTypeCode,
  formatMoney,
  insuranceStatusBadgeClass,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { QueryDetailField, QueryMetricCard } from '@/presentation/features/loans/loans-query/components/loan-query-ui'
import { TableContainer } from '@/presentation/share/components/table-container'

interface LoanInsuranceSummaryContentProps {
  totalDisbursementInsurance?: number | null
  insuranceSummary?: LoanInsuranceResponse | null
  insuranceDefinitions?: LoanInsuranceDefinitionResponse[]
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
}

export const LoanInsuranceSummaryContent = ({
  totalDisbursementInsurance,
  insuranceSummary,
  insuranceDefinitions,
  isLoading = false,
  error = null,
  emptyMessage = 'No hay información de seguros registrada para este préstamo.',
}: LoanInsuranceSummaryContentProps) => {
  const definitions = insuranceDefinitions ?? insuranceSummary?.definitions ?? []

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Cargando detalle de seguros...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
        No fue posible cargar los seguros del préstamo aprobado: {error}
      </div>
    )
  }

  if (!insuranceSummary) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <QueryMetricCard
          label="Cobrado al desembolso"
          value={formatCurrency(totalDisbursementInsurance)}
          hint="Seguro descontado al desembolso"
          accent="blue"
        />
        <QueryMetricCard
          label="Año 1 cobrado"
          value={formatCurrency(insuranceSummary.firstYearInsuranceAmount)}
          hint="Seguro aplicado al primer año"
          accent="blue"
        />
        <QueryMetricCard
          label="Futuro programado"
          value={formatCurrency(insuranceSummary.futureScheduledInsuranceAmount)}
          hint="Cargos prospectivos desde el segundo año"
          accent="amber"
        />
        <QueryMetricCard
          label="Cobrado"
          value={formatCurrency(insuranceSummary.collectedInsuranceAmount)}
          hint="Seguro ya recuperado en cuotas"
          accent="emerald"
        />
        <QueryMetricCard
          label="Pendiente"
          value={formatCurrency(insuranceSummary.pendingInsuranceAmount)}
          hint="Seguro aún no cobrado"
          accent="slate"
        />
        <QueryMetricCard
          label="Cancelado"
          value={formatCurrency(insuranceSummary.cancelledInsuranceAmount)}
          hint="Seguro futuro dado de baja"
          accent="slate"
        />
      </div>

      {!definitions.length ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          No hay definiciones de seguro registradas para este préstamo.
        </div>
      ) : (
        <div className="space-y-4">
          {definitions.map((definition, index) => (
            <LoanInsuranceDefinitionCard
              key={definition.loanProductInsuranceId || `${definition.insuranceTypeCode}-${index}`}
              definition={definition}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const LoanInsuranceDefinitionCard = ({
  definition,
}: {
  definition: LoanInsuranceDefinitionResponse
}) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <QueryDetailField
        label="Tipo de seguro"
        value={definition.insuranceTypeName?.trim() || definition.insuranceTypeCode?.trim() || '—'}
      />
      <QueryDetailField
        label="Valor configurado"
        value={formatInsuranceValueTypeCode(definition.valueTypeCode, definition.configuredValue)}
      />
      <QueryDetailField
        label="Base de cálculo"
        value={formatInsuranceCalculationBaseCode(definition.calculationBaseCode)}
      />
      <QueryDetailField
        label="Seguro año 1 / futuro"
        value={`${formatCurrency(definition.firstYearInsuranceAmount)} / ${formatCurrency(definition.futureScheduledInsuranceAmount)}`}
      />
    </div>

    <div className="mt-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Bloques anuales
        </h3>
        <TableContainer mode="legacy-compact" variant="strong">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th>Año</th>
                  <th>Bloque</th>
                  <th>Cuotas</th>
                  <th className="text-right">Meses</th>
                  <th className="text-right">Base cálculo</th>
                  <th className="text-right">Seguro anual</th>
                  <th className="text-right">Seguro bloque</th>
                </tr>
              </thead>
              <tbody>
                {!definition.blocks.length ? (
                  <tr>
                    <td colSpan={7} className="px-2 py-4 text-center text-slate-500 dark:text-slate-400">
                      No hay bloques registrados.
                    </td>
                  </tr>
                ) : (
                  definition.blocks.map((block) => (
                    <tr key={`${block.insuranceYearNo}-${block.blockNo}`}>
                      <td>{block.insuranceYearNo}</td>
                      <td>{block.blockNo}</td>
                      <td>
                        {block.blockStartInstallmentNo} - {block.blockEndInstallmentNo}
                      </td>
                      <td className="text-right">{block.monthsInBlock}</td>
                      <td className="text-right">{formatMoney(block.calculationBaseAmount)}</td>
                      <td className="text-right">{formatMoney(block.annualInsuranceAmount)}</td>
                      <td className="text-right">{formatMoney(block.blockInsuranceAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TableContainer>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Programación por cuota
        </h3>
        <TableContainer mode="legacy-compact" variant="strong">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th>Cuota</th>
                  <th>Año</th>
                  <th>Bloque</th>
                  <th className="text-right">Base cálculo</th>
                  <th className="text-right">Programado</th>
                  <th>Estado</th>
                  <th>Fecha cobro/cancelación</th>
                </tr>
              </thead>
              <tbody>
                {!definition.schedule.length ? (
                  <tr>
                    <td colSpan={7} className="px-2 py-4 text-center text-slate-500 dark:text-slate-400">
                      No hay cuotas de seguro programadas.
                    </td>
                  </tr>
                ) : (
                  definition.schedule.map((item) => (
                    <tr key={item.id}>
                      <td>{item.installmentNo}</td>
                      <td>{item.insuranceYearNo}</td>
                      <td>{item.blockNo}</td>
                      <td className="text-right">{formatMoney(item.calculationBaseAmount)}</td>
                      <td className="text-right">
                        {formatMoney(item.scheduledInsuranceAmount ?? item.insuranceAmount)}
                      </td>
                      <td>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${insuranceStatusBadgeClass(item.statusCode)}`}
                        >
                          {formatInsuranceStatusCode(item.statusCode)}
                        </span>
                      </td>
                      <td>
                        {formatDateTime(item.collectedAt ?? item.cancelledAt)}
                        {item.cancellationReason?.trim() ? (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.cancellationReason.trim()}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TableContainer>
      </div>
    </div>
  </div>
)
