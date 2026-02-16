import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { LoanProductsListPage } from '@/presentation/features/loans/products/pages/loan-products-list-page'
import { LoanProductFormPage } from '@/presentation/features/loans/products/pages/loan-product-form-page'
import { LoanCatalogsHomePage } from '@/presentation/features/loans/catalogs/pages/loan-catalogs-home-page'
import { LoanCatalogPage } from '@/presentation/features/loans/catalogs/pages/loan-catalog-page'
import { DelinquencyPoliciesPage } from '@/presentation/pages/loans/delinquency-policies/DelinquencyPoliciesPage'
import { DelinquencyPolicyFormPage } from '@/presentation/pages/loans/delinquency-policies/DelinquencyPolicyFormPage'
import { ResolveDelinquencyPolicyPage } from '@/presentation/pages/loans/delinquency-policies/ResolveDelinquencyPolicyPage'
import { DelinquencyPolicyAssignmentsPage } from '@/presentation/pages/loans/delinquency-policy-assignments/DelinquencyPolicyAssignmentsPage'
import { LoanApplicationsListPage } from '@/presentation/features/loans/applications/pages/loan-applications-list-page'
import { LoanApplicationCreatePage } from '@/presentation/features/loans/applications/pages/loan-application-create-page'
import { LoanApplicationDetailPage } from '@/presentation/features/loans/applications/pages/loan-application-detail-page'
import { LoanApplicationEditPage } from '@/presentation/features/loans/applications/pages/loan-application-edit-page'
import { LoanDetailPage } from '@/presentation/features/loans/loans-query/pages/loan-detail-page'
import { LoanInstallmentDetailPage } from '@/presentation/features/loans/loans-query/pages/loan-installment-detail-page'
import { LoansHomePage } from '@/presentation/features/loans/loans-query/pages/loans-home-page'

export const LoansRoutes = () => (
  <Fragment>
    <Route path="/loans/products" element={<LoanProductsListPage />} />
    <Route path="/loans/products/new" element={<LoanProductFormPage />} />
    <Route path="/loans/products/:id" element={<LoanProductFormPage />} />
    <Route path="/loans/products/catalogs" element={<LoanCatalogsHomePage />} />
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
    <Route path="/loans/applications/:id" element={<LoanApplicationDetailPage />} />
    <Route
      path="/loans/applications/:id/edit"
      element={<LoanApplicationEditPage />}
    />
    <Route path="/loans" element={<LoansHomePage />} />
    <Route path="/loans/:id" element={<LoanDetailPage />} />
    <Route
      path="/loans/:id/installments/:installmentNo"
      element={<LoanInstallmentDetailPage />}
    />
  </Fragment>
)
