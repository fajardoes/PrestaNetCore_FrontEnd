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
  </Fragment>
)
