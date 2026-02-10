export interface PagedResultDto<T> {
  items: T[]
  totalCount: number
  skip: number
  take: number
}
