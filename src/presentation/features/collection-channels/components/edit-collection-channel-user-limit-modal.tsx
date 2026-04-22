import { useEffect, useState } from 'react'
import type { CollectionChannelUserResponse } from '@/infrastructure/collection-channels/responses/collection-channel-user-response'
import { formatChannelMoney } from './collection-channel-ui'

interface EditCollectionChannelUserLimitModalProps {
  open: boolean
  user: CollectionChannelUserResponse | null
  currencyCode: string
  isSaving: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (maxOutstandingAmount: number) => Promise<void> | void
}

export const EditCollectionChannelUserLimitModal = ({
  open,
  user,
  currencyCode,
  isSaving,
  error,
  onClose,
  onSubmit,
}: EditCollectionChannelUserLimitModalProps) => {
  const [maxOutstandingAmount, setMaxOutstandingAmount] = useState('')

  useEffect(() => {
    if (!open || !user) {
      setMaxOutstandingAmount('')
      return
    }
    setMaxOutstandingAmount(String(user.maxOutstandingAmount))
  }, [open, user])

  if (!open || !user) return null

  const parsedValue = Number(maxOutstandingAmount)
  const isValid =
    maxOutstandingAmount.trim().length > 0 && Number.isFinite(parsedValue) && parsedValue > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Editar límite máximo de saldo pendiente del usuario
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Ajusta el límite máximo de saldo pendiente del usuario dentro de este canal.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <p className="font-medium text-slate-900 dark:text-slate-50">{user.userName}</p>
          <p>{user.email}</p>
          <p className="mt-2">
            Saldo pendiente:{' '}
            <span className="font-semibold">
              {formatChannelMoney(user.currentOutstandingAmount, currencyCode)}
            </span>
          </p>
          <p>
            Disponible actual:{' '}
            <span className="font-semibold">
              {formatChannelMoney(user.availableOutstandingAmount, currencyCode)}
            </span>
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <label
            htmlFor="edit-user-max-outstanding-amount"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Límite máximo de saldo pendiente del usuario
          </label>
          <input
            id="edit-user-max-outstanding-amount"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={maxOutstandingAmount}
            disabled={isSaving}
            onChange={(event) => setMaxOutstandingAmount(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            placeholder="0.00"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            El backend rechazará un valor menor que el saldo pendiente del usuario.
          </p>
          {maxOutstandingAmount.trim().length > 0 && !isValid ? (
            <p className="text-xs text-red-500">
              El límite máximo de saldo pendiente debe ser un monto mayor que 0.
            </p>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-sm"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving || !isValid}
            onClick={() => {
              if (!isValid) return
              void onSubmit(parsedValue)
            }}
          >
            {isSaving ? 'Guardando...' : 'Guardar límite'}
          </button>
        </div>
      </div>
    </div>
  )
}
