export interface NavigationState {
  requiresAuth?: boolean
  from?: string
  [key: string]: unknown
}
