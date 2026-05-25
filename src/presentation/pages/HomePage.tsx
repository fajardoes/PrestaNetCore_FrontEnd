import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { MenuItemTreeDto } from '@/infrastructure/interfaces/security/menu'
import { useMyMenus } from '@/presentation/features/security/menus/hooks/use-my-menus'
import { MenuIcon } from '@/presentation/share/helpers/menu-icon'

const formatToday = () =>
  new Intl.DateTimeFormat('es-HN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos dias'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

const flattenRouteItems = (items: MenuItemTreeDto[]): MenuItemTreeDto[] => {
  return items.flatMap((item) => {
    const current = item.route ? [item] : []
    return [...current, ...flattenRouteItems(item.children)]
  })
}

const sortMenuTree = (items: MenuItemTreeDto[]): MenuItemTreeDto[] => {
  return items
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      ...item,
      children: sortMenuTree(item.children ?? []),
    }))
}

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth()
  const { menus, isLoading, error } = useMyMenus({ enabled: isAuthenticated })

  const sortedMenus = sortMenuTree(menus)
  const quickAccess = flattenRouteItems(sortedMenus).slice(0, 6)
  const roleLabel = user?.roles.length ? user.roles.join(', ') : 'Sin roles asignados'
  const agencyLabel = user?.agencyName
    ? `${user.agencyCode ? `${user.agencyCode} · ` : ''}${user.agencyName}`
    : 'Sin agencia asignada'

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Inicio
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {getGreeting()}, {user?.fullName ?? 'usuario'}.
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Bienvenido a PrestaNet Core Financiero. Desde aqui puedes revisar tu
              contexto de sesion y acceder rapidamente a los modulos habilitados.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Fecha actual
            </p>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-50">
              {formatToday()}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Usuario activo"
          value={user?.fullName ?? 'No disponible'}
          detail={user?.email ?? 'Sin correo'}
        />
        <SummaryCard
          label="Agencia"
          value={agencyLabel}
          detail={user?.agencyId ? `Codigo interno: ${user.agencyCode}` : 'Configuracion pendiente'}
        />
        <SummaryCard
          label="Roles"
          value={String(user?.roles.length ?? 0)}
          detail={roleLabel}
        />
        <SummaryCard
          label="Accesos habilitados"
          value={String(quickAccess.length)}
          detail={`${menus.length} modulos visibles en el menu`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Accesos rapidos
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Rutas disponibles segun los menus asignados a tu usuario.
            </p>
          </div>

          {isLoading ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
                />
              ))}
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          {!isLoading && !error && quickAccess.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {quickAccess.map((item) => (
                <Link
                  key={item.id}
                  to={item.route ?? '/'}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                      <MenuIcon iconName={item.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {item.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                        {item.route}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}

          {!isLoading && !error && quickAccess.length === 0 ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              No hay accesos rapidos disponibles para este usuario.
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Resumen de sesion
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Informacion base del usuario autenticado.
              </p>
            </div>
            <StateBadge
              label={user ? 'Sesion activa' : 'Sin sesion'}
              tone={user ? 'sky' : 'amber'}
            />
          </div>

          <div className="mt-4 grid gap-3">
            <InfoRow label="Nombre" value={user?.fullName ?? 'No disponible'} />
            <InfoRow label="Correo" value={user?.email ?? 'No disponible'} />
            <InfoRow label="Agencia" value={agencyLabel} />
            <InfoRow label="Roles" value={roleLabel} />
            <InfoRow
              label="Modulos visibles"
              value={menus.length > 0 ? `${menus.length} modulos habilitados` : 'Sin modulos asignados'}
            />
          </div>
        </article>
      </section>
    </div>
  )
}

const SummaryCard = ({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
      {value}
    </p>
    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{detail}</p>
  </article>
)

const InfoRow = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-50">
      {value}
    </p>
  </div>
)

const StateBadge = ({
  label,
  tone,
}: {
  label: string
  tone: 'sky' | 'amber'
}) => {
  const toneClasses =
    tone === 'sky'
      ? 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200'
      : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200'

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses}`}
    >
      {label}
    </span>
  )
}
