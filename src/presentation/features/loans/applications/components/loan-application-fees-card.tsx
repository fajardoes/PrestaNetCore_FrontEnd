import { useMemo, useState } from 'react'
import { PencilLine, RefreshCw } from 'lucide-react'
import type { LoanApplicationFeeResponse } from '@/infrastructure/loans/responses/loan-application-fee-response'
import type { LoanDisbursementChargeResponse } from '@/infrastructure/loans/responses/loan-disbursement-charge-response'
import type { LoanApplicationFeeOverrideFormValues } from '@/infrastructure/validations/loans/loan-application-fee-override.schema'
import { LoanApplicationFeeOverrideModal } from '@/presentation/features/loans/applications/components/loan-application-fee-override-modal'
import {
  feeOverrideBadgeClass,
  formatChargeCollectionLabel,
  formatChargeRateOrValue,
  formatChargeTypeCode,
  formatCurrency,
  formatFeeOverrideMode,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { TableContainer } from '@/presentation/share/components/table-container'

interface LoanApplicationFeesCardProps {
  fees: LoanApplicationFeeResponse[]
  charges?: LoanDisbursementChargeResponse[] | null
  canEdit: boolean
  isLoading?: boolean
  isSaving?: boolean
  error?: string | null
  onRefresh?: () => void
  onSaveOverride: (
    fee: LoanApplicationFeeResponse,
    values: LoanApplicationFeeOverrideFormValues,
  ) => Promise<boolean> | boolean
}

export const LoanApplicationFeesCard = ({
  fees,
  charges,
  canEdit,
  isLoading = false,
  isSaving = false,
  error = null,
  onRefresh,
  onSaveOverride,
}: LoanApplicationFeesCardProps) => {
  const [selectedFee, setSelectedFee] = useState<LoanApplicationFeeResponse | null>(null)
  const chargeRows = charges ?? []
  const feesByLoanProductFeeId = useMemo(
    () => new Map(fees.map((fee) => [fee.loanProductFeeId, fee])),
    [fees],
  )
  const sortedChargeRows = useMemo(() => {
    return [...chargeRows].sort((left, right) => {
      const leftTypeName = formatChargeTypeCode(left.chargeTypeCode)
      const rightTypeName = formatChargeTypeCode(right.chargeTypeCode)
      return leftTypeName.localeCompare(rightTypeName, 'es-HN', { sensitivity: 'base' })
    })
  }, [chargeRows])

  const summary = useMemo(() => {
    return fees.reduce(
      (acc, fee) => {
        acc.productTotal += fee.productCalculatedAmount ?? 0
        acc.effectiveTotal += fee.effectiveCalculatedAmount ?? 0
        if (fee.isRemoved) acc.removedCount += 1
        if ((fee.overrideMode ?? '').trim().toUpperCase() === 'MODIFIED') acc.modifiedCount += 1
        if (!fee.isRemoved && (fee.overrideMode ?? '').trim().toUpperCase() !== 'MODIFIED') {
          acc.inheritedCount += 1
        }
        return acc
      },
      {
        productTotal: 0,
        effectiveTotal: 0,
        removedCount: 0,
        modifiedCount: 0,
        inheritedCount: 0,
      },
    )
  }, [fees])

  const chargesSummary = useMemo(() => {
    return chargeRows.reduce(
      (acc, charge) => {
        const isInsurance =
          (charge.chargeTypeCode ?? '').trim().toUpperCase() === 'INSURANCE' ||
          (charge.sourceType ?? '').trim().toLowerCase() === 'loan_product_insurance'
        const amount = charge.calculatedAmount ?? 0
        acc.total += amount
        if (isInsurance) {
          acc.insurance += amount
        } else {
          acc.fees += amount
        }
        return acc
      },
      {
        total: 0,
        fees: 0,
        insurance: 0,
      },
    )
  }, [chargeRows])

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Descuentos y comisiones
          </h2>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
            Aquí puedes revisar las comisiones que se pueden ajustar y los descuentos que se
            aplicarán al desembolso, incluyendo seguros.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {onRefresh ? (
            <button
              type="button"
              className="btn-secondary px-2.5 py-1 text-xs"
              onClick={onRefresh}
              disabled={isLoading || isSaving}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Recargar
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Descuentos estimados" value={formatCurrency(chargesSummary.total)} />
        <Metric label="Comisiones" value={formatCurrency(chargesSummary.fees)} />
        <Metric label="Seguros" value={formatCurrency(chargesSummary.insurance)} />
        <Metric label="Comisiones ajustadas" value={String(summary.modifiedCount)} />
        <Metric label="Comisiones removidas" value={String(summary.removedCount)} />
      </div>

      {error ? (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          No fue posible cargar las comisiones: {error}
        </div>
      ) : null}

      {isLoading ? (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Cargando comisiones...
        </p>
      ) : null}

      <div className="mt-3">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Descuentos del desembolso
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Aquí se muestra lo que se rebajará del desembolso, tanto comisiones como seguros.
          </p>
        </div>
        <TableContainer mode="legacy-compact" variant="strong">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Se cobra</th>
                  <th>Calculado sobre</th>
                  <th>Valor</th>
                  <th>Estado</th>
                  <th>Motivo</th>
                  <th>Monto</th>
                  {canEdit ? <th className="text-right">Acción</th> : null}
                </tr>
              </thead>
              <tbody>
                {!sortedChargeRows.length ? (
                  <tr>
                    <td
                      colSpan={canEdit ? 9 : 8}
                      className="px-2 py-5 text-center text-slate-500 dark:text-slate-400"
                    >
                      Aún no hay descuentos calculados para esta solicitud.
                    </td>
                  </tr>
                ) : (
                  sortedChargeRows.map((charge, index) => {
                    const isInsurance =
                      (charge.chargeTypeCode ?? '').trim().toUpperCase() === 'INSURANCE' ||
                      (charge.sourceType ?? '').trim().toLowerCase() === 'loan_product_insurance'
                    const relatedFee =
                      (charge.sourceType ?? '').trim().toLowerCase() === 'loan_product_fee'
                        ? feesByLoanProductFeeId.get(charge.sourceRefId ?? '')
                        : undefined

                    return (
                      <tr key={charge.id ?? `${charge.chargeTypeCode}-${charge.sourceRefId ?? index}`}>
                        <td>
                          <span
                            className={`inline-flex rounded-full px-0.5 py-0.5 text-[11px] font-semibold ring-1 ${
                              isInsurance
                                ? 'bg-cyan-100 text-cyan-800 ring-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-100 dark:ring-cyan-500/40'
                                : 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-500/40'
                            }`}
                          >
                            {formatChargeTypeCode(charge.chargeTypeCode)}
                          </span>
                        </td>
                        <td className="font-medium text-slate-800 dark:text-slate-100">
                          {charge.chargeName?.trim() || formatChargeTypeCode(charge.chargeTypeCode)}
                        </td>
                        <td>
                          {formatChargeCollectionLabel(
                            charge.chargeTimingCode,
                            charge.includedInNetDisbursement,
                          )}
                        </td>
                        <td>{formatCurrency(charge.baseAmount)}</td>
                        <td>
                          {formatChargeRateOrValue(charge.rateOrValue, charge.valueTypeCode)}
                        </td>
                        <td>
                          {relatedFee ? (
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${feeOverrideBadgeClass(
                                relatedFee.overrideMode,
                                relatedFee.isRemoved,
                              )}`}
                            >
                              {formatFeeOverrideMode(relatedFee.overrideMode, relatedFee.isRemoved)}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="max-w-56 truncate" title={relatedFee?.overrideReason || ''}>
                          {relatedFee?.overrideReason?.trim() || '—'}
                        </td>
                        <td>{formatCurrency(charge.calculatedAmount)}</td>
                        {canEdit ? (
                          <td className="text-right">
                            {relatedFee ? (
                              <button
                                type="button"
                                className="btn-table-action w-7 px-0"
                                onClick={() => setSelectedFee(relatedFee)}
                                disabled={isSaving}
                                title="Ajustar comisión"
                              >
                                <PencilLine className="mx-auto h-4 w-4" />
                              </button>
                            ) : null}
                          </td>
                        ) : null}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </TableContainer>
      </div>

      <LoanApplicationFeeOverrideModal
        open={Boolean(selectedFee)}
        fee={selectedFee}
        isSubmitting={isSaving}
        onClose={() => setSelectedFee(null)}
        onSubmit={async (values) => {
          if (!selectedFee) return
          const shouldClose = await onSaveOverride(selectedFee, values)
          if (shouldClose) {
            setSelectedFee(null)
          }
        }}
      />
    </section>
  )
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-0.5 text-xs font-semibold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)
