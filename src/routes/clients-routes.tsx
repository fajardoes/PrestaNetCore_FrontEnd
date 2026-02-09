import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { ClientsPage } from '@/presentation/features/clients/pages/clients-page'
import { ClientCatalogsPage } from '@/presentation/features/clients/pages/client-catalogs-page'
import { CollateralsListPage } from '@/presentation/pages/collaterals/collaterals-list-page'
import { CollateralFormPage } from '@/presentation/pages/collaterals/collateral-form-page'
import { CollateralDetailPage } from '@/presentation/pages/collaterals/collateral-detail-page'
import { CollateralTypesPage } from '@/presentation/pages/catalogs/collaterals/collateral-types-page'
import { CollateralStatusesPage } from '@/presentation/pages/catalogs/collaterals/collateral-statuses-page'

export const ClientsRoutes = () => (
  <Fragment>
    <Route path="/clients" element={<ClientsPage />} />
    <Route path="/clients/catalogs" element={<ClientCatalogsPage />} />
    <Route path="/clients/collaterals" element={<CollateralsListPage />} />
    <Route path="/clients/collaterals/new" element={<CollateralFormPage />} />
    <Route path="/clients/collaterals/:id" element={<CollateralDetailPage />} />
    <Route path="/clients/collaterals/:id/edit" element={<CollateralFormPage />} />
    <Route
      path="/catalogs/collaterals/types"
      element={<CollateralTypesPage />}
    />
    <Route
      path="/catalogs/collaterals/statuses"
      element={<CollateralStatusesPage />}
    />
  </Fragment>
)
