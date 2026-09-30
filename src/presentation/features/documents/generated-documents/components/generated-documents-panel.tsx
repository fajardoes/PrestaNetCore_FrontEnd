import { Download, Eye, History, RefreshCw, RotateCcw } from 'lucide-react'
import { FilePreviewModal } from '@/presentation/share/components/file-preview-modal'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import {
  generatedDocumentFailureLabel,
  type GeneratedDocumentsState,
} from '@/presentation/features/documents/generated-documents/hooks/use-generated-documents'
import type {
  GeneratedDocumentEventDto,
  GeneratedDocumentListItemDto,
  GeneratedDocumentStatus,
} from '@/infrastructure/documents/dtos/generated-document.dto'

interface GeneratedDocumentsPanelProps {
  state: GeneratedDocumentsState
  canDownload: boolean
  canRetry: boolean
}

const statusLabels: Record<GeneratedDocumentStatus, string> = {
  PENDING: 'Pendiente',
  RENDERING: 'Generando',
  GENERATED: 'Generado',
  FAILED: 'Fallido',
  VOIDED: 'Anulado',
}

const statusClasses: Record<GeneratedDocumentStatus, string> = {
  PENDING: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  RENDERING: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950/50 dark:text-sky-200',
  GENERATED: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
  FAILED: 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200',
  VOIDED: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200',
}

const formatDateTime = (value: string | null) => value
  ? new Date(value).toLocaleString('es-HN', { dateStyle: 'short', timeStyle: 'short' })
  : '—'

const generationLabel = (value: string) => value === 'AUTOMATIC' ? 'Automática' : value === 'MANUAL' ? 'Manual' : value

const eventLabel = (event: GeneratedDocumentEventDto) => {
  switch (event.eventType) {
    case 'CREATED_PENDING': return 'Intención creada'
    case 'RENDER_STARTED': return 'Generación iniciada'
    case 'GENERATED': return 'PDF generado y almacenado'
    case 'RETRY_REQUESTED': return 'Reintento técnico solicitado'
    case 'FAILED': return 'Generación fallida'
    case 'DOWNLOADED': return 'PDF oficial consultado/descargado'
    case 'VOIDED': return 'Documento anulado'
    default: return event.eventType
  }
}

