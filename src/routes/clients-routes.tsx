import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { ClientsPage } from '@/presentation/features/clients/pages/clients-page'
import { ClientCatalogsPage } from '@/presentation/features/clients/pages/client-catalogs-page'

export const ClientsRoutes = () => (
  <Fragment>
    <Route path="/clients" element={<ClientsPage />} />
    <Route path="/clients/catalogs" element={<ClientCatalogsPage />} />
  </Fragment>
)
