export interface RecentMenuItem {
  id: string
  label: string
  path: string
  icon: string | null
  parentLabel: string | null
  visitedAt: number
}
