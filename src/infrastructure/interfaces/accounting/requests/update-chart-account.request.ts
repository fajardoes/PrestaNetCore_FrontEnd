import type { NormalBalance } from '@/infrastructure/interfaces/accounting/chart-account'

export interface UpdateChartAccountRequest {
  code: string
  name: string
  slug: string
  level?: number
  parentId?: string | null
  isGroup: boolean
  normalBalance: NormalBalance
  isActive: boolean
}
