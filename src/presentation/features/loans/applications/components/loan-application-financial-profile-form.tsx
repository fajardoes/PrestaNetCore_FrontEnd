import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useForm, type FieldErrors, type Path, type UseFormRegister } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import type { LoanApplicationFinancialProfileUpsertRequest } from '@/infrastructure/loans/requests/loan-application-financial-profile-upsert-request'
import type { LoanApplicationFinancialProfileResponse } from '@/infrastructure/loans/responses/loan-application-financial-profile-response'
import {
  loanApplicationFinancialProfileSchema,
  type LoanApplicationFinancialProfileFormValues,
} from '@/infrastructure/validations/loans/loan-application-financial-profile.schema'
import { LoanApplicationFinancialOtherLiabilitiesTable } from '@/presentation/features/loans/applications/components/loan-application-financial-other-liabilities-table'
import { formatMoney, formatRatio } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationFinancialProfileFormProps {
  initialValues?: Partial<LoanApplicationFinancialProfileFormValues>
  snapshot: LoanApplicationFinancialProfileResponse | null
  readOnly?: boolean
  isSubmitting?: boolean
  onSubmit: (payload: LoanApplicationFinancialProfileUpsertRequest) => Promise<void> | void
}

const defaultValues: LoanApplicationFinancialProfileFormValues = {
  analysisPeriodType: 'monthly',
  notes: '',
  analysisComments: null,
  cashAndBanks: 0,
  accountsReceivable: 0,
  inventoryValue: 0,
  housesAndLand: 0,
  vehicles: 0,
  householdGoods: 0,
  accountsPayableSuppliers: 0,
  loansPayable: 0,
  otherLiabilities: [],
  businessIncome: 0,
  salaryIncome: 0,
  spouseChildrenIncome: 0,
  remittancesIncome: 0,
  otherIncome: 0,
  businessCostOfSales: 0,
  foodExpense: 0,
  healthEducationExpense: 0,
  utilitiesExpense: 0,
  loanInstallmentExpense: 0,
}

const enabledFieldClass =
  'w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/20'

const disabledFieldClass =
  'w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500 shadow-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400'

const resolveFieldClass = (disabled: boolean) =>
  disabled ? disabledFieldClass : enabledFieldClass

export const mapFinancialProfileToFormValues = (
  profile?: LoanApplicationFinancialProfileResponse | null,
): LoanApplicationFinancialProfileFormValues => ({
  analysisPeriodType: profile?.analysisPeriodType ?? 'monthly',
  notes: profile?.notes ?? '',
  analysisComments: profile?.analysisComments ?? null,
  cashAndBanks: profile?.cashAndBanks ?? 0,
  accountsReceivable: profile?.accountsReceivable ?? 0,
  inventoryValue: profile?.inventoryValue ?? 0,
  housesAndLand: profile?.housesAndLand ?? 0,
  vehicles: profile?.vehicles ?? 0,
  householdGoods: profile?.householdGoods ?? 0,
  accountsPayableSuppliers: profile?.accountsPayableSuppliers ?? 0,
  loansPayable: profile?.loansPayable ?? 0,
  otherLiabilities:
    profile?.otherLiabilities
      ?.slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((item, index) => ({
        id: item.id ?? null,
        description: item.description ?? '',
        amount: item.amount ?? 0,
        sortOrder: item.sortOrder ?? index + 1,
      })) ?? [],
  businessIncome: profile?.businessIncome ?? 0,
  salaryIncome: profile?.salaryIncome ?? 0,
  spouseChildrenIncome: profile?.spouseChildrenIncome ?? 0,
  remittancesIncome: profile?.remittancesIncome ?? 0,
  otherIncome: profile?.otherIncome ?? 0,
  businessCostOfSales: profile?.businessCostOfSales ?? 0,
  foodExpense: profile?.foodExpense ?? 0,
  healthEducationExpense: profile?.healthEducationExpense ?? 0,
  utilitiesExpense: profile?.utilitiesExpense ?? 0,
  loanInstallmentExpense: profile?.loanInstallmentExpense ?? 0,
})

const toNullableText = (value?: string | null) => {
  const trimmed = value?.trim() ?? ''
  return trimmed ? trimmed : null
}

