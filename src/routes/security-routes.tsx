import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { MenusPage } from '@/presentation/features/security/menus/pages/menus-page'
import { UsersPage } from '@/presentation/features/security/pages/users-page'

export const SecurityRoutes = () => (
  <Fragment>
    <Route path="/security/users" element={<UsersPage />} />
    <Route path="/security/menus" element={<MenusPage />} />
  </Fragment>
)
