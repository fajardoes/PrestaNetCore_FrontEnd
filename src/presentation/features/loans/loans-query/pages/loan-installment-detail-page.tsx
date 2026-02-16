import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLoanInstallment } from '@/presentation/features/loans/loans-query/hooks/use-loan-installment'
import { formatMoney } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

export const LoanInstallmentDetailPage = () => {
  const { id = '', installmentNo = '' } = useParams()
  const installmentNumber = Number.parseInt(installmentNo, 10)
  const { installment, isLoading, error, loadInstallment } = useLoanInstallment()

  useEffect(() => {
    if (!id || Number.isNaN(installmentNumber)) return
    void loadInstallment(id, installmentNumber)
  }, [id, installmentNumber, loadInstallment])

  if (isLoading) {
    return <p className="text-sm text-slate-600 dark:text-slate-300">Cargando cuota...</p>
  }

  if (error || !installment) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
        {error ?? 'No se encontró la cuota.'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Cuota #{installment.installmentNo}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Préstamo: <code>{installment.loanId}</code>
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
          <Meta label="Fecha original" value={installment.dueDateOriginal} />
          <Meta label="Fecha ajustada" value={installment.dueDateAdjusted} />
          <Meta label="Estado" value={installment.statusName} />
          <Meta label="Principal" value={formatMoney(installment.principalProjected)} />
          <Meta label="Interés" value={formatMoney(installment.interestProjected)} />
          <Meta label="Total" value={formatMoney(installment.totalProjected)} />
          <Meta label="Pagado" value={formatMoney(installment.totalPaid)} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Componentes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="px-2 py-2">Componente</th>
                <th className="px-2 py-2 text-right">Proyectado</th>
                <th className="px-2 py-2 text-right">Pagado</th>
              </tr>
            </thead>
            <tbody>
              {!installment.components.length ? (
                <tr>
                  <td colSpan={3} className="px-2 py-4 text-center text-slate-500 dark:text-slate-400">
                    No hay componentes para esta cuota.
                  </td>
                </tr>
              ) : (
                installment.components.map((component) => (
                  <tr key={component.id} className="border-b border-slate-200/70 dark:border-slate-800">
                    <td className="px-2 py-2">
                      {component.financialComponentCode} - {component.financialComponentName}
                    </td>
                    <td className="px-2 py-2 text-right">{formatMoney(component.amountProjected)}</td>
                    <td className="px-2 py-2 text-right">{formatMoney(component.amountPaid)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex justify-end">
        <Link className="btn-secondary px-4 py-2 text-sm" to={`/loans/${id}`}>
          Volver al préstamo
        </Link>
      </div>
    </div>
  )
}

const Meta = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="font-medium text-slate-800 dark:text-slate-100">{value}</p>
  </div>
)
