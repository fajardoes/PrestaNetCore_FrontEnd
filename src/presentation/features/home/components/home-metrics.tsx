interface HomeMetricsProps {
  agencyLabel: string
  roleCount: number
  roleLabel: string
  accessCount: number
  moduleCount: number
}

interface MetricProps {
  label: string
  value: string
  detail: string
}

export const HomeMetrics = ({
  agencyLabel,
  roleCount,
  roleLabel,
  accessCount,
  moduleCount,
}: HomeMetricsProps) => (
  <section aria-label="Indicadores de sesión" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <Metric label="Agencia" value={agencyLabel} detail="Contexto operativo" />
    <Metric
      label="Roles"
      value={`${roleCount} ${roleCount === 1 ? 'rol' : 'roles'}`}
      detail={roleLabel}
    />
    <Metric
      label="Accesos habilitados"
      value={String(accessCount)}
      detail="Rutas disponibles"
    />
    <Metric
      label="Módulos visibles"
      value={String(moduleCount)}
      detail="Secciones del menú"
    />
  </section>
)

const Metric = ({ label, value, detail }: MetricProps) => (
  <article className="flex h-[86px] min-w-0 flex-col justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
      {value}
    </p>
    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{detail}</p>
  </article>
)
