import type { ClientCatalogItem } from '@/infrastructure/interfaces/clients/catalog'

const normalize = (value: string) => value.trim().toLowerCase()

export const mapGeneroToEnum = (value?: string | number | null): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  const normalized = normalize(value)

  if (normalized === '1' || normalized === 'm' || normalized === 'masculino' || normalized === 'hombre') {
    return 1
  }
  if (normalized === '2' || normalized === 'f' || normalized === 'femenino' || normalized === 'mujer') {
    return 2
  }
  if (normalized === '3' || normalized === 'o' || normalized === 'otro' || normalized === 'otro-genero') {
    return 3
  }
  return 0
}

export const mapGeneroEnumToOption = (value?: string | number | null): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return value.toString()
  const parsed = Number.parseInt(value, 10)
  if (Number.isFinite(parsed)) return parsed.toString()
  return mapGeneroToEnum(value).toString()
}

export const mapGeneroCatalogToEnum = (item: ClientCatalogItem): number => {
  const source = item.slug || item.nombre || ''
  return mapGeneroToEnum(source)
}
