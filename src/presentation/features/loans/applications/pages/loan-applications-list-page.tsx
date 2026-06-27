import { useEffect, useMemo, useState } from 'react'
import { CircleAlert, Eye, FileCheck2, Pencil, Plus, Printer } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LoanApplicationReport } from '@/presentation/components/reports/loans/loan-application-report'
import { PdfViewerDialog } from '@/presentation/components/reports/pdf-viewer-dialog'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import { MessageModal } from '@/presentation/share/components/message-modal'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { TableTabular } from '@/presentation/share/components/table-tabular'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { useLoanApplicationReport } from '@/presentation/features/loans/applications/hooks/use-loan-application-report'
import { useLoanApplicationsList } from '@/presentation/features/loans/applications/hooks/use-loan-applications-list'
import { useLoanApplicationOptions } from '@/presentation/features/loans/applications/hooks/use-loan-application-options'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import type { LoanApplicationResponse } from '@/infrastructure/loans/responses/loan-application-response'
import {
  financialProfileBadgeClass,
  formatDate,
  formatMoney,
  statusBadgeClass,
  translateLoanApplicationStatus,
} from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200]

type FeedbackTone = 'success' | 'error' | 'info' | 'warning'

interface ListWorkflowFeedback {
  tone: FeedbackTone
  title: string
  description: string
}

interface LoanApplicationsListLocationState {
  workflowFeedback?: ListWorkflowFeedback
}

interface PrintDialogState {
  id: string
  label: string
}

