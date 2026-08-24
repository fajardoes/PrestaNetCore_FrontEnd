import { Trash2 } from 'lucide-react'
import type { LoanApplicationCollateralResponse } from '@/infrastructure/loans/responses/loan-application-collateral-response'
import { formatMoney } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationCollateralsCardProps {
  collaterals: LoanApplicationCollateralResponse[]
  canAddCollateral: boolean
  canRemoveCollateral: boolean
  isProcessing?: boolean
  onAdd: () => void
  onRemove: (item: LoanApplicationCollateralResponse) => void
}

export const LoanApplicationCollateralsCard = ({
  collaterals,
  canAddCollateral,
  canRemoveCollateral,
  isProcessing = false,
  onAdd,
  onRemove,
}: LoanApplicationCollateralsCardProps) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Garantías</h2>
        {canAddCollateral ? (
          <button
            type="button"
            className="btn-primary px-2.5 py-1 text-xs"
            onClick={onAdd}
            disabled={isProcessing}
          >
            Agregar garantía
          </button>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <th className="px-2 py-1.5">Referencia</th>
              <th className="px-2 py-1.5">Tipo</th>
              <th className="px-2 py-1.5">Estado</th>
              <th className="px-2 py-1.5">Cobertura</th>
              <th className="px-2 py-1.5">Notas</th>
              <th className="px-2 py-1.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!collaterals.length ? (
              <tr>
                <td colSpan={6} className="px-2 py-3 text-center text-slate-500 dark:text-slate-400">
                  No hay garantías vinculadas.
                </td>
              </tr>
            ) : (
              collaterals.map((item) => (
                <tr
                  key={item.linkId}
                  className="border-b border-slate-200/70 text-slate-700 dark:border-slate-800 dark:text-slate-200"
                >
                  <td className="px-2 py-1.5">{item.collateralReferenceNo || '—'}</td>
                  <td className="px-2 py-1.5">{item.collateralTypeName}</td>
                  <td className="px-2 py-1.5">{item.collateralStatusName}</td>
                  <td className="px-2 py-1.5">{formatMoney(item.coverageValue)}</td>
                  <td className="px-2 py-1.5">{item.notes || '—'}</td>
                  <td className="px-2 py-1.5 text-right">
                    {canRemoveCollateral ? (
                      <button
                        type="button"
                        className="btn-table-action w-7 px-0"
                        onClick={() => onRemove(item)}
                        disabled={isProcessing}
                        aria-label="Eliminar garantía"
                      >
                        <Trash2 className="mx-auto h-4 w-4" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
