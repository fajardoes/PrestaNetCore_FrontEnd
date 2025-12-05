import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { AgenciesPage } from '@/presentation/features/organization/pages/agencies-page'

export const OrganizationRoutes = () => (
  <Fragment>
    <Route path="/organization/agencies" element={<AgenciesPage />} />
  </Fragment>
)
