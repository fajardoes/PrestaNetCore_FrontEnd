import { Fragment } from 'react'
import { Navigate, Route } from 'react-router-dom'
import { BankEntitiesPage } from '@/presentation/features/payments/pages/bank-entities-page'
import { BankPaymentProofRegisterPage } from '@/presentation/features/payments/pages/bank-payment-proof-register-page'
import { BankPaymentProofsPage } from '@/presentation/features/payments/pages/bank-payment-proofs-page'
import { PaymentComponentPrioritiesPage } from '@/presentation/features/payments/pages/payment-component-priorities-page'
import { PaymentDetailPage } from '@/presentation/features/payments/pages/payment-detail-page'
import { PaymentsListPage } from '@/presentation/features/payments/pages/payments-list-page'
import { PaymentsRegisterPage } from '@/presentation/features/payments/pages/payments-register-page'

export const PaymentsRoutes = () => (
  <Fragment>
    <Route path="/payments" element={<Navigate to="/cash-collections/payments" replace />} />
    <Route path="/payments/new" element={<Navigate to="/cash-collections/payments/new" replace />} />
    <Route path="/cash-collections/payments" element={<PaymentsListPage />} />
    <Route path="/cash-collections/payments/new" element={<PaymentsRegisterPage />} />
    <Route path="/cash-collections/payments/:id" element={<PaymentDetailPage />} />
    <Route path="/bank-payment-proofs" element={<BankPaymentProofsPage />} />
    <Route path="/bank-payment-proofs/new" element={<BankPaymentProofRegisterPage />} />
    <Route
      path="/bank-payment-proofs/catalogs/bank-entities"
      element={<BankEntitiesPage />}
    />
    <Route path="/bank-payment-proofs/:id" element={<PaymentDetailPage />} />
    <Route
      path="/payments/component-priorities"
      element={<PaymentComponentPrioritiesPage />}
    />
    <Route path="/payments/:id" element={<PaymentDetailPage />} />
  </Fragment>
)
