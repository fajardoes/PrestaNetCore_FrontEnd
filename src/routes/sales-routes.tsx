import { Fragment, lazy } from 'react'
import { Route } from 'react-router-dom'

const PromotersListPage = lazy(() =>
  import('@/presentation/features/sales/promoters/pages/promoters-list-page').then((module) => ({
    default: module.PromotersListPage,
  })),
)
const PromoterFormPage = lazy(() =>
  import('@/presentation/features/sales/promoters/pages/promoter-form-page').then((module) => ({
    default: module.PromoterFormPage,
  })),
)

export const SalesRoutes = () => (
  <Fragment>
    <Route path="/sales/promoters" element={<PromotersListPage />} />
    <Route path="/sales/promoters/new" element={<PromoterFormPage />} />
    <Route path="/sales/promoters/:id" element={<PromoterFormPage />} />
  </Fragment>
)
