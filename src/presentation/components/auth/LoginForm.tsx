import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/infrastructure/services/AuthService'
import { ForcedPasswordChangeError } from '@/providers/AuthProvider'

const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo es obligatorio.' })
    .email('Debe ser un correo válido.'),
  password: z
    .string({ required_error: 'La contraseña es obligatoria.' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  rememberMe: z.coerce.boolean().optional(),
})

const forcedChangeSchema = z
  .object({
    newPassword: z
      .string({ required_error: 'La contraseña es obligatoria.' })
      .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
    confirmNewPassword: z
      .string({ required_error: 'Confirma tu nueva contraseña.' })
      .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Las contraseñas no coinciden.',
  })

type LoginFormValues = z.infer<typeof loginSchema>
type ForcedChangeFormValues = z.infer<typeof forcedChangeSchema>

interface ForcedChangeContext {
  email: string
  currentPassword: string
  rememberMe: boolean
}

interface LoginFormProps {
  onSuccess?: () => void
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login, isProcessing } = useAuth()
  const [formError, setFormError] = useState<string | null>(null)
  const [forcedChange, setForcedChange] = useState<ForcedChangeContext | null>(
    null,
  )
  const [forceChangeError, setForceChangeError] = useState<string | null>(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const {
    register: registerForced,
    handleSubmit: handleForcedSubmit,
    reset: resetForced,
    formState: { errors: forcedErrors },
  } = useForm<ForcedChangeFormValues>({
    resolver: zodResolver(forcedChangeSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    setForceChangeError(null)
    try {
      await login(values)
      reset()
      onSuccess?.()
    } catch (error) {
      if (error instanceof ForcedPasswordChangeError) {
        setForcedChange({
          email: error.email,
          currentPassword: error.currentPassword,
          rememberMe: error.rememberMe,
        })
        setForceChangeError(error.message)
        resetForced()
        return
      }
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible iniciar sesión.'
      setFormError(message)
    }
  })

  const onForcedChangeSubmit = handleForcedSubmit(async (values) => {
    if (!forcedChange) {
      setForceChangeError('Debes iniciar sesión nuevamente.')
      return
    }

    if (values.newPassword === forcedChange.currentPassword) {
      setForceChangeError(
        'La nueva contraseña debe ser diferente a la contraseña temporal.',
      )
      return
    }

    setForceChangeError(null)
    setIsChangingPassword(true)
    try {
      const result = await authService.changePasswordWithCurrent({
        email: forcedChange.email,
        currentPassword: forcedChange.currentPassword,
        newPassword: values.newPassword,
      })

      if (!result.succeeded) {
        throw new Error(
          result.failureReason ??
            'No fue posible actualizar la contraseña en el prestanet.',
        )
      }

      const updatedContext: ForcedChangeContext = {
        email: forcedChange.email,
        currentPassword: values.newPassword,
        rememberMe: forcedChange.rememberMe,
      }

      setForcedChange(null)
      resetForced()

      await login({
        email: updatedContext.email,
        password: updatedContext.currentPassword,
        rememberMe: updatedContext.rememberMe,
      })

      reset()
      onSuccess?.()
    } catch (error) {
      if (error instanceof ForcedPasswordChangeError) {
        setForcedChange({
          email: error.email,
          currentPassword: error.currentPassword,
          rememberMe: error.rememberMe,
        })
        setForceChangeError(error.message)
        resetForced()
        return
      }

      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible actualizar la contraseña en el prestanet.'
      setForceChangeError(message)
    } finally {
      setIsChangingPassword(false)
    }
  })

  const handleCancelForcedChange = () => {
    if (forcedChange) {
      reset({
        email: forcedChange.email,
        password: '',
        rememberMe: forcedChange.rememberMe,
      })
    }
    setForcedChange(null)
    setForceChangeError(null)
    resetForced()
  }

  const isBusy = isProcessing || isChangingPassword

  if (forcedChange) {
    return (
      <form className="space-y-4" onSubmit={onForcedChangeSubmit} noValidate>
        <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
          <p className="font-medium">Debes actualizar tu contraseña</p>
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-300">
            Cambia la contraseña para{' '}
            <span className="font-medium text-blue-800 dark:text-blue-200">
              {forcedChange.email}
            </span>{' '}
            antes de ingresar al sistema.
          </p>
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Nueva contraseña
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...registerForced('newPassword')}
            disabled={isBusy}
          />
          {forcedErrors.newPassword ? (
            <p className="mt-1 text-xs text-red-500">
              {forcedErrors.newPassword.message}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="confirmNewPassword"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Confirmar nueva contraseña
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
            {...registerForced('confirmNewPassword')}
            disabled={isBusy}
          />
          {forcedErrors.confirmNewPassword ? (
            <p className="mt-1 text-xs text-red-500">
              {forcedErrors.confirmNewPassword.message}
            </p>
          ) : null}
        </div>

        {forceChangeError ? (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {forceChangeError}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="btn-primary flex-1 shadow disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isBusy}
          >
            {isBusy ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
          <button
            type="button"
            onClick={handleCancelForcedChange}
            className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            disabled={isProcessing}
          >
            Volver al inicio de sesión
          </button>
        </div>
      </form>
    )
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
          {...register('email')}
          disabled={isProcessing}
        />
        {errors.email ? (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
          {...register('password')}
          disabled={isProcessing}
        />
        {errors.password ? (
          <p className="mt-1 text-xs text-red-500">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 focus:ring-offset-0 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-primary/60"
            {...register('rememberMe')}
            disabled={isProcessing}
          />
          Recordarme en este dispositivo
        </label>
      </div>

      {formError ? (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {formError}
        </div>
      ) : null}

      <button
        type="submit"
        className="btn-primary w-full shadow disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isProcessing}
      >
        {isProcessing ? 'Iniciando...' : 'Ingresar'}
      </button>
    </form>
  )
}
