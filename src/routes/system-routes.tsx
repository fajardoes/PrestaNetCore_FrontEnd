import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { SystemBusinessDatePage } from '@/presentation/features/system-business-date/pages/system-business-date-page'

export const SystemRoutes = () => (
  <Fragment>
    <Route
      path="/admin/system/business-date"
      element={<SystemBusinessDatePage />}
    />
  </Fragment>
)
