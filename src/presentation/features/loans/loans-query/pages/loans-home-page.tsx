import { ArrowRight, Search, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { QueryHeroCard, QueryMetricCard, QuerySectionCard } from '@/presentation/features/loans/loans-query/components/loan-query-ui'
import { ClientLoansTable } from '@/presentation/features/loans/loans-query/components/client-loans-table'
import { LoanClientPickerModal } from '@/presentation/features/loans/loans-query/components/loan-client-picker-modal'
import {
  useClientLoansExplorer,
  type ClientLoansExplorerNavigationState,
} from '@/presentation/features/loans/loans-query/hooks/use-client-loans-explorer'
import { useLoanLookup } from '@/presentation/features/loans/loans-query/hooks/use-loan-lookup'
import {
  formatCurrency,
  formatDate,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'

export const LoansHomePage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [loanCode, setLoanCode] = useState('')
  const { isLoading, error, findByCode } = useLoanLookup()
  const locationState = location.state as { loansQueryState?: ClientLoansExplorerNavigationState } | null
  const {
    clientPickerOpen,
    openClientPicker,
    closeClientPicker,
    clientSearch,
    setClientSearch,
    clientSearchPage,
    setClientSearchPage,
    clientSearchResults,
    clientSearchTotalPages,
    clientSearchLoading,
    clientSearchError,
    selectedClient,
    selectClient,
    clearSelectedClient,
    loans,
    summary,
    loansPage,
    setLoansPage,
    loansPageSize,
    setLoansPageSize,
    loansTotalPages,
    loansLoading,
    loansError,
    navigationState,
  } = useClientLoansExplorer(locationState?.loansQueryState ?? null)

  useEffect(() => {
    const nextState = navigationState.selectedClient ? { loansQueryState: navigationState } : null
    navigate(location.pathname, { replace: true, state: nextState })
  }, [location.pathname, navigate, navigationState])

  const goToLoan = async () => {
    const normalizedCode = loanCode.trim()
    if (!normalizedCode || isLoading) return
    const result = await findByCode(normalizedCode)
    if (!result.success) return
    navigate(`/loans/${result.data.id}`)
  }

  return (
    <div className="space-y-6">
      <QueryHeroCard
        eyebrow="Mesa de consulta"
        title="Préstamos"
        description="Consulta expedientes por código visible o analiza la cartera de un cliente desde una vista operativa y ejecutiva."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
        <QuerySectionCard
          title="Consulta por código"
          description="Acceso directo al detalle del préstamo por su código visible."
        >
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Código del préstamo
              </span>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={loanCode}
                    onChange={(event) => setLoanCode(event.target.value.toUpperCase())}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        void goToLoan()
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                    placeholder="PRE-2026-000001"
                    autoComplete="off"
                  />
                </div>
                <button
                  type="button"
                  className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={() => {
                    void goToLoan()
                  }}
                  disabled={!loanCode.trim() || isLoading}
                >
                  {isLoading ? 'Consultando...' : 'Consultar'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </label>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            ) : null}
          </div>
        </QuerySectionCard>

        <QuerySectionCard
          title="Consulta por cliente"
          description="Selecciona un cliente con préstamos para revisar su cartera."
        >
          <div className="flex h-full flex-col justify-between gap-4">
            {selectedClient ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {selectedClient.clientFullName}
                    </p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      <HnIdentityText value={selectedClient.clientIdentityNo} />
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                        {selectedClient.activeLoansCount} activos
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                        {selectedClient.totalLoansCount} en total
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={openClientPicker}>
                      Cambiar cliente
                    </button>
                    <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={clearSelectedClient}>
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 dark:border-slate-700 dark:bg-slate-900/60">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                    <Users className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      Selecciona un cliente
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Abre el selector para buscar clientes con préstamos y consultar su cartera.
                    </p>
                  </div>
                  <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={openClientPicker}>
                    Buscar cliente
                  </button>
                </div>
              </div>
            )}
          </div>
        </QuerySectionCard>
      </div>

      {selectedClient ? (
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <QueryMetricCard
              label="Préstamos activos"
              value={String(summary?.activeLoansCount ?? selectedClient.activeLoansCount)}
              hint="Cartera vigente del cliente"
              accent="emerald"
            />
            <QueryMetricCard
              label="Préstamos totales"
              value={String(summary?.totalLoansCount ?? selectedClient.totalLoansCount)}
              hint="Histórico disponible para consulta"
              accent="slate"
            />
            <QueryMetricCard
              label="Capital total"
              value={formatCurrency(summary?.totalPrincipal)}
              hint="Monto original agregado"
              accent="blue"
            />
            <QueryMetricCard
              label="Saldo agregado"
              value={formatCurrency(summary?.totalOutstanding)}
              hint={`Próximo vencimiento: ${formatDate(summary?.nextDueDate ?? selectedClient.nextDueDate)}`}
              accent="amber"
            />
          </div>

          <QuerySectionCard
            title="Préstamos del cliente"
            description="Vista consolidada de la cartera del cliente seleccionado."
          >
            <ClientLoansTable
              loans={loans}
              page={loansPage}
              totalPages={loansTotalPages}
              pageSize={loansPageSize}
              onPageChange={(nextPage) => setLoansPage(Math.max(1, nextPage))}
              onPageSizeChange={setLoansPageSize}
              isLoading={loansLoading}
              error={loansError}
              detailNavigationState={{
                returnTo: '/loans',
                loansQueryState: navigationState,
              }}
            />
          </QuerySectionCard>
        </div>
      ) : null}

      <LoanClientPickerModal
        open={clientPickerOpen}
        clients={clientSearchResults}
        search={clientSearch}
        page={clientSearchPage}
        totalPages={clientSearchTotalPages}
        isLoading={clientSearchLoading}
        error={clientSearchError}
        selectedClientId={selectedClient?.id}
        onSearchChange={setClientSearch}
        onPageChange={setClientSearchPage}
        onSelect={selectClient}
        onClose={closeClientPicker}
      />
    </div>
  )
}
