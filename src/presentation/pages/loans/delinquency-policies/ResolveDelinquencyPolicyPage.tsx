import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAgencies } from '@/presentation/features/catalog/hooks/use-agencies'
import { useLoanCatalogsCache } from '@/presentation/features/loans/catalogs/hooks/use-loan-catalogs-cache'
import { useResolveDelinquencyPolicy } from '@/presentation/features/loans/delinquency/hooks/use-resolve-delinquency-policy'
import {
  delinquencyPolicyResolveSchema,
  type DelinquencyPolicyResolveFormValues,
} from '@/infrastructure/validations/loans/delinquency-policy-resolve.schema'

export const ResolveDelinquencyPolicyPage = () => {
  const { agencies, isLoading: agenciesLoading } = useAgencies()
  const catalogs = useLoanCatalogsCache()
  const { data, isLoading, error, resolve } = useResolveDelinquencyPolicy()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DelinquencyPolicyResolveFormValues>({
    resolver: yupResolver(delinquencyPolicyResolveSchema),
    defaultValues: {
      agencyId: '',
      portfolioTypeId: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    await resolve({
      agencyId: values.agencyId || null,
      portfolioTypeId: values.portfolioTypeId || null,
    })
  })

  const sortedBuckets = useMemo(() => {
    if (!data?.buckets) return []
    return [...data.buckets].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    )
  }, [data?.buckets])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Resolver Política Efectiva
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Evalúa la política aplicable para una sucursal y tipo de cartera.
        </p>
      </div>

      <form
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        onSubmit={onSubmit}
        noValidate
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="agencyId"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Sucursal
            </label>
            <select
              id="agencyId"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('agencyId')}
              disabled={isLoading || agenciesLoading}
            >
              <option value="">Todas</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.code} - {agency.name}
                </option>
              ))}
            </select>
            {errors.agencyId ? (
              <p className="text-xs text-red-500">{errors.agencyId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="portfolioTypeId"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Tipo de cartera
            </label>
            <select
              id="portfolioTypeId"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('portfolioTypeId')}
              disabled={isLoading || catalogs.isLoading}
            >
              <option value="">Todas</option>
              {catalogs.portfolioTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.code} - {type.name}
                </option>
              ))}
            </select>
            {errors.portfolioTypeId ? (
              <p className="text-xs text-red-500">
                {errors.portfolioTypeId.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="submit"
            className="btn-primary px-6 py-2 text-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Resolviendo...' : 'Resolver'}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </form>

      {data ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {data.policyCode} - {data.policyName}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Parámetros efectivos de mora.
              </p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <InfoItem label="Días gracia" value={String(data.graceDays)} />
              <InfoItem label="Tasa anual" value={String(data.penaltyRateAnnual)} />
              <InfoItem label="Base" value={String(data.rateBase)} />
              <InfoItem label="Base cálculo" value={data.calculationBase} />
              <InfoItem label="Modo redondeo" value={data.roundingMode} />
              <InfoItem label="Decimales" value={String(data.roundingDecimals)} />
              <InfoItem
                label="Incluye sábado"
                value={data.includeSaturday ? 'Sí' : 'No'}
              />
              <InfoItem
                label="Incluye domingo"
                value={data.includeSunday ? 'Sí' : 'No'}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Desde
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Hasta
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Orden
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {sortedBuckets.length ? (
                    sortedBuckets.map((bucket) => (
                      <tr
                        key={bucket.id ?? `${bucket.code}-${bucket.sortOrder}`}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-900"
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {bucket.code}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                          {bucket.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                          {bucket.fromDays}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                          {bucket.toDays}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                          {bucket.sortOrder}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                          {bucket.isActive ? 'Activo' : 'Inactivo'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
                        colSpan={6}
                      >
                        No hay buckets disponibles.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
    <p className="text-xs uppercase text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="font-semibold">{value}</p>
  </div>
)
