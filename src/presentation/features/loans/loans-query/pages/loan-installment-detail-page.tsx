import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { InstallmentDetailContent } from '@/presentation/features/loans/loans-query/components/installment-detail-content'
import { QueryHeroCard } from '@/presentation/features/loans/loans-query/components/loan-query-ui'
import { useLoanInstallment } from '@/presentation/features/loans/loans-query/hooks/use-loan-installment'
import {
  statusBadgeClass,
  translateLoanApplicationStatus,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

export const LoanInstallmentDetailPage = () => {
  const { id = '', installmentNo = '' } = useParams()
  const installmentNumber = Number.parseInt(installmentNo, 10)
  const { installment, isLoading, error, loadInstallment } = useLoanInstallment()

  useEffect(() => {
    if (!id || Number.isNaN(installmentNumber)) return
    void loadInstallment(id, installmentNumber)
  }, [id, installmentNumber, loadInstallment])

  return (
    <div className="space-y-4">
      <QueryHeroCard
        eyebrow="Detalle de cuota"
        title={`Cuota #${Number.isNaN(installmentNumber) ? installmentNo || '—' : installmentNumber}`}
        description={`Consulta el estado y el desglose financiero de la cuota. Préstamo: ${installment?.loanId ?? id}.`}
        badge={
          installment ? (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(installment.statusCode)}`}
            >
              {translateLoanApplicationStatus(installment.statusCode, installment.statusName)}
            </span>
          ) : null
        }
        actions={
          <Link className="btn-secondary btn-list-action" to={`/loans/${id}`}>
            Volver al préstamo
          </Link>
        }
      />

      <InstallmentDetailContent installment={installment} isLoading={isLoading} error={error} />
    </div>
  )
}
