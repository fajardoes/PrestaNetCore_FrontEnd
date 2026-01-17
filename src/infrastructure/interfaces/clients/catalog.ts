export interface ClientCatalogItem {
  id: string
  parentId?: string | null
  parentSlug?: string | null
  slug: string
  nombre: string
  descripcion?: string | null
  activo: boolean
}

export interface EconomicActivityCatalog {
  id: string
  sectorId: string
  nombre: string
  descripcion?: string | null
  activo: boolean
  sectorNombre?: string | null
}