const buildRequest = (
  values: LoanApplicationFinancialProfileFormValues,
): LoanApplicationFinancialProfileUpsertRequest => ({
  analysisPeriodType: values.analysisPeriodType,
  notes: toNullableText(values.notes),
  analysisComments: toNullableText(values.analysisComments),
  cashAndBanks: values.cashAndBanks,
  accountsReceivable: values.accountsReceivable,
  inventoryValue: values.inventoryValue,
  housesAndLand: values.housesAndLand,
  vehicles: values.vehicles,
  householdGoods: values.householdGoods,
  accountsPayableSuppliers: values.accountsPayableSuppliers,
  loansPayable: values.loansPayable,
  otherLiabilities: values.otherLiabilities.map((item, index) => ({
    id: item.id ?? null,
    description: item.description.trim(),
    amount: item.amount,
    sortOrder: index + 1,
  })),
  businessIncome: values.businessIncome,
  salaryIncome: values.salaryIncome,
  spouseChildrenIncome: values.spouseChildrenIncome,
  remittancesIncome: values.remittancesIncome,
  otherIncome: values.otherIncome,
  businessCostOfSales: values.businessCostOfSales,
  foodExpense: values.foodExpense,
  healthEducationExpense: values.healthEducationExpense,
  utilitiesExpense: values.utilitiesExpense,
  loanInstallmentExpense: values.loanInstallmentExpense,
})

