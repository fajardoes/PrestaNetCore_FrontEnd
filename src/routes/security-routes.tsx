import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { UsersPage } from '@/presentation/features/security/pages/users-page'

export const SecurityRoutes = () => (
  <Fragment>
    <Route path="/security/users" element={<UsersPage />} />
  </Fragment>
)
