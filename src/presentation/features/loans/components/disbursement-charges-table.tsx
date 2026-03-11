import type { LoanDisbursementChargeResponse } from '@/infrastructure/loans/responses/loan-disbursement-charge-response'
import {
  formatChargeTypeCode,
  formatCurrency,
  formatChargeRateOrValue,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { TableContainer } from '@/presentation/share/components/table-container'

interface DisbursementChargesTableProps {
  charges?: LoanDisbursementChargeResponse[] | null
}

export const DisbursementChargesTable = ({
  charges,
}: DisbursementChargesTableProps) => {
  const rows = charges ?? []
  const totalAmount = rows.reduce((sum, charge) => sum + (charge.calculatedAmount ?? 0), 0)

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
      <TableContainer mode="legacy-compact" variant="strong">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th>Cargo</th>
                <th className="text-right">Valor</th>
                <th className="text-right">Monto calculado</th>
              </tr>
            </thead>
            <tbody>
              {!rows.length ? (
                <tr>
                  <td colSpan={3} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                    No se aplicaron cargos al desembolso.
                  </td>
                </tr>
              ) : (
                rows.map((charge, index) => (
                  <tr key={charge.id ?? `${charge.chargeTypeCode}-${charge.sourceRefId ?? index}`}>
                    <td>{charge.chargeName?.trim() || formatChargeTypeCode(charge.chargeTypeCode)}</td>
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