export const LoanApplicationFinancialProfileForm = ({
  initialValues,
  snapshot,
  readOnly = false,
  isSubmitting = false,
  onSubmit,
}: LoanApplicationFinancialProfileFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<LoanApplicationFinancialProfileFormValues>({
    resolver: yupResolver(loanApplicationFinancialProfileSchema),
    defaultValues,
  })

  useEffect(() => {
    reset({
      ...defaultValues,
      ...initialValues,
    })
  }, [initialValues, reset])

  const disabled = readOnly || isSubmitting

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(buildRequest(values))
      })}
    >
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <CompactSection
            title="Datos del análisis financiero"
            subtitle="Periodo y observaciones del análisis."
            defaultOpen
          >
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-1">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-200">
                  Periodo de analisis
                </label>
                <input type="hidden" {...register('analysisPeriodType')} value="monthly" />
                <div className={disabledFieldClass}>Mensual</div>
                {errors.analysisPeriodType ? (
                  <p className="text-xs text-red-600 dark:text-red-300">
                    {errors.analysisPeriodType.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-200">
                  Notas
                </label>
                <textarea
                  rows={2}
                  maxLength={2000}
                  disabled={disabled}
                  className={resolveFieldClass(disabled)}
                  {...register('notes')}
                />
                {errors.notes ? (
                  <p className="text-xs text-red-600 dark:text-red-300">{errors.notes.message}</p>
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-200">
                  Comentarios
                </label>
                <textarea
                  rows={2}
                  maxLength={2000}
                  disabled={disabled}
                  className={resolveFieldClass(disabled)}
                  {...register('analysisComments')}
                />
                {errors.analysisComments ? (
                  <p className="text-xs text-red-600 dark:text-red-300">
                    {errors.analysisComments.message}
                  </p>
                ) : null}
              </div>
            </div>
            </div>
          </CompactSection>

          <CompactSection title="Activos" subtitle="Composicion patrimonial" defaultOpen>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <MoneyField name="cashAndBanks" label="Cajas y bancos" register={register} errors={errors} disabled={disabled} />
                <MoneyField name="accountsReceivable" label="Cuentas por cobrar" register={register} errors={errors} disabled={disabled} />
                <MoneyField name="inventoryValue" label="Valor inventario" register={register} errors={errors} disabled={disabled} />
                <MoneyField name="housesAndLand" label="Casas y terrenos" register={register} errors={errors} disabled={disabled} />
                <MoneyField name="vehicles" label="Vehiculos" register={register} errors={errors} disabled={disabled} />
                <MoneyField name="householdGoods" label="Menajes" register={register} errors={errors} disabled={disabled} />
              </div>
            </div>
            <div className="mt-3">
              <ReadonlyMetricRow label="Total activos" value={formatMoney(snapshot?.totalAssets)} />
            </div>
          </CompactSection>

          <CompactSection
            title="Pasivos"
            subtitle="Pasivos directos y otros compromisos"
            defaultOpen
          >
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <MoneyField name="accountsPayableSuppliers" label="Cuentas por pagar proveedores" register={register} errors={errors} disabled={disabled} />
                <MoneyField name="loansPayable" label="Prestamos por pagar" register={register} errors={errors} disabled={disabled} />
              </div>
            </div>
            <div className="mt-4">
              <LoanApplicationFinancialOtherLiabilitiesTable
                control={control}
                register={register}
                errors={errors}
                disabled={disabled}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <ReadonlyMetricRow label="Total otros pasivos" value={formatMoney(snapshot?.totalOtherLiabilities)} />
              <ReadonlyMetricRow label="Total pasivos" value={formatMoney(snapshot?.totalLiabilities)} />
              <ReadonlyMetricRow label="Patrimonio" value={formatMoney(snapshot?.equity)} />
              <ReadonlyMetricRow label="Pasivo + patrimonio" value={formatMoney(snapshot?.totalLiabilitiesEquity)} />
            </div>
          </CompactSection>

          <CompactSection title="Flujo del periodo" subtitle="Ingresos y gastos" defaultOpen>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Ingresos
                  </h4>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {formatMoney(snapshot?.totalIncome)}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <MoneyField name="businessIncome" label="Ingresos del negocio" register={register} errors={errors} disabled={disabled} />
                  <MoneyField name="salaryIncome" label="Ingreso por salario" register={register} errors={errors} disabled={disabled} />
                  <MoneyField name="spouseChildrenIncome" label="Conyuge / hijos" register={register} errors={errors} disabled={disabled} />
                  <MoneyField name="remittancesIncome" label="Remesas" register={register} errors={errors} disabled={disabled} />
                  <MoneyField name="otherIncome" label="Otros ingresos" register={register} errors={errors} disabled={disabled} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Gastos
                  </h4>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {formatMoney(snapshot?.totalExpenses)}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <MoneyField name="businessCostOfSales" label="Costo venta negocio" register={register} errors={errors} disabled={disabled} />
                  <MoneyField name="foodExpense" label="Alimentacion" register={register} errors={errors} disabled={disabled} />
                  <MoneyField name="healthEducationExpense" label="Salud / educacion" register={register} errors={errors} disabled={disabled} />
                  <MoneyField name="utilitiesExpense" label="Servicios publicos" register={register} errors={errors} disabled={disabled} />
                  <MoneyField name="loanInstallmentExpense" label="Pago cuotas prestamos" register={register} errors={errors} disabled={disabled} />
                </div>
              </div>
            </div>
          </CompactSection>
        </div>

        <FinancialSummarySidebar snapshot={snapshot} />
      </section>

      {!readOnly ? (
        <div className="sticky bottom-4 z-10 flex justify-end">
          <div className="rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <button type="submit" className="btn-primary px-4 py-2 text-sm" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar ficha financiera'}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  )
}

const FinancialSummarySidebar = ({
  snapshot,
}: {
  snapshot: LoanApplicationFinancialProfileResponse | null
}) => (
  <aside className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm xl:sticky xl:top-4 dark:border-slate-800 dark:bg-slate-900">
    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Resumen ejecutivo</h3>
    <div className="mt-4 grid grid-cols-2 gap-2">
      <SummaryMetricCard label="Activos" value={formatMoney(snapshot?.totalAssets)} />
      <SummaryMetricCard label="Pasivos" value={formatMoney(snapshot?.totalLiabilities)} />
      <SummaryMetricCard label="Ingresos" value={formatMoney(snapshot?.totalIncome)} />
      <SummaryMetricCard label="Gastos" value={formatMoney(snapshot?.totalExpenses)} />
      <SummaryMetricCard label="Utilidad" value={formatMoney(snapshot?.periodProfit)} />
      <SummaryMetricCard
        label="Completitud"
        value={snapshot ? (snapshot.isComplete ? 'Completa' : 'Incompleta') : 'Pendiente'}
      />
      <SummaryMetricCard label="Pasivo / activos" value={formatRatio(snapshot?.debtRatio)} />
      <SummaryMetricCard
        label="Pasivo / patrimonio"
        value={formatRatio(snapshot?.debtToEquityRatio)}
      />
    </div>
  </aside>
)

const CompactSection = ({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string
  subtitle: string
  defaultOpen?: boolean
  children: ReactNode
}) => (
  <details
    open={defaultOpen}
    className="group rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
  >
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <span className="text-xs text-slate-400 transition group-open:rotate-180">⌃</span>
    </summary>
    <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">{children}</div>
  </details>
)

const MoneyField = ({
  name,
  label,
  register,
  errors,
  disabled,
}: {
  name: Path<LoanApplicationFinancialProfileFormValues>
  label: string
  register: UseFormRegister<LoanApplicationFinancialProfileFormValues>
  errors: FieldErrors<LoanApplicationFinancialProfileFormValues>
  disabled: boolean
}) => {
  const fieldError = resolveFieldError(errors, name)

  return (
    <div className="space-y-1">
      <label className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{label}</label>
      <input
        type="number"
        min="0"
        step="0.01"
        disabled={disabled}
        className={resolveFieldClass(disabled)}
        {...register(name)}
      />
      {fieldError ? <p className="text-xs text-red-600 dark:text-red-300">{fieldError}</p> : null}
    </div>
  )
}

const resolveFieldError = (
  errors: FieldErrors<LoanApplicationFinancialProfileFormValues>,
  name: Path<LoanApplicationFinancialProfileFormValues>,
) => {
  const parts = name.split('.')
  let current: unknown = errors

  for (const part of parts) {
    if (!current || typeof current !== 'object') return null
    current = (current as Record<string, unknown>)[part]
  }

  if (
    current &&
    typeof current === 'object' &&
    'message' in current &&
    typeof (current as { message?: unknown }).message === 'string'
  ) {
    return (current as { message: string }).message
  }

  return null
}

const ReadonlyMetricRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)

const SummaryMetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
  </div>
)
