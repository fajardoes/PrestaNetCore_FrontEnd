import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { ChartAccountsPage } from '@/presentation/features/accounting/pages/chart-accounts-page'
import { CostCentersPage } from '@/presentation/features/accounting/pages/cost-centers-page'
import { PeriodsPage } from '@/presentation/features/accounting/pages/periods-page'

export const AccountingRoutes = () => (
  <Fragment>
    <Route path="/accounting/chart" element={<ChartAccountsPage />} />
    <Route path="/accounting/cost-centers" element={<CostCentersPage />} />
    <Route path="/accounting/periods" element={<PeriodsPage />} />
  </Fragment>
)
