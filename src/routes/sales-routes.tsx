import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { PromotersListPage } from '@/presentation/features/sales/promoters/pages/promoters-list-page'
import { PromoterFormPage } from '@/presentation/features/sales/promoters/pages/promoter-form-page'

export const SalesRoutes = () => (
  <Fragment>
    <Route path="/sales/promoters" element={<PromotersListPage />} />
    <Route path="/sales/promoters/new" element={<PromoterFormPage />} />
    <Route path="/sales/promoters/:id" element={<PromoterFormPage />} />
  </Fragment>
)
