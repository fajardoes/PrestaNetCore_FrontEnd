import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  delinquencyPolicyAssignmentSchema,
  type DelinquencyPolicyAssignmentFormValues,
} from '@/infrastructure/validations/loans/delinquency-policy-assignment.schema'
import type { DelinquencyPolicyAssignmentListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-assignment-list-item.response'
import type { DelinquencyPolicyListItemDto } from '@/infrastructure/intranet/responses/loans/delinquency-policy-list-item.response'
import type { Agency } from '@/infrastructure/interfaces/catalog/agency'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'

interface DelinquencyPolicyAssignmentModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (values: DelinquencyPolicyAssignmentFormValues) => Promise<void> | void
  isSaving?: boolean
  error?: string | null
  assignment?: DelinquencyPolicyAssignmentListItemDto | null
  policies: DelinquencyPolicyListItemDto[]
  agencies: Agency[]
  portfolioTypes: LoanCatalogItemDto[]
}

const formatPolicyLabel = (policy: DelinquencyPolicyListItemDto) =>
  `${policy.code} - ${policy.name}`

export const DelinquencyPolicyAssignmentModal = ({
  open,
  onClose,
  onSubmit,
  isSaving,
  error,
  assignment,
  policies,
  agencies,
  portfolioTypes,
}: DelinquencyPolicyAssignmentModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DelinquencyPolicyAssignmentFormValues>({
    resolver: yupResolver(delinquencyPolicyAssignmentSchema),
    defaultValues: {
      policyId: '',
      agencyId: '',
      portfolioTypeId: '',
      priority: 1,
    },
  })

  useEffect(() => {
    if (!open) return
    if (assignment) {
      reset({
        policyId: assignment.policyId,
        agencyId: assignment.agencyId ?? '',
        portfolioTypeId: assignment.portfolioTypeId ?? '',
        priority: assignment.priority,
      })
      return
    }
    reset({
      policyId: '',
      agencyId: '',
      portfolioTypeId: '',
      priority: 1,
    })
  }, [assignment, open, reset])

  if (!open) return null

  const submitHandler = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      agencyId: values.agencyId || null,
      portfolioTypeId: values.portfolioTypeId || null,
    })
  })

  const policyOptions = assignment
    ? policies.some((policy) => policy.id === assignment.policyId)
      ? policies
      : [
          {
            id: assignment.policyId,
            code: assignment.policyCode,
            name: assignment.policyName,
            isActive: true,
            graceDays: 0,
            penaltyRateAnnual: 0,
            rateBase: 360,
          },
          ...policies,
        ]
    : policies

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {assignment ? 'Editar asignación' : 'Nueva asignación'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Define la política, sucursal, tipo de cartera y prioridad.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Cerrar modal"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={submitHandler} noValidate>
          <div className="space-y-2">
            <label
              htmlFor="policyId"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Política activa
            </label>
            <select
              id="policyId"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('policyId')}
              disabled={isSaving}
            >
              <option value="">Selecciona una política</option>
              {policyOptions.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {formatPolicyLabel(policy)}
                </option>
              ))}
            </select>
            {errors.policyId ? (
              <p className="text-xs text-red-500">{errors.policyId.message}</p>
            ) : null}
          </div>

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
                disabled={isSaving}
              >
                <option value="">Todas</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.code} - {agency.name}
                  </option>
                ))}
              </select>
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
                disabled={isSaving}
              >
                <option value="">Todas</option>
                {portfolioTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.code} - {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Prioridad
            </label>
            <input
              id="priority"
              type="number"
              min={0}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('priority', { valueAsNumber: true })}
              disabled={isSaving}
            />
            {errors.priority ? (
              <p className="text-xs text-red-500">{errors.priority.message}</p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 text-sm shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : assignment ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)
