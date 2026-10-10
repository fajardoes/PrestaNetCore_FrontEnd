import { DatePicker } from '@/presentation/share/components/date-picker'
import SelectField, { type SelectOption } from '@/presentation/share/components/select'
import type { FormEventHandler } from 'react'
import type { AuditSearchFormValues } from '@/infrastructure/validations/audit/audit-search-form.schema'

interface AuditFiltersPanelProps {
  values: AuditSearchFormValues
  categories: SelectOption[]
  modules: SelectOption[]
  actions: SelectOption[]
  outcomes: SelectOption[]
  referenceDate: string
  isLoading: boolean
  isCatalogLoading: boolean
  canExport: boolean
  isExporting: boolean
  validationError: string | null
  onChange: (field: keyof AuditSearchFormValues, value: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onExport: () => void
}

const inputClassName =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-primary/40'

const labelClassName =
  'block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300'

export const AuditFiltersPanel = ({
  values,
  categories,
  modules,
  actions,
  outcomes,
  referenceDate,
  isLoading,
  isCatalogLoading,
  canExport,
  isExporting,
  validationError,
  onChange,
  onSubmit,
  onExport,
}: AuditFiltersPanelProps) => {
  const categoryValue = categories.find((option) => option.value === values.categoryCode) ?? null
  const actionValue = actions.find((option) => option.value === values.actionCode) ?? null
  const outcomeValue = outcomes.find((option) => option.value === values.outcomeCode) ?? null

  return (
    <form
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5"
      onSubmit={onSubmit}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <label className={labelClassName}>
          Desde
          <DatePicker
            value={values.fromDate}
            onChange={(value) => onChange('fromDate', value)}
            maxDate={values.toDate ? new Date(`${values.toDate}T00:00:00`) : undefined}
            allowFutureDates={false}
            referenceDate={referenceDate}
            ariaLabel="Fecha inicial de auditoría"
          />
        </label>
        <label className={labelClassName}>
          Hasta
          <DatePicker
            value={values.toDate}
            onChange={(value) => onChange('toDate', value)}
            minDate={values.fromDate ? new Date(`${values.fromDate}T00:00:00`) : undefined}
            allowFutureDates={false}
            referenceDate={referenceDate}
            ariaLabel="Fecha final de auditoría"
          />
        </label>
        <label className={labelClassName}>
          Categoría
          <div className="mt-1 text-left normal-case tracking-normal">
            <SelectField
              inputId="audit-category"
              instanceId="audit-category"
              value={categoryValue}
              onChange={(option) => onChange('categoryCode', option?.value ?? '')}
              options={categories}
              placeholder="Todas las categorías"
              isClearable
              isLoading={isCatalogLoading}
            />
          </div>
        </label>
        <label className={labelClassName}>
          Módulo (código)
          <input
            id="audit-module"
            className={inputClassName}
            value={values.moduleCode}
            onChange={(event) => onChange('moduleCode', event.target.value)}
            list="audit-module-codes"
            placeholder="Todos los módulos"
            maxLength={80}
          />
          <datalist id="audit-module-codes">
            {modules.map((module) => <option key={module.value} value={module.value} />)}
          </datalist>
        </label>
        <label className={labelClassName}>
          Acción
          <div className="mt-1 text-left normal-case tracking-normal">
            <SelectField
              inputId="audit-action"
              instanceId="audit-action"
              value={actionValue}
              onChange={(option) => onChange('actionCode', option?.value ?? '')}
              options={actions}
              placeholder="Todas las acciones"
              isClearable
              isLoading={isCatalogLoading}
            />
          </div>
        </label>
        <label className={labelClassName}>
          Resultado
          <div className="mt-1 text-left normal-case tracking-normal">
            <SelectField
              inputId="audit-outcome"
              instanceId="audit-outcome"
              value={outcomeValue}
              onChange={(option) => onChange('outcomeCode', option?.value ?? '')}
              options={outcomes}
              placeholder="Todos los resultados"
              isClearable
              isLoading={isCatalogLoading}
            />
          </div>
        </label>
      </div>

      <details className="mt-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <summary className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Filtros adicionales
        </summary>
        <div className="grid gap-3 border-t border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-2 xl:grid-cols-4">
          <label className={labelClassName}>
            Código de error
            <input className={inputClassName} value={values.errorCode} onChange={(event) => onChange('errorCode', event.target.value)} maxLength={120} />
          </label>
          <label className={labelClassName}>
            Usuario (ID)
            <input className={inputClassName} value={values.actorUserId} onChange={(event) => onChange('actorUserId', event.target.value)} placeholder="UUID del usuario" />
          </label>
          <label className={labelClassName}>
            Agencia (ID)
            <input className={inputClassName} value={values.agencyId} onChange={(event) => onChange('agencyId', event.target.value)} placeholder="UUID de la agencia" />
          </label>
          <label className={labelClassName}>
            Correlación
            <input className={inputClassName} value={values.correlationId} onChange={(event) => onChange('correlationId', event.target.value)} maxLength={128} />
          </label>
          <label className={labelClassName}>
            Método HTTP
            <input className={inputClassName} value={values.requestMethod} onChange={(event) => onChange('requestMethod', event.target.value)} placeholder="GET, POST…" maxLength={12} />
          </label>
          <label className={labelClassName}>
            Estado HTTP
            <input className={inputClassName} type="number" min={100} max={599} value={values.httpStatusCode} onChange={(event) => onChange('httpStatusCode', event.target.value)} placeholder="Ej. 500" />
          </label>
          <label className={labelClassName}>
            Ruta de API
            <input className={inputClassName} value={values.routeTemplate} onChange={(event) => onChange('routeTemplate', event.target.value)} placeholder="/api/..." maxLength={512} />
          </label>
          <label className={labelClassName}>
            Tipo de entidad
            <input className={inputClassName} value={values.subjectType} onChange={(event) => onChange('subjectType', event.target.value)} maxLength={100} />
          </label>
          <label className={`${labelClassName} sm:col-span-2`}>
            Identificador de entidad
            <input className={inputClassName} value={values.subjectId} onChange={(event) => onChange('subjectId', event.target.value)} maxLength={128} />
          </label>
        </div>
      </details>

      {validationError ? (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
          {validationError}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {canExport ? (
          <button
            type="button"
            disabled={isExporting || isLoading || isCatalogLoading}
            className="btn-secondary btn-list-action disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onExport}
          >
            {isExporting ? 'Generando CSV…' : 'Exportar CSV'}
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isLoading || isCatalogLoading}
          className="btn-primary btn-list-action disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Consultando…' : 'Buscar eventos'}
        </button>
      </div>
    </form>
  )
}