export const GeneratedDocumentsPanel = ({
  state,
  canDownload,
  canRetry,
}: GeneratedDocumentsPanelProps) => {
  const totalPages = state.totalPages

  const changeStatus = (value: 'ALL' | GeneratedDocumentStatus) => {
    state.setStatus(value)
  }

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950" aria-labelledby="generated-documents-title">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="generated-documents-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">Documentos oficiales</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Historial, PDF almacenado y recuperación técnica.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <span>Estado</span>
            <select
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              value={state.status}
              onChange={(event) => changeStatus(event.target.value as 'ALL' | GeneratedDocumentStatus)}
            >
              <option value="ALL">Todos</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <button type="button" className="btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-sm" onClick={() => void state.refresh()} disabled={state.isLoading}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Actualizar
          </button>
        </div>
      </header>

      {state.error ? <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">{state.error}</p> : null}
      {state.actionError ? <p role="status" className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200">{state.actionError}</p> : null}

      {state.items.length === 0 ? (
        state.isLoading ? (
          <p role="status" className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            Cargando historial documental…
          </p>
        ) : state.error ? null : (
          <p role="status" className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            {state.status === 'ALL'
              ? 'No hay documentos oficiales para este expediente.'
              : `No hay documentos oficiales con estado “${statusLabels[state.status]}”. Puedes actualizar el historial o elegir otro estado.`}
          </p>
        )
      ) : (
        <TableContainer mode="legacy-compact" variant="strong">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="text-slate-700 dark:text-slate-200">
                <th scope="col">Documento</th>
                <th scope="col">Versión</th>
                <th scope="col">Generación</th>
                <th scope="col">Estado</th>
                <th scope="col">Fecha</th>
                <th scope="col">Reintentos</th>
                <th scope="col" className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {state.items.map((item) => (
                <tr key={item.id} className="text-slate-800 dark:text-slate-200">
                  <td>
                    <div className="font-medium">{item.documentTypeName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.templateName} · {item.documentTypeCode}</div>
                  </td>
                  <td>v{item.templateVersionNumber}</td>
                  <td>{generationLabel(item.generationKind)}</td>
                  <td>
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClasses[item.status]}`}>
                      {statusLabels[item.status]}
                    </span>
                    {item.status === 'RENDERING' && item.isRenderingStale ? (
                      <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">Superó el timeout operativo</div>
                    ) : null}
                  </td>
                  <td>{formatDateTime(item.requestedAt)}</td>
                  <td>{item.retryCount}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button type="button" className="btn-secondary inline-flex items-center gap-1 px-2 py-1 text-[11px]" onClick={() => void state.openDetails(item)} aria-label="Ver detalle e historial" title="Ver detalle e historial">
                        <History className="h-3.5 w-3.5" aria-hidden="true" /><span>Detalle</span>
                      </button>
                      {item.status === 'GENERATED' && canDownload && item.canDownload ? (
                        <>
                          <button type="button" className="btn-secondary inline-flex items-center gap-1 px-2 py-1 text-[11px]" onClick={() => void state.viewPdf(item)} aria-label="Ver PDF oficial" title="Ver PDF oficial">
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" /><span>Ver PDF</span>
                          </button>
                          <button type="button" className="btn-secondary inline-flex items-center gap-1 px-2 py-1 text-[11px]" onClick={() => void state.downloadPdf(item.id, item.fileName)} disabled={state.downloadingId === item.id} aria-label="Descargar PDF oficial" title="Descargar PDF oficial">
                            <Download className="h-3.5 w-3.5" aria-hidden="true" /><span>Descargar</span>
                          </button>
                        </>
                      ) : null}
                      {canRetry && item.canRetry && (item.status === 'FAILED' || item.status === 'RENDERING') ? (
                        <button type="button" className="btn-secondary inline-flex items-center gap-1 px-2 py-1 text-[11px]" onClick={() => void state.retry(item)} disabled={state.retryingId === item.id} aria-label="Reintentar generación técnica" title="Reintentar generación técnica">
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /><span>{state.retryingId === item.id ? 'Reintentando…' : 'Reintentar'}</span>
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <TablePagination
            page={state.page}
            totalPages={totalPages}
            onPageChange={state.setPage}
            label={`${state.totalCount} documentos · página`}
            pageSize={state.pageSize}
            pageSizeOptions={[10, 25, 50]}
            onPageSizeChange={state.setPageSize}
            pageSizeLabel="Filas:"
          />
        </TableContainer>
      )}

      {state.selectedDocument ? (
        <DocumentHistoryDialog
          document={state.selectedDocument}
          events={state.events}
          isLoading={state.detailLoading}
          error={state.detailError}
          canRetryPermission={canRetry}
          onClose={state.closeDetails}
        />
      ) : null}

      <FilePreviewModal
        open={Boolean(state.preview)}
        fileName={state.preview?.fileName}
        fileUrl={state.preview?.url || undefined}
        contentType="application/pdf"
        isLoading={state.previewLoading}
        error={state.previewError}
        onClose={state.closePreview}
        onDownload={state.preview ? () => state.downloadPdf(state.preview!.id, state.preview!.fileName) : undefined}
        isDownloading={state.preview ? state.downloadingId === state.preview.id : false}
      />
    </section>
  )
}

const DocumentHistoryDialog = ({
  document,
  events,
  isLoading,
  error,
  canRetryPermission,
  onClose,
}: {
  document: GeneratedDocumentListItemDto
  events: GeneratedDocumentEventDto[]
  isLoading: boolean
  error: string | null
  canRetryPermission: boolean
  onClose: () => void
}) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm" role="presentation">
    <section role="dialog" aria-modal="true" aria-labelledby="generated-document-detail-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 id="generated-document-detail-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">Detalle del documento oficial</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{document.documentTypeName} · {document.templateName} · versión {document.templateVersionNumber}</p>
        </div>
        <button type="button" className="btn-secondary px-3 py-1.5 text-sm" onClick={onClose}>Cerrar</button>
      </header>

      <dl className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
        <DetailField label="Estado" value={statusLabels[document.status]} />
        <DetailField label="Tipo de fallo" value={generatedDocumentFailureLabel(document.failureType)} />
        <DetailField label="Solicitud" value={document.applicationNumber ?? '—'} />
        <DetailField label="Préstamo" value={document.loanNumber ?? '—'} />
        <DetailField label="Producto" value={document.loanProductName ?? '—'} />
        <DetailField label="Origen" value={generationLabel(document.generationKind)} />
        <DetailField label="Solicitado" value={formatDateTime(document.requestedAt)} />
        <DetailField label="Generado" value={formatDateTime(document.generatedAt)} />
        <DetailField label="Reintentos técnicos" value={String(document.retryCount)} />
        <DetailField label="Solicitado por" value={document.requestedBy ? `Usuario ${document.requestedBy}` : 'Sistema'} />
      </dl>

      {document.errorSummary ? <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">{document.errorSummary}</p> : null}
      {document.requiresNewIntent ? (
        <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Los datos utilizados por esta generación eran insuficientes. Requiere una nueva generación después de corregir la información.
        </p>
      ) : document.canRetry && canRetryPermission ? (
        <p className="mt-3 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200">Reintento técnico disponible. Se reutilizarán los datos congelados de esta generación.</p>
      ) : null}

      <div className="mt-5">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Historial de eventos</h4>
        {error ? <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
        {isLoading ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Cargando eventos…</p> : events.length === 0 ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No hay eventos registrados.</p> : (
          <ol className="mt-2 space-y-2">
            {events.map((event) => (
              <li key={event.id} className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{eventLabel(event)}</span>
                  <time className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(event.occurredAt)}</time>
                </div>
                {event.reason ? <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{event.reason}</p> : null}
                {event.failureType ? <p className="mt-1 text-xs text-red-700 dark:text-red-300">{generatedDocumentFailureLabel(event.failureType)}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  </div>
)

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className="mt-0.5 break-words font-medium text-slate-800 dark:text-slate-200">{value}</dd>
  </div>
)
