import type { AuditSearchFilters } from '@/infrastructure/interfaces/audit/audit-entry'
import type { AuditSearchFormValues } from '@/infrastructure/validations/audit/audit-search-form.schema'

const HONDURAS_UTC_OFFSET = '-06:00'

const getHondurasToday = () => {
  const values = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Tegucigalpa',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (type: string) => values.find((part) => part.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

const addCalendarDays = (value: string, days: number) => {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return `${date.getUTCFullYear()}-${`${date.getUTCMonth() + 1}`.padStart(2, '0')}-${`${date.getUTCDate()}`.padStart(2, '0')}`
}

const toUtcDateTime = (date: string, endOfDay: boolean) => {
  const time = endOfDay ? '23:59:59.999' : '00:00:00.000'
  return new Date(`${date}T${time}${HONDURAS_UTC_OFFSET}`).toISOString()
}

export const createDefaultAuditSearchForm = (): AuditSearchFormValues => {
  const today = getHondurasToday()
  return {
    fromDate: addCalendarDays(today, -29),
    toDate: today,
    categoryCode: '',
    moduleCode: '',
    actionCode: '',
    outcomeCode: '',
    errorCode: '',
    actorUserId: '',
    agencyId: '',
    correlationId: '',
    requestMethod: '',
    httpStatusCode: '',
    routeTemplate: '',
    subjectType: '',
    subjectId: '',
  }
}

export const toAuditSearchFilters = (
  filters: AuditSearchFormValues,
  pageNumber: number,
  pageSize: number,
): AuditSearchFilters => ({
  categoryCodes: filters.categoryCode ? [filters.categoryCode] : undefined,
  moduleCode: filters.moduleCode.trim().toLowerCase() || undefined,
  actionCode: filters.actionCode || undefined,
  outcomeCode: filters.outcomeCode || undefined,
  errorCode: filters.errorCode.trim() || undefined,
  actorUserId: filters.actorUserId.trim() || undefined,
  agencyId: filters.agencyId.trim() || undefined,
  correlationId: filters.correlationId.trim() || undefined,
  requestMethod: filters.requestMethod.trim().toUpperCase() || undefined,
  routeTemplate: filters.routeTemplate.trim() || undefined,
  httpStatusCode: filters.httpStatusCode ? Number(filters.httpStatusCode) : undefined,
  subjectType: filters.subjectType.trim() || undefined,
  subjectId: filters.subjectId.trim() || undefined,
  fromUtc: toUtcDateTime(filters.fromDate, false),
  toUtc: toUtcDateTime(filters.toDate, true),
  pageNumber,
  pageSize,
})
