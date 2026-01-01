import { Fragment } from 'react'
import { Route } from 'react-router-dom'
import { ChartAccountsPage } from '@/presentation/features/accounting/pages/chart-accounts-page'
import { CostCentersPage } from '@/presentation/features/accounting/pages/cost-centers-page'
import { PeriodsPage } from '@/presentation/features/accounting/pages/periods-page'
import { JournalPage } from '@/presentation/features/accounting/journal/pages/journal-page'
import { LedgerPage } from '@/presentation/features/accounting/ledger/pages/ledger-page'
import { TrialBalancePage } from '@/presentation/features/accounting/reports/trial-balance-page'
import { BalanceSheetPage } from '@/presentation/features/accounting/reports/balance-sheet-page'
import { IncomeStatementPage } from '@/presentation/features/accounting/reports/income-statement-page'

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