export const LoanApplicationsListPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    items,
    isLoading,
    isLoadingActions,
    error,
    allowedActionsById,
    filters,
    page,
    take,
    totalPages,
    statusOptions,
    applyFilters,
    setPage,
    setTake,
  } = useLoanApplicationsList()
  const {
    searchClients,
    searchPromoters,
    searchLoanProducts,
  } = useLoanApplicationOptions()
  const {
    report,
    isLoading: isReportLoading,
    loadReport,
    clearReport,
  } = useLoanApplicationReport()
  const { hasPermission, isLoading: isLoadingPermissions } = useUserPermissions()
  const canCreateLoanApplication = hasPermission('loan_applications.create')
  const locationState = location.state as LoanApplicationsListLocationState | null
  const workflowFeedbackFromNavigation = locationState?.workflowFeedback ?? null

  const [search, setSearch] = useState(filters.search ?? '')
  const [clientId, setClientId] = useState(filters.clientId ?? '')
  const [loanProductId, setLoanProductId] = useState(filters.loanProductId ?? '')
  const [promoterId, setPromoterId] = useState(filters.promoterId ?? '')
  const [statusId, setStatusId] = useState(filters.statusId ?? '')
  const [createdFrom, setCreatedFrom] = useState(filters.createdFrom ?? '')
  const [createdTo, setCreatedTo] = useState(filters.createdTo ?? '')

  const [selectedClient, setSelectedClient] = useState<AsyncSelectOption | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<AsyncSelectOption | null>(null)
  const [selectedPromoter, setSelectedPromoter] = useState<AsyncSelectOption | null>(null)
  const [workflowFeedback, setWorkflowFeedback] = useState<ListWorkflowFeedback | null>(
    workflowFeedbackFromNavigation,
  )
  const [printDialog, setPrintDialog] = useState<PrintDialogState | null>(null)

  const openPrintPreview = async (id: string, label: string) => {
    const result = await loadReport(id)
    if (result.success) {
      setPrintDialog({ id, label })
      return
    }
    setWorkflowFeedback({
      tone: 'error',
      title: 'No se pudo preparar la impresion',
      description: result.error,
    })
  }

  useEffect(() => {
    if (!workflowFeedbackFromNavigation) return
    setWorkflowFeedback(workflowFeedbackFromNavigation)
  }, [workflowFeedbackFromNavigation])

  const statusOptionsResolved = useMemo(() => {
    if (!statusId) return statusOptions
    const exists = statusOptions.some((item) => item.value === statusId)
    if (exists) return statusOptions
    return [...statusOptions, { value: statusId, label: statusId }]
  }, [statusId, statusOptions])

  const columns = [
    {
      key: 'actions',
      header: 'Acciones',
      className: 'min-w-[120px]',
      render: (item: LoanApplicationResponse) => (
        <span className="flex items-center justify-start gap-1">
          {isLoadingActions && !allowedActionsById[item.id] ? (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              ...
            </span>
          ) : null}
          <button
            type="button"
            className="btn-table-action w-7 px-0"
            onClick={() => navigate(`/loans/applications/${item.id}`)}
            title="Ver detalle de solicitud"
            aria-label="Ver"
          >
            <Eye className="mx-auto h-4 w-4" />
          </button>
          {allowedActionsById[item.id]?.includes('update_draft') ? (
            <button
              type="button"
              className="btn-table-action w-7 px-0"
              onClick={() =>
                navigate(`/loans/applications/${item.id}/edit`, {
                  state: { returnTo: '/loans/applications' },
                })
              }
              title="Editar solicitud"
              aria-label="Editar"
            >
              <Pencil className="mx-auto h-4 w-4" />
            </button>
          ) : null}
          {allowedActionsById[item.id]?.includes('print') ? (
            <button
              type="button"
              className="btn-table-action w-7 px-0"
              onClick={() =>
                void openPrintPreview(
                  item.id,
                  item.applicationNo || item.id.slice(0, 8),
                )
              }
              title="Imprimir solicitud"
              aria-label="Imprimir"
              disabled={isReportLoading}
            >
              <Printer className="mx-auto h-4 w-4" />
            </button>
          ) : null}
        </span>
      ),
    },
    {
      key: 'application',
      header: 'Solicitud / préstamo',
      className: 'min-w-[155px]',
      render: (item: LoanApplicationResponse) => (
        <span className="block">
          <span className="block font-medium">
            {item.applicationNo || item.id.slice(0, 8)}
          </span>
          {item.approvedLoanNo ? (
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              Préstamo: {item.approvedLoanNo}
            </span>
          ) : null}
        </span>
      ),
      getTitle: (item: LoanApplicationResponse) =>
        item.approvedLoanNo
          ? `${item.applicationNo || item.id.slice(0, 8)} - Préstamo: ${item.approvedLoanNo}`
          : item.applicationNo || item.id.slice(0, 8),
    },
    {
      key: 'client',
      header: 'Cliente',
      className: 'min-w-[220px]',
      render: (item: LoanApplicationResponse) => (
        <span className="block">
          <span className="block">{item.clientFullName}</span>
          <HnIdentityText
            value={item.clientIdentityNo}
            className="block text-[11px] text-slate-500 dark:text-slate-400"
          />
        </span>
      ),
      getTitle: (item: LoanApplicationResponse) => item.clientFullName,
    },
    {
      key: 'product',
      header: 'Producto',
      className: 'min-w-[180px]',
      render: (item: LoanApplicationResponse) => item.loanProductName,
      getTitle: (item: LoanApplicationResponse) => item.loanProductName,
    },
    {
      key: 'promoter',
      header: 'Promotor',
      className: 'min-w-[180px]',
      render: (item: LoanApplicationResponse) => item.promoterClientFullName,
      getTitle: (item: LoanApplicationResponse) => item.promoterClientFullName,
    },
    {
      key: 'principal',
      header: 'Capital',
      className: 'min-w-[110px] text-right',
      render: (item: LoanApplicationResponse) =>
        formatMoney(item.requestedPrincipal),
      getTitle: (item: LoanApplicationResponse) =>
        formatMoney(item.requestedPrincipal),
    },
    {
      key: 'term',
      header: 'Duración',
      className: 'min-w-[125px]',
      render: (item: LoanApplicationResponse) =>
        `${item.requestedTerm} ${item.requestedTermUnitName}`,
      getTitle: (item: LoanApplicationResponse) =>
        `${item.requestedTerm} ${item.requestedTermUnitName}`,
    },
    {
      key: 'paymentFrequency',
      header: 'Frecuencia de pago',
      className: 'min-w-[130px]',
      render: (item: LoanApplicationResponse) => item.requestedPaymentFrequencyName,
      getTitle: (item: LoanApplicationResponse) => item.requestedPaymentFrequencyName,
    },
    {
      key: 'status',
      header: 'Estado',
      className: 'min-w-[115px]',
      render: (item: LoanApplicationResponse) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(item.statusCode)}`}
        >
          {translateLoanApplicationStatus(item.statusCode, item.statusName)}
        </span>
      ),
      getTitle: (item: LoanApplicationResponse) =>
        translateLoanApplicationStatus(item.statusCode, item.statusName),
    },
    {
      key: 'financialProfile',
      header: 'Ficha financiera',
      className: 'min-w-[110px]',
      render: (item: LoanApplicationResponse) => (
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${financialProfileBadgeClass(item.hasFinancialProfile)}`}
          title={
            item.hasFinancialProfile
              ? 'Ficha financiera registrada'
              : 'Sin ficha financiera registrada'
          }
          aria-label={
            item.hasFinancialProfile
              ? 'Ficha financiera registrada'
              : 'Sin ficha financiera registrada'
          }
        >
          {item.hasFinancialProfile ? (
            <FileCheck2 className="h-4 w-4" />
          ) : (
            <CircleAlert className="h-4 w-4 text-red-600 dark:text-red-300" />
          )}
        </span>
      ),
    },
    {
      key: 'created',
      header: 'Creación',
      className: 'min-w-[100px]',
      render: (item: LoanApplicationResponse) => formatDate(item.createdAt),
      getTitle: (item: LoanApplicationResponse) => formatDate(item.createdAt),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Solicitudes de crédito
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Gestiona solicitudes, flujo de aprobación y garantías vinculadas.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <ListFiltersBar
          search={search}
          onSearchChange={setSearch}
          status="all"
          onStatusChange={() => undefined}
          showStatus={false}
          layout="two-rows"
          placeholder="Buscar por SCC-..., PRE-..., cliente o producto..."
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary px-3 py-1.5 text-xs"
                onClick={() => {
                  setSearch('')
                  setClientId('')
                  setLoanProductId('')
                  setPromoterId('')
                  setStatusId('')
                  setCreatedFrom('')
                  setCreatedTo('')
                  setSelectedClient(null)
                  setSelectedProduct(null)
                  setSelectedPromoter(null)
                  applyFilters({})
                }}
              >
                Limpiar filtros
              </button>
              <button
                type="button"
                className="btn-primary px-3 py-1.5 text-xs"
                onClick={() => {
                  applyFilters({
                    search,
                    clientId: clientId || undefined,
                    loanProductId: loanProductId || undefined,
                    promoterId: promoterId || undefined,
                    statusId: statusId || undefined,
                    createdFrom: createdFrom || undefined,
                    createdTo: createdTo || undefined,
                  })
                }}
              >
                Buscar
              </button>
              {canCreateLoanApplication ? (
                <button
                  type="button"
                  className="btn-primary inline-flex items-center gap-2 px-3 py-1.5 text-xs"
                  disabled={isLoadingPermissions}
                  onClick={() => navigate('/loans/applications/new')}
                >
                  <Plus className="h-3.5 w-3.5" /> Crear solicitud
                </button>
              ) : null}
            </div>
          }
        >
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Cliente
              </label>
              <AsyncSelect
                value={selectedClient}
                onChange={(option) => {
                  setSelectedClient(option)
                  setClientId(option?.value ?? '')
                }}
                loadOptions={searchClients}
                placeholder="Cliente"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Producto
              </label>
              <AsyncSelect
                value={selectedProduct}
                onChange={(option) => {
                  setSelectedProduct(option)
                  setLoanProductId(option?.value ?? '')
                }}
                loadOptions={searchLoanProducts}
                placeholder="Producto"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Promotor
              </label>
              <AsyncSelect
                value={selectedPromoter}
                onChange={(option) => {
                  setSelectedPromoter(option)
                  setPromoterId(option?.value ?? '')
                }}
                loadOptions={searchPromoters}
                placeholder="Promotor"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Estado
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={statusId}
                onChange={(event) => setStatusId(event.target.value)}
              >
                <option value="">Todos</option>
                {statusOptionsResolved.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Desde
              </label>
              <DatePicker value={createdFrom} onChange={setCreatedFrom} allowFutureDates />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Hasta
              </label>
              <DatePicker value={createdTo} onChange={setCreatedTo} allowFutureDates />
            </div>
          </div>
        </ListFiltersBar>
      </div>

      <div className="space-y-3">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
            {error}
          </div>
        ) : null}

        <TableTabular
          title="Listado de solicitudes de crédito"
          columns={columns}
          rows={items}
          rowKey={(item) => item.id}
          isLoading={isLoading}
          loadingMessage="Cargando solicitudes..."
          emptyMessage={error ? 'No fue posible cargar las solicitudes.' : 'No hay solicitudes para los filtros actuales.'}
          maxHeightClassName="max-h-[640px]"
          rowNumberStart={(page - 1) * take + 1}
        />

        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={take}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageSizeChange={setTake}
        />
      </div>

      <MessageModal
        open={Boolean(workflowFeedback)}
        tone={workflowFeedback?.tone}
        title={workflowFeedback?.title || ''}
        description={workflowFeedback?.description || ''}
        onAcknowledge={() => {
          setWorkflowFeedback(null)
          navigate('/loans/applications', { replace: true, state: null })
        }}
      />

      {report && printDialog ? (
        <PdfViewerDialog
          isOpen={Boolean(printDialog)}
          onClose={() => {
            setPrintDialog(null)
            clearReport()
          }}
          title={`Solicitud ${printDialog.label}`}
          document={<LoanApplicationReport data={report} organizationName="PrestaNet" />}
        />
      ) : null}
    </div>
  )
}
