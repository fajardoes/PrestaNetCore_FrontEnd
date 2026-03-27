import type { LoanDisbursementChargeResponse } from '@/infrastructure/loans/responses/loan-disbursement-charge-response'
import {
  formatChargeTypeCode,
  formatChargeTimingCode,
  formatCurrency,
  formatDisbursementChargeSource,
  formatChargeRateOrValue,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { TableContainer } from '@/presentation/share/components/table-container'

interface DisbursementChargesTableProps {
  charges?: LoanDisbursementChargeResponse[] | null
}

const isInsuranceCharge = (item: LoanDisbursementChargeResponse) =>
  (item.chargeTypeCode ?? '').trim().toUpperCase() === 'INSURANCE' ||
  (item.sourceType ?? '').trim().toLowerCase() === 'loan_product_insurance'

const isFeeCharge = (item: LoanDisbursementChargeResponse) =>
  (item.chargeTypeCode ?? '').trim().toUpperCase() === 'FEE' ||
  (item.sourceType ?? '').trim().toLowerCase() === 'loan_product_fee'

export const DisbursementChargesTable = ({
  charges,
}: DisbursementChargesTableProps) => {
  const rows = charges ?? []
  const feeCharges = rows.filter(isFeeCharge)
  const insuranceCharges = rows.filter(isInsuranceCharge)
  const totalAmount = rows.reduce((sum, charge) => sum + (charge.calculatedAmount ?? 0), 0)
  const totalFees = feeCharges.reduce((sum, charge) => sum + (charge.calculatedAmount ?? 0), 0)
  const totalInsurance = insuranceCharges.reduce(
    (sum, charge) => sum + (charge.calculatedAmount ?? 0),
    0,
  )

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Cargos descontados
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Detalle de cargos aplicados al desembolso.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryMetric label="Total cargos" value={formatCurrency(totalAmount)} />
        <SummaryMetric label="Total comisiones" value={formatCurrency(totalFees)} />
        <SummaryMetric label="Total seguros" value={formatCurrency(totalInsurance)} />
      </div>
      <TableContainer mode="legacy-compact" variant="strong">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cargo</th>
                <th>Origen</th>
                <th>Momento</th>
                <th className="text-right">Base</th>
                <th className="text-right">Valor</th>
                <th className="text-right">Monto calculado</th>
              </tr>
            </thead>
            <tbody>
              {!rows.length ? (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                    No se aplicaron cargos al desembolso.
                  </td>
                </tr>
              ) : (
                rows.map((charge, index) => (
                  <tr key={charge.id ?? `${charge.chargeTypeCode}-${charge.sourceRefId ?? index}`}>
                    <td>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ${
                          isInsuranceCharge(charge)
                            ? 'bg-cyan-100 text-cyan-800 ring-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-100 dark:ring-cyan-500/40'
                            : 'bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-100 dark:ring-amber-500/40'
                        }`}
                      >
                        {formatChargeTypeCode(charge.chargeTypeCode)}
                      </span>
                    </td>
                    <td>{charge.chargeName?.trim() || formatChargeTypeCode(charge.chargeTypeCode)}</td>
                    <td>{formatDisbursementChargeSource(charge.sourceType)}</td>
                    <td>{formatChargeTimingCode(charge.chargeTimingCode)}</td>
                    <td className="text-right">{formatCurrency(charge.baseAmount)}</td>
                    <td className="text-right">
                      {formatChargeRateOrValue(charge.rateOrValue, charge.valueTypeCode)}
                    </td>
                    <td className="text-right">{formatCurrency(charge.calculatedAmount)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {rows.length ? (
              <tfoot>
                <tr className="border-t border-slate-200/80 dark:border-slate-700">
                  <td className="px-2 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Total
                  </td>
                  <td />
                  <td />
                  <td />
                  <td />
                  <td />
                  <td className="px-2 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </TableContainer>
    </section>
  )
}

const SummaryMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)
