import { Fragment, lazy } from 'react'
import { Route } from 'react-router-dom'

const AuditEntriesPage = lazy(() =>
  import('@/presentation/features/audit/pages/audit-entries-page').then((module) => ({
    default: module.AuditEntriesPage,
  })),
)

export const AuditRoutes = () => (
  <Fragment>
    <Route path="/audit/entries" element={<AuditEntriesPage />} />
  </Fragment>
)
