import { Fragment, lazy } from 'react'
import { Route } from 'react-router-dom'

const SystemBusinessDatePage = lazy(() =>
  import('@/presentation/features/system-business-date/pages/system-business-date-page').then(
    (module) => ({
      default: module.SystemBusinessDatePage,
    }),
  ),
)
const SystemCollectionTransitAccountPage = lazy(() =>
  import(
    '@/presentation/features/system-collection-transit-account/pages/system-collection-transit-account-page'
  ).then((module) => ({
    default: module.SystemCollectionTransitAccountPage,
  })),
)
const SystemLoanDisbursementAccountPage = lazy(() =>
  import(
    '@/presentation/features/system-loan-disbursement-account/pages/system-loan-disbursement-account-page'
  ).then((module) => ({
    default: module.SystemLoanDisbursementAccountPage,
  })),
)
const SystemLoanInterestAccrualPage = lazy(() =>
  import(
    '@/presentation/features/system-loan-interest-accrual/pages/system-loan-interest-accrual-page'
  ).then((module) => ({
    default: module.SystemLoanInterestAccrualPage,
  })),
)

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
    <Route
      path="/admin/system/loan-interest-accrual"
      element={<SystemLoanInterestAccrualPage />}
    />
  </Fragment>
)
