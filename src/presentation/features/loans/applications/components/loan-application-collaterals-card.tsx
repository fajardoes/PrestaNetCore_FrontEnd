import { Trash2 } from 'lucide-react'
import type { LoanApplicationCollateralResponse } from '@/infrastructure/loans/responses/loan-application-collateral-response'
import { formatMoney } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationCollateralsCardProps {
  collaterals: LoanApplicationCollateralResponse[]
  canEdit: boolean
  isProcessing?: boolean
  onAdd: () => void
  onRemove: (item: LoanApplicationCollateralResponse) => void
}

export const LoanApplicationCollateralsCard = ({
  collaterals,
  canEdit,
  isProcessing = false,
  onAdd,
  onRemove,
}: LoanApplicationCollateralsCardProps) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Garantías</h2>
        <button
          type="button"
          className="btn-primary px-3 py-2 text-sm"
          onClick={onAdd}
          disabled={!canEdit || isProcessing}
        >
          Agregar garantía
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <th className="px-2 py-2">Referencia</th>
              <th className="px-2 py-2">Tipo</th>
              <th className="px-2 py-2">Estado</th>
              <th className="px-2 py-2">Cobertura</th>
              <th className="px-2 py-2">Notas</th>
              <th className="px-2 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!collaterals.length ? (
              <tr>
                <td colSpan={6} className="px-2 py-4 text-center text-slate-500 dark:text-slate-400">
                  No hay garantías vinculadas.
                </td>
              </tr>
            ) : (
              collaterals.map((item) => (
                <tr
                  key={item.linkId}
                  className="border-b border-slate-200/70 text-slate-700 dark:border-slate-800 dark:text-slate-200"
                >
                  <td className="px-2 py-2">{item.collateralReferenceNo || '—'}</td>
                  <td className="px-2 py-2">{item.collateralTypeName}</td>
                  <td className="px-2 py-2">{item.collateralStatusName}</td>
                  <td className="px-2 py-2">{formatMoney(item.coverageValue)}</td>
                  <td className="px-2 py-2">{item.notes || '—'}</td>
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      className="btn-table-action w-7 px-0"
                      onClick={() => onRemove(item)}
                      disabled={!canEdit || isProcessing}
                      aria-label="Eliminar garantía"
                    >
                      <Trash2 className="mx-auto h-4 w-4" />
                    </button>
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
