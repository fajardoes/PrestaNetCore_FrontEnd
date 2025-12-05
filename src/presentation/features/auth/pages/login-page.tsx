import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLogin } from '@/presentation/features/auth/hooks/use-login'

const loginSchema = z.object({
  email: z
    .string({ required_error: 'El correo es obligatorio.' })
    .email('Ingresa un correo válido.'),
  password: z
    .string({ required_error: 'La contraseña es obligatoria.' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
  rememberMe: z.boolean().default(false),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoading, error, mustChangePassword, failureReason } =
    useLogin()

  const fromPath = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from ?? '/'
  }, [location.state])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    const result = await login(values)
    if (result.success) {
      navigate(fromPath, { replace: true })
      return
    }

    if (result.mustChangePassword) {
      navigate('/auth/force-change-password', {
        state: {
          email: values.email,
          currentPassword: values.password,
          rememberMe: values.rememberMe,
          message:
            failureReason ??
            'Debes actualizar tu contraseña antes de continuar.',
        },
        replace: true,
      })
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-100 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-2xl shadow-primary/5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Empresa
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Ingresa tus credenciales para acceder al panel. Soporta tema claro y
            oscuro.
          </p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email ? (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password ? (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-start gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 focus:ring-offset-0 dark:border-slate-600 dark:bg-slate-950 dark:focus:ring-primary/60"
                {...register('rememberMe')}
                disabled={isLoading}
              />
              Recordarme
            </label>
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : null}

          {mustChangePassword ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100">
              Se requiere actualizar la contraseña antes de continuar.
            </div>
          ) : null}

          <button
            type="submit"
            className="btn-primary w-full py-2.5 text-base shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
