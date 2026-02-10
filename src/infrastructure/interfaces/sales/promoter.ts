export interface CreatePromoterRequest {
  clientId: string
  agencyId: string
  code?: string | null
  notes?: string | null
}

export interface UpdatePromoterRequest {
  agencyId: string
  code?: string | null
  isActive: boolean
  notes?: string | null
}

export interface PromotersSearchRequest {
  active?: boolean
  search?: string
  skip?: number
  take?: number
}

export interface PromoterResponse {
  id: string
  clientId: string
  agencyId: string
  agencyName?: string | null
  code?: string | null
  isActive: boolean
  notes?: string | null
  createdAt: string
  clientFullName?: string | null
  clientIdentityNo?: string | null
  clientEmail?: string | null
}
