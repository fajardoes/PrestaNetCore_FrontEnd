interface HomeHeaderProps {
  userName: string
  agencyLabel: string
  businessDate?: string | null
  isDayOpen?: boolean
}

const formatBusinessDate = (value?: string | null) => {
  if (!value) return 'Consultando fecha operativa...'

  const parsedDate = new Date(`${value}T00:00:00`)
  if (Number.isNaN(parsedDate.getTime())) return value

  return new Intl.DateTimeFormat('es-HN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

export const HomeHeader = ({
  userName,
  agencyLabel,
  businessDate,
  isDayOpen,
}: HomeHeaderProps) => (
  <section className="flex min-h-[96px] flex-col justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:px-5">
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
      Inicio
    </p>
    <h1 className="mt-0.5 text-xl font-semibold text-slate-900 dark:text-slate-50">
      {getGreeting()}, {userName}
    </h1>
    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
      {agencyLabel} <span aria-hidden="true">·</span> Fecha operativa:{' '}
      {formatBusinessDate(businessDate)}
      {typeof isDayOpen === 'boolean' ? (
        <span
          className={
            isDayOpen
              ? 'ml-2 text-sky-700 dark:text-sky-300'
              : 'ml-2 text-red-700 dark:text-red-300'
          }
        >
          · {isDayOpen ? 'Abierta' : 'Cerrada'}
        </span>
      ) : null}
    </p>
  </section>
)

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}
