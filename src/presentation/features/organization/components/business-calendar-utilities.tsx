import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAgencies } from '@/presentation/features/catalog/hooks/use-agencies'
import { useLoanCatalogsCache } from '@/presentation/features/loans/catalogs/hooks/use-loan-catalogs-cache'
import {
  adjustDateSchema,
  businessDayCheckSchema,
  type AdjustDateFormValues,
  type BusinessDayCheckFormValues,
} from '@/infrastructure/validations/organization/business-calendar.schema'
import type { BusinessDayAdjustmentRule } from '@/infrastructure/interfaces/organization/holidays/business-day-adjustment-rule'

interface BusinessCalendarUtilitiesProps {
  isChecking: boolean
  checkError: string | null
  checkResult: {
    date: string
    isBusinessDay: boolean
    reason: string
    holidayName?: string | null
  } | null
  isAdjusting: boolean
  adjustError: string | null
  adjustResult: {
    originalDate: string
    adjustedDate: string
    rule: BusinessDayAdjustmentRule
    shiftDays: number
  } | null
  onCheck: (values: BusinessDayCheckFormValues) => Promise<void>
  onAdjust: (values: AdjustDateFormValues) => Promise<void>
}

const RULE_OPTIONS: { value: BusinessDayAdjustmentRule; label: string }[] = [
  { value: 1, label: 'Siguiente día hábil' },
  { value: 2, label: 'Día hábil anterior' },
]

const formatRule = (rule: BusinessDayAdjustmentRule) =>
  rule === 1 ? 'Siguiente día hábil' : 'Día hábil anterior'

export const BusinessCalendarUtilities = ({
  isChecking,
  checkError,
  checkResult,
  isAdjusting,
  adjustError,
  adjustResult,
  onCheck,
  onAdjust,
}: BusinessCalendarUtilitiesProps) => {
  const { agencies, isLoading: agenciesLoading } = useAgencies()
  const catalogs = useLoanCatalogsCache()
  const portfolioTypes = catalogs.portfolioTypes

  const sortedAgencies = useMemo(
    () => [...agencies].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [agencies],
  )
  const sortedPortfolioTypes = useMemo(
    () => [...portfolioTypes].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [portfolioTypes],
  )

  const {
    register: registerCheck,
    handleSubmit: handleCheckSubmit,
    formState: { errors: checkErrors },
  } = useForm<BusinessDayCheckFormValues>({
    resolver: yupResolver(businessDayCheckSchema),
    defaultValues: {
      date: '',
      agencyId: '',
      portfolioTypeId: '',
    },
  })

  const {
    register: registerAdjust,
    handleSubmit: handleAdjustSubmit,
    formState: { errors: adjustErrors },
  } = useForm<AdjustDateFormValues>({
    resolver: yupResolver(adjustDateSchema),
    defaultValues: {
      date: '',
      rule: 1,
      agencyId: '',
      portfolioTypeId: '',
    },
  })

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Validar día hábil
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Consulta si una fecha es hábil considerando feriados y políticas por agencia.
        </p>

        <form
          className="mt-4 space-y-3"
          onSubmit={handleCheckSubmit(async (values) => {
            await onCheck(values)
          })}
          noValidate
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Fecha
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...registerCheck('date')}
              disabled={isChecking}
            />
            {checkErrors.date ? (
              <p className="text-xs text-red-500">{checkErrors.date.message}</p>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Agencia (opcional)
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...registerCheck('agencyId')}
                disabled={isChecking || agenciesLoading}
              >
                <option value="">Todas</option>
                {sortedAgencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Tipo de portafolio (opcional)
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...registerCheck('portfolioTypeId')}
                disabled={isChecking || catalogs.isLoading}
              >
                <option value="">Todos</option>
                {sortedPortfolioTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {checkError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {checkError}
            </div>
          ) : null}

          <button
            type="submit"
            className="btn-primary px-5 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isChecking}
          >
            {isChecking ? 'Validando...' : 'Validar'}
          </button>
        </form>

        {checkResult ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Resultado
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-50">
              {checkResult.isBusinessDay ? 'Día hábil' : 'No hábil'}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Motivo: {checkResult.reason}
            </p>
            {checkResult.holidayName ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Feriado: {checkResult.holidayName}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Ajustar fecha
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Calcula la fecha hábil más cercana para usarla en cálculos (por ejemplo, vencimientos o
          mora). No cambia la fecha del sistema ni modifica pagos; solo muestra la fecha ajustada.
        </p>

        <form
          className="mt-4 space-y-3"
          onSubmit={handleAdjustSubmit(async (values) => {
            await onAdjust(values)
          })}
          noValidate
        >
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Fecha
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...registerAdjust('date')}
              disabled={isAdjusting}
            />
            {adjustErrors.date ? (
              <p className="text-xs text-red-500">{adjustErrors.date.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Regla
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...registerAdjust('rule', { valueAsNumber: true })}
              disabled={isAdjusting}
            >
              {RULE_OPTIONS.map((rule) => (
                <option key={rule.value} value={rule.value}>
                  {rule.label}
                </option>
              ))}
            </select>
            {adjustErrors.rule ? (
              <p className="text-xs text-red-500">{adjustErrors.rule.message}</p>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Agencia (opcional)
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...registerAdjust('agencyId')}
                disabled={isAdjusting || agenciesLoading}
              >
                <option value="">Todas</option>
                {sortedAgencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Tipo de portafolio (opcional)
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                {...registerAdjust('portfolioTypeId')}
                disabled={isAdjusting || catalogs.isLoading}
              >
                <option value="">Todos</option>
                {sortedPortfolioTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {adjustError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {adjustError}
            </div>
          ) : null}

          <button
            type="submit"
            className="btn-primary px-5 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isAdjusting}
          >
            {isAdjusting ? 'Ajustando...' : 'Ajustar fecha'}
          </button>
        </form>

        {adjustResult ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Resultado
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-50">
              {adjustResult.adjustedDate}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Regla: {formatRule(adjustResult.rule)}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Desplazamiento: {adjustResult.shiftDays} días
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
