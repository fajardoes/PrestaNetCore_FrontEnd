import { Fragment, lazy } from 'react'
import { Route } from 'react-router-dom'

const MenusPage = lazy(() =>
  import('@/presentation/features/security/menus/pages/menus-page').then((module) => ({
    default: module.MenusPage,
  })),
)
const RolePermissionsPage = lazy(() =>
  import('@/presentation/features/security/pages/role-permissions-page').then((module) => ({
    default: module.RolePermissionsPage,
  })),
)
const UsersPage = lazy(() =>
  import('@/presentation/features/security/pages/users-page').then((module) => ({
    default: module.UsersPage,
  })),
)

export const SecurityRoutes = () => (
  <Fragment>
    <Route path="/security/users" element={<UsersPage />} />
    <Route path="/security/menus" element={<MenusPage />} />
    <Route path="/security/role-permissions" element={<RolePermissionsPage />} />
  </Fragment>
)
