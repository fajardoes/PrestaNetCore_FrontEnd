import { Fragment, lazy } from 'react'
import { Route } from 'react-router-dom'

const LoanProductsListPage = lazy(() =>
  import('@/presentation/features/loans/products/pages/loan-products-list-page').then((module) => ({
    default: module.LoanProductsListPage,
  })),
)
const LoanProductFormPage = lazy(() =>
  import('@/presentation/features/loans/products/pages/loan-product-form-page').then((module) => ({
    default: module.LoanProductFormPage,
  })),
)
const LoanCatalogsHomePage = lazy(() =>
  import('@/presentation/features/loans/catalogs/pages/loan-catalogs-home-page').then((module) => ({
    default: module.LoanCatalogsHomePage,
  })),
)
const LoanCatalogPage = lazy(() =>
  import('@/presentation/features/loans/catalogs/pages/loan-catalog-page').then((module) => ({
    default: module.LoanCatalogPage,
  })),
)
const DelinquencyPoliciesPage = lazy(() =>
  import('@/presentation/pages/loans/delinquency-policies/DelinquencyPoliciesPage').then(
    (module) => ({
      default: module.DelinquencyPoliciesPage,
    }),
  ),
)
const DelinquencyPolicyFormPage = lazy(() =>
  import('@/presentation/pages/loans/delinquency-policies/DelinquencyPolicyFormPage').then(
    (module) => ({
      default: module.DelinquencyPolicyFormPage,
    }),
  ),
)
const ResolveDelinquencyPolicyPage = lazy(() =>
  import('@/presentation/pages/loans/delinquency-policies/ResolveDelinquencyPolicyPage').then(
    (module) => ({
      default: module.ResolveDelinquencyPolicyPage,
    }),
  ),
)
const DelinquencyPolicyAssignmentsPage = lazy(() =>
  import(
    '@/presentation/pages/loans/delinquency-policy-assignments/DelinquencyPolicyAssignmentsPage'
  ).then((module) => ({
    default: module.DelinquencyPolicyAssignmentsPage,
  })),
)
const LoanApplicationsListPage = lazy(() =>
  import('@/presentation/features/loans/applications/pages/loan-applications-list-page').then(
    (module) => ({
      default: module.LoanApplicationsListPage,
    }),
  ),
)
const LoanApplicationCreatePage = lazy(() =>
  import('@/presentation/features/loans/applications/pages/loan-application-create-page').then(
    (module) => ({
      default: module.LoanApplicationCreatePage,
    }),
  ),
)
const LoanApplicationDetailPage = lazy(() =>
  import('@/presentation/features/loans/applications/pages/loan-application-detail-page').then(
    (module) => ({
      default: module.LoanApplicationDetailPage,
    }),
  ),
)
const LoanApplicationEditPage = lazy(() =>
  import('@/presentation/features/loans/applications/pages/loan-application-edit-page').then(
    (module) => ({
      default: module.LoanApplicationEditPage,
    }),
  ),
)
const LoanApplicationFinancialProfilePage = lazy(() =>
  import(
    '@/presentation/features/loans/applications/pages/loan-application-financial-profile-page'
  ).then((module) => ({
    default: module.LoanApplicationFinancialProfilePage,
  })),
)
const DailyClosingDashboardPage = lazy(() =>
  import('@/presentation/features/loans/daily-closing/pages/daily-closing-dashboard-page').then(
    (module) => ({
      default: module.DailyClosingDashboardPage,
    }),
  ),
)
const DailyClosingExecutionPage = lazy(() =>
  import('@/presentation/features/loans/daily-closing/pages/daily-closing-execution-page').then(
    (module) => ({
      default: module.DailyClosingExecutionPage,
    }),
  ),
)
const DailyClosingRunDetailPage = lazy(() =>
  import('@/presentation/features/loans/daily-closing/pages/daily-closing-run-detail-page').then(
    (module) => ({
      default: module.DailyClosingRunDetailPage,
    }),
  ),
)
const DailyClosingRunsPage = lazy(() =>
  import('@/presentation/features/loans/daily-closing/pages/daily-closing-runs-page').then(
    (module) => ({
      default: module.DailyClosingRunsPage,
    }),
  ),
)
const LoanDetailPage = lazy(() =>
  import('@/presentation/features/loans/loans-query/pages/loan-detail-page').then((module) => ({
    default: module.LoanDetailPage,
  })),
)
const LoanInstallmentDetailPage = lazy(() =>
  import('@/presentation/features/loans/loans-query/pages/loan-installment-detail-page').then(
    (module) => ({
      default: module.LoanInstallmentDetailPage,
    }),
  ),
)
const LoansHomePage = lazy(() =>
  import('@/presentation/features/loans/loans-query/pages/loans-home-page').then((module) => ({
    default: module.LoansHomePage,
  })),
)
const AnticipatedInstallmentSettingsPage = lazy(() =>
  import(
    '@/presentation/features/loans/anticipated-installment-settings/pages/anticipated-installment-settings-page'
  ).then((module) => ({
    default: module.AnticipatedInstallmentSettingsPage,
  })),
)

export const LoansRoutes = () => (
  <Fragment>
    <Route path="/loans/products" element={<LoanProductsListPage />} />
    <Route path="/loans/products/new" element={<LoanProductFormPage />} />
    <Route path="/loans/products/:id" element={<LoanProductFormPage />} />
    <Route path="/loans/products/catalogs" element={<LoanCatalogsHomePage />} />
    <Route path="/loans/anticipated-installment-settings" element={<AnticipatedInstallmentSettingsPage />} />
    <Route
      path="/loans/products/catalogs/:catalogKey"
      element={<LoanCatalogPage />}
    />
    <Route
      path="/loans/delinquency-policies"
      element={<DelinquencyPoliciesPage />}
    />
    <Route
      path="/loans/delinquency-policies/new"
      element={<DelinquencyPolicyFormPage />}
    />
    <Route
      path="/loans/delinquency-policies/resolve"
      element={<ResolveDelinquencyPolicyPage />}
    />
    <Route
      path="/loans/delinquency-policies/:id"
      element={<DelinquencyPolicyFormPage />}
    />
    <Route
      path="/loans/delinquency-policy-assignments"
      element={<DelinquencyPolicyAssignmentsPage />}
    />
    <Route path="/loans/applications" element={<LoanApplicationsListPage />} />
    <Route path="/loans/applications/new" element={<LoanApplicationCreatePage />} />
    <Route
      path="/loans/applications/:id/financial-profile"
      element={<LoanApplicationFinancialProfilePage />}
    />
    <Route path="/loans/applications/:id" element={<LoanApplicationDetailPage />} />
    <Route
      path="/loans/applications/:id/edit"
      element={<LoanApplicationEditPage />}
    />
    <Route path="/loans/daily-closing" element={<DailyClosingDashboardPage />} />
    <Route
      path="/loans/daily-closing/execute"
      element={<DailyClosingExecutionPage />}
    />
    <Route path="/loans/daily-closing/runs" element={<DailyClosingRunsPage />} />
    <Route
      path="/loans/daily-closing/runs/:id"
      element={<DailyClosingRunDetailPage />}
    />
    <Route path="/loans" element={<LoansHomePage />} />
    <Route path="/loans/:id" element={<LoanDetailPage />} />
    <Route
      path="/loans/:id/installments/:installmentNo"
      element={<LoanInstallmentDetailPage />}
    />
  </Fragment>
)
