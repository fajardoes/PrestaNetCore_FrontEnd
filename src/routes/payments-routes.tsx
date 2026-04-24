import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { PaymentComponentPrioritiesPage } from '@/presentation/features/payments/pages/payment-component-priorities-page'
import { PaymentDetailPage } from '@/presentation/features/payments/pages/payment-detail-page'
import { PaymentsListPage } from '@/presentation/features/payments/pages/payments-list-page'
import { PaymentsRegisterPage } from '@/presentation/features/payments/pages/payments-register-page'

export const PaymentsRoutes = () => (
  <Fragment>
    <Route path="/payments" element={<PaymentsListPage />} />
    <Route path="/payments/new" element={<PaymentsRegisterPage />} />
    <Route path="/payments/:id" element={<PaymentDetailPage />} />
    <Route
      path="/payments/component-priorities"
      element={<PaymentComponentPrioritiesPage />}
    />
  </Fragment>
)
