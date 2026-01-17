import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { SecurityUser } from '@/infrastructure/interfaces/security/user'
import {
  temporaryPasswordSchema,
  type TemporaryPasswordFormValues,
} from '@/infrastructure/validations/security/temporary-password.schema'
import { useTemporaryPassword } from '@/presentation/features/security/hooks/use-temporary-password'

interface TemporaryPasswordModalProps {
  user: SecurityUser | null
  open: boolean
  onClose: () => void
}

export const TemporaryPasswordModal = ({
  user,
  open,
  onClose,
}: TemporaryPasswordModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TemporaryPasswordFormValues>({
    resolver: zodResolver(temporaryPasswordSchema(user?.email)),
    defaultValues: {
      emailConfirmation: '',
      temporaryPassword: '',
      confirmTemporaryPassword: '',
    },
  })

  const { generate, isLoading, error, password } = useTemporaryPassword()

  useEffect(() => {
    reset({
      emailConfirmation: '',
      temporaryPassword: '',
      confirmTemporaryPassword: '',
    })
  }, [reset, user])

  if (!open || !user) return null

  const onSubmit = handleSubmit(async (values) => {
    await generate(user.id, values.temporaryPassword)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Generar contraseña temporal
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Define y asigna una clave temporal (MustChangePassword=true) sin
              enviar correos. El usuario deberá cambiarla en su próximo inicio.
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

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <label
              htmlFor="emailConfirmation"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Correo del usuario ({user.email})
            </label>
            <input
              id="emailConfirmation"
              type="email"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('emailConfirmation')}
              disabled={isLoading}
            />
            {errors.emailConfirmation ? (
              <p className="text-xs text-red-500">
                {errors.emailConfirmation.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="temporaryPassword"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Contraseña temporal
            </label>
            <input
              id="temporaryPassword"
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('temporaryPassword')}
              disabled={isLoading}
            />
            {errors.temporaryPassword ? (
              <p className="text-xs text-red-500">
                {errors.temporaryPassword.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmTemporaryPassword"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Confirmar contraseña temporal
            </label>
            <input
              id="confirmTemporaryPassword"
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('confirmTemporaryPassword')}
              disabled={isLoading}
            />
            {errors.confirmTemporaryPassword ? (
              <p className="text-xs text-red-500">
                {errors.confirmTemporaryPassword.message}
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          {password ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-100">
              <p className="font-semibold">Contraseña generada</p>
              <p className="mt-1 break-words text-base font-mono">{password}</p>
              <p className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-100/80">
                Compártela de forma segura. El usuario deberá cambiarla al
                ingresar.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 text-sm shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? 'Generando...' : 'Generar contraseña'}
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
