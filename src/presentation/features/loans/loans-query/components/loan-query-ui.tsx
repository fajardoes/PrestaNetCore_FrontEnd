import type { ReactNode } from 'react'

interface QueryHeroCardProps {
  eyebrow?: string
  title: string
  description: string
  badge?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}

interface QuerySectionCardProps {
  title: string
  description?: string
  aside?: ReactNode
  children: ReactNode
  className?: string
}

interface QueryMetricCardProps {
  label: string
  value: string
  hint?: string
  accent?: 'slate' | 'sky' | 'amber' | 'blue'
}

interface QueryDetailFieldProps {
  label: string
  value: ReactNode
}

const metricAccentClasses: Record<NonNullable<QueryMetricCardProps['accent']>, string> = {
  slate:
    'border-slate-200/80 bg-white/80 text-slate-900 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-100',
  sky:
    'border-sky-200 bg-sky-50/80 text-sky-950 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-50',
  amber:
    'border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-50',
  blue: 'border-blue-200 bg-blue-50/80 text-blue-950 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-50',
}

export const QueryHeroCard = ({
  eyebrow,
  title,
  description,
  badge,
  actions,
  children,
}: QueryHeroCardProps) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.14),_transparent_36%),linear-gradient(135deg,_rgba(255,255,255,1)_0%,_rgba(248,250,252,1)_55%,_rgba(226,232,240,0.72)_100%)] p-4 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_32%),linear-gradient(135deg,_rgba(2,6,23,1)_0%,_rgba(15,23,42,1)_58%,_rgba(30,41,59,0.95)_100%)] sm:p-5">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl space-y-2">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
            {eyebrow}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            {title}
          </h1>
          {badge}
        </div>
        <p className="max-w-2xl text-xs leading-5 text-slate-600 dark:text-slate-300 sm:text-sm">
          {description}
        </p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
    {children ? <div className="mt-4">{children}</div> : null}
  </section>
)

export const QuerySectionCard = ({
  title,
  description,
  aside,
  children,
  className,
}: QuerySectionCardProps) => (
  <section
    className={[
      'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        ) : null}
      </div>
      {aside}
    </div>
    <div className="mt-3">{children}</div>
  </section>
)

export const QueryMetricCard = ({
  label,
  value,
  hint,
  accent = 'slate',
}: QueryMetricCardProps) => (
  <div
    className={`rounded-xl border p-3 shadow-sm backdrop-blur-sm ${metricAccentClasses[accent]}`}
  >
    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1.5 text-lg font-semibold tracking-tight">{value}</p>
    {hint ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
  </div>
)

export const QueryDetailField = ({ label, value }: QueryDetailFieldProps) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/80">
    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{value}</div>
  </div>
)
