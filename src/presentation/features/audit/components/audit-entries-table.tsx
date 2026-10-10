import { Fragment, useState } from 'react'
import type {
  AuditActionDescriptor,
  AuditCatalog,
  AuditEntry,
} from '@/infrastructure/interfaces/audit/audit-entry'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'

interface AuditEntriesTableProps {
  items: AuditEntry[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  catalog: AuditCatalog | null
  isLoading: boolean
  error: string | null
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const dateFormatter = new Intl.DateTimeFormat('es-HN', {
  dateStyle: 'short',
  timeStyle: 'medium',
  timeZone: 'America/Tegucigalpa',
})

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

const formatJsonValue = (value: string | null) => {
  if (value === null) return '—'
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch {
    return value
  }
}

const ACTOR_LABELS: Record<string, string> = {
  user: 'Usuario',
  anonymous: 'Sin autenticar',
  system: 'Sistema',
}

const OUTCOME_STYLES: Record<string, string> = {
  succeeded: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
  rejected: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
  denied: 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-200',
}

export const AuditEntriesTable = ({
  items,
  totalCount,
  page,
  pageSize,
  totalPages,
  catalog,
  isLoading,
  error,
  onPageChange,
  onPageSizeChange,
}: AuditEntriesTableProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const categoryNames = new Map<string, string>(
    catalog?.categories.map((category) => [category.code, category.name] as const) ?? [],
  )
  const actionDescriptors = new Map<string, AuditActionDescriptor>(
    catalog?.actions.map((action) => [action.code, action] as const) ?? [],
  )
  const outcomeNames = new Map<string, string>(
    catalog?.outcomes.map((outcome) => [outcome.code, outcome.name] as const) ?? [],
  )

  return (
    <section className="space-y-3" aria-busy={isLoading}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400">
        <p>{totalCount.toLocaleString('es-HN')} eventos encontrados</p>
        {isLoading ? <p role="status">Actualizando consulta…</p> : null}
      </div>

      {error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <TableContainer mode="legacy-compact" variant="strong">
        <div className="overflow-x-auto">
          <table className="min-w-[1050px] w-full text-left">
            <thead>
              <tr className="text-slate-700 dark:text-slate-200">
                <th scope="col">Fecha y hora</th>
                <th scope="col">Categoría</th>
                <th scope="col">Acción</th>
                <th scope="col">Resultado</th>
                <th scope="col">Actor</th>
                <th scope="col">Entidad</th>
                <th scope="col">Origen</th>
                <th scope="col"><span className="sr-only">Detalle</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {items.map((entry) => {
                const expanded = expandedIds.has(entry.id)
                const action = actionDescriptors.get(entry.actionCode)
                const outcomeName = outcomeNames.get(entry.outcomeCode) ?? entry.outcomeCode
                return (
                  <Fragment key={entry.id}>
                    <tr className="align-top text-slate-700 dark:text-slate-200">
                      <td className="whitespace-nowrap">{formatDate(entry.occurredAt)}</td>
                      <td>
                        <div className="font-medium">{categoryNames.get(entry.categoryCode) ?? entry.categoryCode}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{entry.moduleCode}</div>
                      </td>
                      <td className="max-w-72">
                        <div className="font-medium">{action?.name ?? entry.actionCode}</div>
                        <div className="break-all text-[10px] text-slate-500 dark:text-slate-400">{entry.actionCode}</div>
                      </td>
                      <td>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${OUTCOME_STYLES[entry.outcomeCode] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
                          {outcomeName}
                        </span>
                        {entry.errorCode ? <div className="mt-1 break-all text-[10px] text-red-700 dark:text-red-300">{entry.errorCode}</div> : null}
                      </td>
                      <td className="max-w-48 break-all">
                        <div>{ACTOR_LABELS[entry.actorType] ?? entry.actorType}</div>
                        {entry.actorUserId ? (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {entry.actorEmail ?? entry.actorUserId}
                          </span>
                        ) : null}
                      </td>
                      <td className="max-w-48 break-all">
                        {entry.subjectType || entry.subjectId ? (
                          <>
                            <div>{entry.subjectType ?? 'Entidad'}</div>
                            <code className="text-[10px] text-slate-500 dark:text-slate-400">{entry.subjectId ?? '—'}</code>
                          </>
                        ) : '—'}
                      </td>
                      <td>
                        <div>{entry.requestMethod ?? entry.sourceCode}</div>
                        {entry.httpStatusCode ? <div className="text-[10px] text-slate-500 dark:text-slate-400">HTTP {entry.httpStatusCode}</div> : null}
                      </td>
                      <td className="whitespace-nowrap">
                        <button
                          type="button"
                          className="btn-table-action"
                          aria-expanded={expanded}
                          aria-controls={`audit-detail-${entry.id}`}
                          onClick={() => toggleExpanded(entry.id)}
                        >
                          {expanded ? 'Ocultar' : 'Ver detalle'}
                        </button>
                      </td>
                    </tr>
                    <tr id={`audit-detail-${entry.id}`} hidden={!expanded}>
                      <td colSpan={8} className="bg-slate-50 p-4 dark:bg-slate-900/60">
                        {expanded ? <AuditEntryDetails entry={entry} /> : null}
                      </td>
                    </tr>
                  </Fragment>
                )
              })}
              {!items.length ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    {isLoading
                      ? 'Cargando eventos…'
                      : error
                        ? 'No se pudo completar la consulta.'
                        : 'No hay eventos para los filtros seleccionados.'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <TablePagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          pageSizeOptions={[25, 50, 100]}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          disabled={isLoading}
          label="Página"
        />
      </TableContainer>
    </section>
  )
}

const AuditEntryDetails = ({ entry }: { entry: AuditEntry }) => (
  <div className="grid gap-4 xl:grid-cols-2">
    <div className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Solicitud y contexto</h3>
        <dl className="mt-2 grid gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
          <DetailField label="Ruta" value={entry.routeTemplate} />
          <DetailField label="Correlación" value={entry.correlationId} mono />
          <DetailField label="Agencia" value={entry.agencyName} />
          <DetailField label="Origen" value={entry.sourceCode} />
          <DetailField label="Versión del payload" value={String(entry.payloadVersion)} />
          <DetailField label="Identificador del evento" value={entry.id} mono />
        </dl>
      </div>
      {entry.detailsJson ? (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Datos del evento</h3>
          <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-white p-3 text-xs text-slate-700 dark:bg-slate-950 dark:text-slate-200"><code>{formatJsonValue(entry.detailsJson)}</code></pre>
        </div>
      ) : null}
    </div>
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Cambios registrados</h3>
      {entry.changes.length ? (
        <div className="mt-2 space-y-2">
          {entry.changes.map((change) => (
            <div key={`${change.sequence}-${change.propertyPath}`} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{change.propertyPath}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <JsonValue label="Antes" value={change.oldValueJson} />
                <JsonValue label="Después" value={change.newValueJson} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Este evento no incluye cambios de campos.</p>
      )}
    </div>
  </div>
)

const DetailField = ({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) => (
  <div className="min-w-0">
    <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
    <dd className={`mt-0.5 break-all text-slate-800 dark:text-slate-100 ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</dd>
  </div>
)

const JsonValue = ({ label, value }: { label: string; value: string | null }) => (
  <div className="min-w-0">
    <p className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</p>
    <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded bg-slate-50 p-2 text-[11px] text-slate-700 dark:bg-slate-900 dark:text-slate-200"><code>{formatJsonValue(value)}</code></pre>
  </div>
)
