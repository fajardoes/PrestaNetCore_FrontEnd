import { useCallback, useEffect, useMemo, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import type { AuditSearchFormValues } from '@/infrastructure/validations/audit/audit-search-form.schema'
import {
  createDefaultAuditSearchForm,
  toAuditSearchFilters,
} from '@/core/helpers/audit/audit-report-filters'
import { auditSearchFormSchema } from '@/infrastructure/validations/audit/audit-search-form.schema'
import { AuditEntriesTable } from '@/presentation/features/audit/components/audit-entries-table'
import { AuditFiltersPanel } from '@/presentation/features/audit/components/audit-filters-panel'
import { useAuditReport } from '@/presentation/features/audit/hooks/use-audit-report'

export const AuditEntriesPage = () => {
  const report = useAuditReport()
  const [initialFilters] = useState(createDefaultAuditSearchForm)
  const form = useForm<AuditSearchFormValues>({
    resolver: yupResolver(auditSearchFormSchema),
    defaultValues: initialFilters,
  })
  const filters = form.watch()
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const validationError = Object.values(form.formState.errors)
    .map((error) => error?.message)
    .find((message): message is string => typeof message === 'string') ?? null

  const runSearch = useCallback(
    async (nextFilters: AuditSearchFormValues, nextPage: number, nextPageSize: number) => {
      setAppliedFilters(nextFilters)
      setPage(nextPage)
      setPageSize(nextPageSize)
      await report.loadEntries(toAuditSearchFilters(nextFilters, nextPage, nextPageSize))
    },
    [report.loadEntries],
  )

  useEffect(() => {
    void report.loadEntries(toAuditSearchFilters(initialFilters, 1, 50))
  }, [initialFilters, report.loadEntries])

  const categories = useMemo(
    () => report.catalog?.categories.map((category) => ({ value: category.code, label: category.name })) ?? [],
    [report.catalog],
  )
  const allModules = useMemo(
    () => Array.from(new Set(report.catalog?.actions
      .filter((action) => !filters.categoryCode || action.categoryCode === filters.categoryCode)
      .flatMap((action) => action.moduleCode ? [action.moduleCode] : []) ?? []))
      .sort((left, right) => left.localeCompare(right))
      .map((moduleCode) => ({ value: moduleCode, label: moduleCode })),
    [filters.categoryCode, report.catalog],
  )
  const actions = useMemo(
    () => report.catalog?.actions
      .filter((action) => !filters.categoryCode || action.categoryCode === filters.categoryCode)
      .filter((action) => !filters.moduleCode.trim() || !action.moduleCode || action.moduleCode === filters.moduleCode.trim().toLowerCase())
      .map((action) => ({ value: action.code, label: action.name })) ?? [],
    [filters.categoryCode, filters.moduleCode, report.catalog],
  )
  const outcomes = useMemo(
    () => report.catalog?.outcomes.map((outcome) => ({ value: outcome.code, label: outcome.name })) ?? [],
    [report.catalog],
  )

  const handleFilterChange = (field: keyof AuditSearchFormValues, value: string) => {
    form.setValue(field, value, { shouldDirty: true, shouldValidate: form.formState.isSubmitted })
    if (field === 'categoryCode') {
      form.setValue('moduleCode', '', { shouldDirty: true })
      form.setValue('actionCode', '', { shouldDirty: true })
    }
    if (field === 'moduleCode') {
      form.setValue('actionCode', '', { shouldDirty: true })
    }
  }

  const totalCount = report.entries?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Auditoría</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Consulta acciones, resultados técnicos y cambios registrados. Las fechas se interpretan en hora de Honduras.
        </p>
      </header>

      {report.catalogError ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          <span>{report.catalogError}</span>
          <button type="button" className="btn-secondary btn-list-action" onClick={() => void report.loadCatalog()}>
            Reintentar catálogo
          </button>
        </div>
      ) : null}

      <AuditFiltersPanel
        values={filters}
        categories={categories}
        modules={allModules}
        actions={actions}
        outcomes={outcomes}
        referenceDate={initialFilters.toDate}
        isLoading={report.isLoading}
        isCatalogLoading={report.isCatalogLoading}
        validationError={validationError}
        onChange={handleFilterChange}
        onSubmit={form.handleSubmit((values) => runSearch(values, 1, pageSize))}
      />

      <AuditEntriesTable
        items={report.entries?.items ?? []}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        catalog={report.catalog}
        isLoading={report.isLoading}
        error={report.error}
        onPageChange={(nextPage) => void runSearch(appliedFilters, nextPage, pageSize)}
        onPageSizeChange={(nextSize) => void runSearch(appliedFilters, 1, nextSize)}
      />
    </div>
  )
}
