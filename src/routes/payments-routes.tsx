import { Fragment, lazy } from 'react'
import { Navigate, Route } from 'react-router-dom'

const BankEntitiesPage = lazy(() =>
  import('@/presentation/features/payments/pages/bank-entities-page').then((module) => ({
    default: module.BankEntitiesPage,
  })),
)
const BankPaymentProofRegisterPage = lazy(() =>
  import('@/presentation/features/payments/pages/bank-payment-proof-register-page').then((module) => ({
    default: module.BankPaymentProofRegisterPage,
  })),
)
const BankPaymentProofsPage = lazy(() =>
  import('@/presentation/features/payments/pages/bank-payment-proofs-page').then((module) => ({
    default: module.BankPaymentProofsPage,
  })),
)
const PaymentComponentPrioritiesPage = lazy(() =>
  import('@/presentation/features/payments/pages/payment-component-priorities-page').then((module) => ({
    default: module.PaymentComponentPrioritiesPage,
  })),
)
const PaymentDetailPage = lazy(() =>
  import('@/presentation/features/payments/pages/payment-detail-page').then((module) => ({
    default: module.PaymentDetailPage,
  })),
)
const PaymentsListPage = lazy(() =>
  import('@/presentation/features/payments/pages/payments-list-page').then((module) => ({
    default: module.PaymentsListPage,
  })),
)
const PaymentsRegisterPage = lazy(() =>
  import('@/presentation/features/payments/pages/payments-register-page').then((module) => ({
    default: module.PaymentsRegisterPage,
  })),
)

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
