import { Fragment, lazy } from 'react'
import { Route } from 'react-router-dom'

const AgenciesPage = lazy(() =>
  import('@/presentation/features/organization/pages/agencies-page').then((module) => ({
    default: module.AgenciesPage,
  })),
)
const DepartmentsPage = lazy(() =>
  import('@/presentation/features/organization/pages/departments-page').then((module) => ({
    default: module.DepartmentsPage,
  })),
)
const MunicipalitiesPage = lazy(() =>
  import('@/presentation/features/organization/pages/municipalities-page').then((module) => ({
    default: module.MunicipalitiesPage,
  })),
)
const HolidaysPage = lazy(() =>
  import('@/presentation/features/organization/pages/holidays-page').then((module) => ({
    default: module.HolidaysPage,
  })),
)

export const OrganizationRoutes = () => (
  <Fragment>
    <Route path="/organization/agencies" element={<AgenciesPage />} />
    <Route path="/organization/departments" element={<DepartmentsPage />} />
    <Route path="/organization/municipalities" element={<MunicipalitiesPage />} />
    <Route path="/organization/holidays" element={<HolidaysPage />} />
  </Fragment>
)
