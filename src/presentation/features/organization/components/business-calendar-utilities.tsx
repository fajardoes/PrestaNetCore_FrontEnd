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
import AsyncSelect from '@/presentation/share/components/async-select'
import { DatePicker } from '@/presentation/share/components/date-picker'

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
    watch: watchCheck,
    setValue: setCheckValue,
    getValues: getCheckValues,
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
    watch: watchAdjust,
    setValue: setAdjustValue,
    getValues: getAdjustValues,
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

  const agencyOptions = useMemo(
    () => sortedAgencies.map((agency) => ({ value: agency.id, label: agency.name })),
    [sortedAgencies],
  )
  const portfolioTypeOptions = useMemo(
    () => sortedPortfolioTypes.map((type) => ({ value: type.id, label: type.name })),
    [sortedPortfolioTypes],
  )
  const ruleOptions = useMemo(
    () => RULE_OPTIONS.map((rule) => ({ value: String(rule.value), label: rule.label })),
    [],
  )
  const filterOptions = async <T extends string | number>(
    options: Array<{ value: T; label: string }>,
    inputValue: string,
  ) => {
    const term = inputValue.trim().toLowerCase()
    if (!term) return options
    return options.filter((option) => option.label.toLowerCase().includes(term))
  }

  const selectedCheckAgencyId = watchCheck('agencyId')
  const selectedCheckPortfolioTypeId = watchCheck('portfolioTypeId')
  const selectedCheckDate = watchCheck('date')
  const selectedAdjustRule = watchAdjust('rule')
  const selectedAdjustAgencyId = watchAdjust('agencyId')
  const selectedAdjustPortfolioTypeId = watchAdjust('portfolioTypeId')
  const selectedAdjustDate = watchAdjust('date')

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
            <DatePicker
              value={selectedCheckDate}
              onChange={(value) =>
                setCheckValue('date', value, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              onBlur={() =>
                setCheckValue('date', getCheckValues('date'), {
                  shouldValidate: true,
                  shouldTouch: true,
                })
              }
              error={checkErrors.date?.message}
              disabled={isChecking}
              placeholder="Selecciona una fecha"
              allowFutureDates
            />
            <input type="hidden" {...registerCheck('date')} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Agencia (opcional)
              </label>
              <AsyncSelect
                value={
                  agencyOptions.find((option) => option.value === selectedCheckAgencyId) ?? null
                }
                onChange={(option) =>
                  setCheckValue('agencyId', option?.value ?? '', {
                    shouldValidate: true,
                  })
                }
                loadOptions={(inputValue) => filterOptions(agencyOptions, inputValue)}
                defaultOptions={agencyOptions}
                instanceId="organization-holidays-check-agency"
                isClearable
                placeholder="Todas"
                isDisabled={isChecking || agenciesLoading}
                noOptionsMessage="Sin agencias"
              />
              <input type="hidden" {...registerCheck('agencyId')} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Tipo de portafolio (opcional)
              </label>
              <AsyncSelect
                value={
                  portfolioTypeOptions.find(
                    (option) => option.value === selectedCheckPortfolioTypeId,
                  ) ?? null
                }
                onChange={(option) =>
                  setCheckValue('portfolioTypeId', option?.value ?? '', {
                    shouldValidate: true,
                  })
                }
                loadOptions={(inputValue) => filterOptions(portfolioTypeOptions, inputValue)}
                defaultOptions={portfolioTypeOptions}
                instanceId="organization-holidays-check-portfolio-type"
                isClearable
                placeholder="Todos"
                isDisabled={isChecking || catalogs.isLoading}
                noOptionsMessage="Sin tipos"
              />
              <input type="hidden" {...registerCheck('portfolioTypeId')} />
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
            <DatePicker
              value={selectedAdjustDate}
              onChange={(value) =>
                setAdjustValue('date', value, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              onBlur={() =>
                setAdjustValue('date', getAdjustValues('date'), {
                  shouldValidate: true,
                  shouldTouch: true,
                })
              }
              error={adjustErrors.date?.message}
              disabled={isAdjusting}
              placeholder="Selecciona una fecha"
              allowFutureDates
            />
            <input type="hidden" {...registerAdjust('date')} />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Regla
            </label>
            <AsyncSelect
              value={
                ruleOptions.find((option) => option.value === String(selectedAdjustRule)) ?? null
              }
              onChange={(option) =>
                setAdjustValue('rule', Number(option?.value ?? '1'), {
                  shouldValidate: true,
                })
              }
              loadOptions={(inputValue) => filterOptions(ruleOptions, inputValue)}
              defaultOptions={ruleOptions}
              instanceId="organization-holidays-adjust-rule"
              isClearable={false}
              isDisabled={isAdjusting}
              noOptionsMessage="Sin reglas"
            />
            <input type="hidden" {...registerAdjust('rule', { valueAsNumber: true })} />
            {adjustErrors.rule ? (
              <p className="text-xs text-red-500">{adjustErrors.rule.message}</p>
            ) : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Agencia (opcional)
              </label>
              <AsyncSelect
                value={
                  agencyOptions.find((option) => option.value === selectedAdjustAgencyId) ?? null
                }
                onChange={(option) =>
                  setAdjustValue('agencyId', option?.value ?? '', {
                    shouldValidate: true,
                  })
                }
                loadOptions={(inputValue) => filterOptions(agencyOptions, inputValue)}
                defaultOptions={agencyOptions}
                instanceId="organization-holidays-adjust-agency"
                isClearable
                placeholder="Todas"
                isDisabled={isAdjusting || agenciesLoading}
                noOptionsMessage="Sin agencias"
              />
              <input type="hidden" {...registerAdjust('agencyId')} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Tipo de portafolio (opcional)
              </label>
              <AsyncSelect
                value={
                  portfolioTypeOptions.find(
                    (option) => option.value === selectedAdjustPortfolioTypeId,
                  ) ?? null
                }
                onChange={(option) =>
                  setAdjustValue('portfolioTypeId', option?.value ?? '', {
                    shouldValidate: true,
                  })
                }
                loadOptions={(inputValue) => filterOptions(portfolioTypeOptions, inputValue)}
                defaultOptions={portfolioTypeOptions}
                instanceId="organization-holidays-adjust-portfolio-type"
                isClearable
                placeholder="Todos"
                isDisabled={isAdjusting || catalogs.isLoading}
                noOptionsMessage="Sin tipos"
              />
              <input type="hidden" {...registerAdjust('portfolioTypeId')} />
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
