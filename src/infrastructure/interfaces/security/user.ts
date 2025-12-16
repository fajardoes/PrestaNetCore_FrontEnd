export interface SecurityUser {
  id: string
  email: string
  emailConfirmed: boolean
  phoneNumber: string | null
  twoFactorEnabled: boolean
  lockoutEnabled: boolean
  lockoutEnd: string | null
  isDeleted: boolean
  roles: string[]
  mustChangePassword?: boolean
  agencyId?: string | null
  agencyName?: string | null
  agencyCode?: string | null
}
