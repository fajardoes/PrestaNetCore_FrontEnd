import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { SystemBusinessDatePage } from '@/presentation/features/system-business-date/pages/system-business-date-page'
import { SystemCollectionTransitAccountPage } from '@/presentation/features/system-collection-transit-account/pages/system-collection-transit-account-page'
import { SystemLoanDisbursementAccountPage } from '@/presentation/features/system-loan-disbursement-account/pages/system-loan-disbursement-account-page'

export const SystemRoutes = () => (
  <Fragment>
    <Route
      path="/admin/system/business-date"
      element={<SystemBusinessDatePage />}
    />
    <Route
      path="/admin/system/loan-disbursement-account"
      element={<SystemLoanDisbursementAccountPage />}
    />
    <Route
      path="/admin/system/collection-transit-account"
      element={<SystemCollectionTransitAccountPage />}
    />
  </Fragment>
)
