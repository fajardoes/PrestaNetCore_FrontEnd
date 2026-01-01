export type NormalBalance = 'debit' | 'credit'

export interface ChartAccountListItem {
  id: string
  code: string
  name: string
  slug: string
  level?: number
  parentId?: string | null
  isGroup: boolean
  normalBalance: NormalBalance
  isActive: boolean
}

export interface ChartAccountDetail extends ChartAccountListItem {
  description?: string | null
}
