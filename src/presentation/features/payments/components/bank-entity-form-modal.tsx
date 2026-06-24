import { useEffect, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Controller, useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import type { BankEntityResponse } from '@/infrastructure/payments/responses/bank-entity-response'
import {
  bankEntitySchema,
  type BankEntityFormValues,
} from '@/infrastructure/validations/payments/bank-entity.schema'
import { useGlAccountsSearch } from '@/presentation/features/loans/products/hooks/use-gl-accounts-search'
import AsyncSelect, { type AsyncSelectOption } from '@/presentation/share/components/async-select'

interface BankEntityFormModalProps {
  open: boolean
  bankEntity?: BankEntityResponse | null
  isSaving: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: BankEntityFormValues) => Promise<void> | void
}

const defaultValues: BankEntityFormValues = {
  code: '',
  name: '',
  description: '',
  bankGlAccountId: '',
  isActive: true,
}

const accountLabel = (account: ChartAccountListItem) =>
  `${account.code?.trim() || 'Sin código'} - ${account.name?.trim() || 'Sin nombre'}`

const toAccountOption = (
  account: ChartAccountListItem,
): AsyncSelectOption<ChartAccountListItem> => ({
  value: account.id,
  label: accountLabel(account),
  meta: account,
})

export const BankEntityFormModal = ({
  open,
  bankEntity,
  isSaving,
  error,
  onClose,
  onSubmit,
}: BankEntityFormModalProps) => {
  const { searchAccounts, isLoading, error: accountError } = useGlAccountsSearch()
  const [selectedAccount, setSelectedAccount] =
    useState<AsyncSelectOption<ChartAccountListItem> | null>(null)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankEntityFormValues>({
    resolver: zodResolver(bankEntitySchema),
    defaultValues,
  })

  useEffect(() => {
    if (!open) return
    setSelectedAccount(
      bankEntity?.bankGlAccountId &&
      (bankEntity.bankGlAccountCode || bankEntity.bankGlAccountName)
        ? {
            value: bankEntity.bankGlAccountId,
            label: `${bankEntity.bankGlAccountCode ?? 'Sin código'} - ${bankEntity.bankGlAccountName ?? 'Sin nombre'}`,
          }
        : null,
    )
    reset({
      code: bankEntity?.code ?? '',
      name: bankEntity?.name ?? '',
      description: bankEntity?.description ?? '',
      bankGlAccountId: bankEntity?.bankGlAccountId ?? '',
      isActive: bankEntity?.isActive ?? true,
    })
  }, [bankEntity, open, reset])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {bankEntity ? 'Editar entidad bancaria' : 'Nueva entidad bancaria'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              La cuenta contable se administra en este catálogo y ya no se captura en el flujo operativo.
            </p>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
          })}
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              id="code"
              label="Código"
              error={errors.code?.message}
              disabled={isSaving}
              placeholder="BAC"
              registration={register('code')}
            />
            <InputField
              id="name"
              label="Nombre"
              error={errors.name?.message}
              disabled={isSaving}
              placeholder="BAC Credomatic"
              registration={register('name')}
            />
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="bankGlAccountId"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Cuenta contable bancaria
              </label>
              <Controller
                control={control}
                name="bankGlAccountId"
                render={({ field }) => (
                  <AsyncSelect<ChartAccountListItem>
                    value={selectedAccount}
                    onChange={(option) => {
                      setSelectedAccount(option)
                      field.onChange(option?.value ?? '')
                    }}
                    loadOptions={async (inputValue) => {
                      const results = await searchAccounts(inputValue.trim())
                      return results
                        .filter((account) => account.isActive && !account.isGroup)
                        .map(toAccountOption)
                    }}
                    defaultOptions
                    isClearable
                    isDisabled={isSaving}
                    isLoading={isLoading}
                    inputId="bank-entity-account"
                    instanceId="bank-entity-account"
                    placeholder="Buscar cuenta contable activa e imputable"
                    noOptionsMessage="No hay cuentas imputables activas."
                  />
                )}
              />
              {errors.bankGlAccountId ? (
                <p className="text-xs text-red-500">{errors.bankGlAccountId.message}</p>
              ) : null}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                Descripción
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                disabled={isSaving}
                placeholder="Cuenta recaudadora BAC."
                {...register('description')}
              />
              {errors.description ? (
                <p className="text-xs text-red-500">{errors.description.message}</p>
              ) : null}
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  Entidad activa
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Las entidades inactivas no se deben ofrecer en registro ni aprobación.
                </p>
              </div>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
                  disabled={isSaving}
                  {...register('isActive')}
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">Activo</span>
              </label>
            </div>
          </div>

          {error || accountError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error || accountError}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 text-sm"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : bankEntity ? 'Guardar cambios' : 'Crear entidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type InputFieldProps = {
  id: string
  label: string
  error?: string
  disabled?: boolean
  placeholder?: string
  registration: UseFormRegisterReturn
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'name' | 'onChange' | 'onBlur' | 'ref'>

const InputField = ({
  id,
  label,
  error,
  disabled,
  placeholder,
  registration,
  ...props
}: InputFieldProps) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
    </label>
    <input
      id={id}
      type="text"
      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
      disabled={disabled}
      placeholder={placeholder}
      {...registration}
      {...props}
    />
    {error ? <p className="text-xs text-red-500">{error}</p> : null}
  </div>
)

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
