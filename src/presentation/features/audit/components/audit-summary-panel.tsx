import type {
  AuditCatalog,
  AuditEntrySummary,
} from '@/infrastructure/interfaces/audit/audit-entry'

interface AuditSummaryPanelProps {
  summary: AuditEntrySummary | null
  catalog: AuditCatalog | null
  isLoading: boolean
  error: string | null
}

const labelForCode = (
  kind: 'category' | 'action' | 'outcome',
  code: string,
  catalog: AuditCatalog | null,
) => {
  if (kind === 'category') {
    return catalog?.categories.find((category) => category.code === code)?.name ?? code
  }
  if (kind === 'outcome') {
    return catalog?.outcomes.find((outcome) => outcome.code === code)?.name ?? code
  }
  return catalog?.actions.find((action) => action.code === code)?.name ?? code
}

const SummaryGroup = ({
  title,
  items,
  kind,
  catalog,
}: {
  title: string
  items: AuditEntrySummary['categories']
  kind: 'category' | 'action' | 'outcome' | 'error'
  catalog: AuditCatalog | null
}) => (
  <section>
    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {title}
    </h3>
    {items.length ? (
      <ul className="mt-2 space-y-1.5">
        {items.slice(0, 5).map((item) => (
          <li key={item.code} className="flex items-start justify-between gap-3 text-sm">
            <span className="min-w-0 break-words text-slate-700 dark:text-slate-200">
              {kind === 'error' ? item.code : labelForCode(kind, item.code, catalog)}
            </span>
            <span className="shrink-0 tabular-nums font-semibold text-slate-900 dark:text-slate-100">
              {item.count.toLocaleString('es-HN')}
            </span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sin eventos</p>
    )}
  </section>
)

export const AuditSummaryPanel = ({ summary, catalog, isLoading, error }: AuditSummaryPanelProps) => (
  <section
    aria-labelledby="audit-summary-title"
    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5"
    aria-busy={isLoading}
  >
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 id="audit-summary-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Resumen de los filtros
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Conteos del conjunto filtrado, sin limitarse a la página visible. Cada grupo muestra hasta cinco elementos.
        </p>
      </div>
      <p className="text-right text-sm text-slate-600 dark:text-slate-300">
        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Total de eventos
        </span>
        <span className="tabular-nums text-xl font-semibold text-slate-900 dark:text-slate-100">
          {isLoading && !summary ? '…' : (summary?.totalCount ?? 0).toLocaleString('es-HN')}
        </span>
      </p>
    </div>

    {error ? (
      <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>
    ) : summary ? (
      <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryGroup title="Categorías" items={summary.categories} kind="category" catalog={catalog} />
        <SummaryGroup title="Acciones" items={summary.actions} kind="action" catalog={catalog} />
        <SummaryGroup title="Resultados" items={summary.outcomes} kind="outcome" catalog={catalog} />
        <SummaryGroup title="Códigos de error" items={summary.errors} kind="error" catalog={catalog} />
      </div>
    ) : isLoading ? (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Cargando resumen…</p>
    ) : null}
  </section>
)
