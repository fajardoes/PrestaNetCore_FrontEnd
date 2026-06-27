import { Fragment, lazy } from 'react'
import { Route } from 'react-router-dom'

const ClientsPage = lazy(() =>
  import('@/presentation/features/clients/pages/clients-page').then((module) => ({
    default: module.ClientsPage,
  })),
)
const ClientCatalogsPage = lazy(() =>
  import('@/presentation/features/clients/pages/client-catalogs-page').then((module) => ({
    default: module.ClientCatalogsPage,
  })),
)
const CollateralsListPage = lazy(() =>
  import('@/presentation/pages/collaterals/collaterals-list-page').then((module) => ({
    default: module.CollateralsListPage,
  })),
)
const CollateralFormPage = lazy(() =>
  import('@/presentation/pages/collaterals/collateral-form-page').then((module) => ({
    default: module.CollateralFormPage,
  })),
)
const CollateralDetailPage = lazy(() =>
  import('@/presentation/pages/collaterals/collateral-detail-page').then((module) => ({
    default: module.CollateralDetailPage,
  })),
)
const CollateralTypesPage = lazy(() =>
  import('@/presentation/pages/catalogs/collaterals/collateral-types-page').then((module) => ({
    default: module.CollateralTypesPage,
  })),
)
const CollateralStatusesPage = lazy(() =>
  import('@/presentation/pages/catalogs/collaterals/collateral-statuses-page').then((module) => ({
    default: module.CollateralStatusesPage,
  })),
)

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
