import { Fragment, lazy } from 'react'
import { Route } from 'react-router-dom'

const ChartAccountsPage = lazy(() =>
  import('@/presentation/features/accounting/pages/chart-accounts-page').then((module) => ({
    default: module.ChartAccountsPage,
  })),
)
const CostCentersPage = lazy(() =>
  import('@/presentation/features/accounting/pages/cost-centers-page').then((module) => ({
    default: module.CostCentersPage,
  })),
)
const PeriodsPage = lazy(() =>
  import('@/presentation/features/accounting/pages/periods-page').then((module) => ({
    default: module.PeriodsPage,
  })),
)
const JournalPage = lazy(() =>
  import('@/presentation/features/accounting/journal/pages/journal-page').then((module) => ({
    default: module.JournalPage,
  })),
)
const LedgerPage = lazy(() =>
  import('@/presentation/features/accounting/ledger/pages/ledger-page').then((module) => ({
    default: module.LedgerPage,
  })),
)
const TrialBalancePage = lazy(() =>
  import('@/presentation/features/accounting/reports/trial-balance-page').then((module) => ({
    default: module.TrialBalancePage,
  })),
)
const BalanceSheetPage = lazy(() =>
  import('@/presentation/features/accounting/reports/balance-sheet-page').then((module) => ({
    default: module.BalanceSheetPage,
  })),
)
const IncomeStatementPage = lazy(() =>
  import('@/presentation/features/accounting/reports/income-statement-page').then((module) => ({
    default: module.IncomeStatementPage,
  })),
)

export const AccountingRoutes = () => (
  <Fragment>
    <Route path="/accounting/chart" element={<ChartAccountsPage />} />
    <Route path="/accounting/cost-centers" element={<CostCentersPage />} />
    <Route path="/accounting/periods" element={<PeriodsPage />} />
    <Route path="/accounting/journal" element={<JournalPage />} />
    <Route path="/accounting/ledger" element={<LedgerPage />} />
    <Route path="/accounting/reports/trial-balance" element={<TrialBalancePage />} />
    <Route path="/accounting/reports/balance-sheet" element={<BalanceSheetPage />} />
    <Route
      path="/accounting/reports/income-statement"
      element={<IncomeStatementPage />}
    />
  </Fragment>
)
