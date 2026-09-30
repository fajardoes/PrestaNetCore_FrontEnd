import { useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useBusinessDate } from '@/presentation/features/system-business-date/hooks/use-business-date'
import { useMyMenus } from '@/presentation/features/security/menus/hooks/use-my-menus'
import { useRecentNavigation } from '@/presentation/features/navigation/recent/hooks/use-recent-navigation'
import { HomeHeader } from '@/presentation/features/home/components/home-header'
import { HomeMetrics } from '@/presentation/features/home/components/home-metrics'
import { QuickAccessSection } from '@/presentation/features/home/components/quick-access-section'
import { RecentNavigationSection } from '@/presentation/features/home/components/recent-navigation-section'
import { flattenRouteItems } from '@/presentation/features/home/helpers/home-menu'
import { sortMenuTree } from '@/presentation/share/helpers/menu-tree'

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth()
  const { menus, isLoading, error } = useMyMenus({ enabled: isAuthenticated })
  const { state: businessDate } = useBusinessDate()
  const { recentItems, registerVisit } = useRecentNavigation()

  const sortedMenus = useMemo(() => sortMenuTree(menus), [menus])
  const routeMenus = useMemo(() => flattenRouteItems(sortedMenus), [sortedMenus])
  const quickAccess = routeMenus.slice(0, 6)
  const roleLabel = user?.roles.length ? user.roles.join(', ') : 'Sin roles asignados'
  const agencyLabel = user?.agencyName
    ? `${user.agencyCode ? `${user.agencyCode} · ` : ''}${user.agencyName}`
    : 'Sin agencia asignada'

  return (
    <div className="space-y-4">
      <HomeHeader
        userName={user?.fullName ?? 'usuario'}
        agencyLabel={agencyLabel}
        businessDate={businessDate?.businessDate}
        isDayOpen={businessDate?.isDayOpen}
      />

      <HomeMetrics
        agencyLabel={agencyLabel}
        roleCount={user?.roles.length ?? 0}
        roleLabel={roleLabel}
        accessCount={routeMenus.length}
        moduleCount={sortedMenus.length}
      />

      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
        <QuickAccessSection items={quickAccess} isLoading={isLoading} error={error} />
        <RecentNavigationSection
          items={recentItems}
          onSelect={(item) => registerVisit(item.path)}
        />
      </section>
    </div>
  )
}
