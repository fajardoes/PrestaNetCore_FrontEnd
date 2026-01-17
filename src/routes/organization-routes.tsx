import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { AgenciesPage } from '@/presentation/features/organization/pages/agencies-page'
import { DepartmentsPage } from '@/presentation/features/organization/pages/departments-page'
import { MunicipalitiesPage } from '@/presentation/features/organization/pages/municipalities-page'

export const OrganizationRoutes = () => (
  <Fragment>
    <Route path="/organization/agencies" element={<AgenciesPage />} />
    <Route path="/organization/departments" element={<DepartmentsPage />} />
    <Route path="/organization/municipalities" element={<MunicipalitiesPage />} />
  </Fragment>
)
