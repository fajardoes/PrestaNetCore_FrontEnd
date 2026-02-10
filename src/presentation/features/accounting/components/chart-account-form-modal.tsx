import type { UseFormReturn } from 'react-hook-form'
import type { ChartAccountFormValues } from '@/infrastructure/validations/accounting/chart-account.schema'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import AsyncSelect, {
  type AsyncSelectOption,
} from '@/presentation/share/components/async-select'

interface ChartAccountFormModalProps {
  open: boolean
  onClose: () => void
  form: UseFormReturn<ChartAccountFormValues>
  onSubmit: () => void
  isSaving: boolean
  error?: string | null
  isEdit?: boolean
  parentOptions?: ChartAccountListItem[]
}

export const ChartAccountFormModal = ({
  open,
  onClose,
  form,
  onSubmit,
  isSaving,
  error,
  isEdit = false,
  parentOptions = [],
}: ChartAccountFormModalProps) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const parentId = watch('parentId')
  const normalBalance = watch('normalBalance')
  const parentOptionsForSelect: AsyncSelectOption<ChartAccountListItem>[] =
    parentOptions.map((parent) => ({
      value: parent.id,
      label: `${parent.code} - ${parent.name}`,
      meta: parent,
    }))
  const normalBalanceOptions: AsyncSelectOption<'debit' | 'credit'>[] = [
    { value: 'debit', label: 'Debe', meta: 'debit' },
    { value: 'credit', label: 'Haber', meta: 'credit' },
  ]
  const loadParentOptions = async (inputValue: string) => {
    const term = inputValue.trim().toLowerCase()
    if (!term) return parentOptionsForSelect
    return parentOptionsForSelect.filter((option) =>
      option.label.toLowerCase().includes(term),
    )
  }
  const loadNormalBalanceOptions = async (inputValue: string) => {
    const term = inputValue.trim().toLowerCase()
    if (!term) return normalBalanceOptions
    return normalBalanceOptions.filter((option) =>
      option.label.toLowerCase().includes(term),
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {isEdit ? 'Editar cuenta contable' : 'Crear cuenta contable'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Define código, nombre, naturaleza y si la cuenta es grupo o posteable.
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

        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <label
              htmlFor="code"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Código
            </label>
            <input
              id="code"
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('code')}
              disabled={isSaving}
            />
            {errors.code ? (
              <p className="text-xs text-red-500">{errors.code.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Nombre
            </label>
            <input
              id="name"
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('name')}
              disabled={isSaving}
            />
            {errors.name ? (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="slug"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Slug
            </label>
            <input
              id="slug"
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('slug')}
              disabled={isSaving}
            />
            {errors.slug ? (
              <p className="text-xs text-red-500">{errors.slug.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="level"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Nivel
            </label>
            <input
              id="level"
              type="number"
              min={1}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('level', { valueAsNumber: true })}
              disabled={isSaving}
            />
            {errors.level ? (
              <p className="text-xs text-red-500">{errors.level.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="parentId"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Padre (opcional)
            </label>
            <AsyncSelect<ChartAccountListItem>
              value={
                parentOptionsForSelect.find((option) => option.value === parentId) ??
                null
              }
              onChange={(option) =>
                setValue('parentId', option?.value ?? '', { shouldValidate: true })
              }
              loadOptions={loadParentOptions}
              placeholder="Sin padre"
              inputId="parentId"
              instanceId="accounting-chart-account-parent-id"
              isDisabled={isSaving}
              defaultOptions={parentOptionsForSelect}
              isClearable
              noOptionsMessage="Sin cuentas padre"
            />
            <input type="hidden" {...register('parentId')} />
            {errors.parentId ? (
              <p className="text-xs text-red-500">{errors.parentId.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="normalBalance"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Naturaleza
            </label>
            <AsyncSelect<'debit' | 'credit'>
              value={
                normalBalanceOptions.find((option) => option.value === normalBalance) ??
                null
              }
              onChange={(option) =>
                setValue('normalBalance', (option?.value as 'debit' | 'credit') ?? 'debit', {
                  shouldValidate: true,
                })
              }
              loadOptions={loadNormalBalanceOptions}
              placeholder="Selecciona naturaleza"
              inputId="normalBalance"
              instanceId="accounting-chart-account-normal-balance"
              isDisabled={isSaving}
              defaultOptions={normalBalanceOptions}
              noOptionsMessage="Sin opciones"
            />
            <input type="hidden" {...register('normalBalance')} />
            {errors.normalBalance ? (
              <p className="text-xs text-red-500">
                {errors.normalBalance.message}
              </p>
            ) : null}
          </div>

          <div className="col-span-2 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('isGroup')}
                disabled={isSaving}
              />
              <span className="text-sm text-slate-800 dark:text-slate-100">
                Es cuenta grupo
              </span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                {...register('isActive')}
                disabled={isSaving}
              />
              <span className="text-sm text-slate-800 dark:text-slate-100">
                Cuenta activa
              </span>
            </label>
          </div>

          {error ? (
            <div className="col-span-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
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
              {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear'}
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
