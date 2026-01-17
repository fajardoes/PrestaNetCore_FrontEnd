import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useChangePassword } from '@/presentation/features/auth/hooks/use-change-password'

const passwordSchema = z
  .object({
    newPassword: z
      .string({ required_error: 'La nueva contraseña es obligatoria.' })
      .min(8, 'Debe tener al menos 8 caracteres.'),
    confirmPassword: z
      .string({ required_error: 'Confirma la nueva contraseña.' })
      .min(8, 'Debe tener al menos 8 caracteres.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

interface ForceChangeState {
  email: string
  currentPassword: string
  rememberMe?: boolean
  message?: string
}

export const ForceChangePasswordPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { changePassword, isLoading, error } = useChangePassword()

  const forcedContext = (location.state as ForceChangeState | null) ?? null

  useEffect(() => {
    if (!forcedContext?.email || !forcedContext.currentPassword) {
      navigate('/auth/login', { replace: true })
    }
  }, [forcedContext, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    if (!forcedContext) return
    const result = await changePassword({
      email: forcedContext.email,
      currentPassword: forcedContext.currentPassword,
      newPassword: values.newPassword,
      rememberMe: forcedContext.rememberMe,
    })

    if (result.success) {
      navigate('/', { replace: true })
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-100 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-2xl rounded-2xl border border-amber-200 bg-white/95 p-8 shadow-xl shadow-amber-200/30 backdrop-blur dark:border-amber-900/60 dark:bg-slate-900/95">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500">
            Cambio obligatorio
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
            Actualiza tu contraseña
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {forcedContext?.message ??
              'Debes definir una nueva contraseña antes de continuar.'}
          </p>
          {forcedContext?.email ? (
            <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cuenta: {forcedContext.email}
            </p>
          ) : null}
        </div>

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('newPassword')}
              disabled={isLoading}
            />
            {errors.newPassword ? (
              <p className="text-xs text-red-500">
                {errors.newPassword.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="btn-primary flex-1 py-2.5 text-base shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading || !forcedContext}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar y continuar'}
            </button>
            <Link
              to="/auth/login"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              Regresar al inicio
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
