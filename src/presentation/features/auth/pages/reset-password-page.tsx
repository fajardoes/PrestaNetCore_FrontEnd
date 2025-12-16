import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  requestPasswordResetAction,
  resetPasswordWithTokenAction,
} from '@/core/actions/auth/reset-password.action'

const requestSchema = z.object({
  email: z
    .string({ required_error: 'El correo es obligatorio.' })
    .email('Ingresa un correo válido.'),
})

const resetSchema = z
  .object({
    email: z
      .string({ required_error: 'El correo es obligatorio.' })
      .email('Ingresa un correo válido.'),
    token: z
      .string({ required_error: 'El token es obligatorio.' })
      .min(10, 'El token no es válido.'),
    newPassword: z
      .string({ required_error: 'La nueva contraseña es obligatoria.' })
      .min(8, 'Debe tener al menos 8 caracteres.'),
    confirmPassword: z
      .string({ required_error: 'Confirma la contraseña.' })
      .min(8, 'Debe tener al menos 8 caracteres.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })

type RequestValues = z.infer<typeof requestSchema>
type ResetValues = z.infer<typeof resetSchema>

export const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tokenFromQuery = searchParams.get('token') ?? ''
  const emailFromQuery = searchParams.get('email') ?? ''
  const isResetMode = useMemo(() => Boolean(tokenFromQuery), [tokenFromQuery])

  const [requestMessage, setRequestMessage] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors: requestErrors },
  } = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: '' },
  })

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: emailFromQuery,
      token: tokenFromQuery,
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onRequestSubmit = handleSubmit(async (values) => {
    setRequestError(null)
    setRequestMessage(null)
    setIsRequesting(true)
    const result = await requestPasswordResetAction(values)
    if (result.success) {
      setRequestMessage(
        'Si el correo existe, recibirás un enlace con instrucciones.',
      )
    } else {
      setRequestError(result.error)
    }
    setIsRequesting(false)
  })

  const onResetSubmit = handleResetSubmit(async (values) => {
    setResetError(null)
    setResetMessage(null)
    setIsResetting(true)
    const result = await resetPasswordWithTokenAction(values)
    if (result.success) {
      setResetMessage(
        'Contraseña actualizada. Ahora puedes iniciar sesión con tus nuevas credenciales.',
      )
      setTimeout(() => {
        navigate('/auth/login', { replace: true })
      }, 600)
    } else {
      setResetError(result.error)
    }
    setIsResetting(false)
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-100 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-primary/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
          <div className="h-full bg-gradient-to-br from-primary via-primary/80 to-amber-500 p-8 text-white dark:from-primary/80 dark:via-primary/60 dark:to-amber-500/80">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">
              Seguridad
            </p>
            <h1 className="mt-3 text-2xl font-bold">
              Recupera el acceso a tu cuenta
            </h1>
            <p className="mt-2 text-sm text-white/80">
              Restablece tu contraseña con el token recibido o solicita un nuevo
              enlace. La interfaz soporta tema claro y oscuro.
            </p>
            <div className="mt-6 rounded-xl border border-white/20 bg-white/10 p-4 text-sm backdrop-blur">
              <p className="font-semibold">¿Cómo funciona?</p>
              <ol className="mt-2 space-y-2 text-white/90">
                <li>
                  1. Solicita un enlace de restablecimiento usando tu correo.
                </li>
                <li>
                  2. Abre el enlace para obtener el token base64 o pégalo
                  manualmente.
                </li>
                <li>
                  3. Define tu nueva contraseña y regresa al inicio de sesión.
                </li>
              </ol>
            </div>
          </div>

          <div className="p-8">
            {!isResetMode ? (
              <form className="space-y-5" onSubmit={onRequestSubmit} noValidate>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                    Paso 1
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">
                    Solicitar enlace
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Ingresa tu correo para recibir un token de restablecimiento.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="request-email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="request-email"
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                    {...register('email')}
                    disabled={isRequesting}
                  />
                  {requestErrors.email ? (
                    <p className="text-xs text-red-500">
                      {requestErrors.email.message}
                    </p>
                  ) : null}
                </div>

                {requestError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
                    {requestError}
                  </div>
                ) : null}

                {requestMessage ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-100">
                    {requestMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 text-base shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isRequesting}
                >
                  {isRequesting ? 'Enviando...' : 'Enviar enlace'}
                </button>

                <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                  ¿Ya tienes un token?{' '}
                  <Link
                    to="/auth/reset-password?token="
                    className="font-semibold text-primary hover:underline"
                  >
                    Ingresa aquí
                  </Link>
                </div>
              </form>
            ) : (
              <form className="space-y-5" onSubmit={onResetSubmit} noValidate>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                    Paso 2
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">
                    Restablecer contraseña
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Pega el token base64 y define tu nueva contraseña.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="reset-email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                    {...registerReset('email')}
                    disabled={isResetting}
                  />
                  {resetErrors.email ? (
                    <p className="text-xs text-red-500">
                      {resetErrors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="token"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Token (base64)
                  </label>
                  <textarea
                    id="token"
                    rows={3}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                    {...registerReset('token')}
                    disabled={isResetting}
                  />
                  {resetErrors.token ? (
                    <p className="text-xs text-red-500">
                      {resetErrors.token.message}
                    </p>
                  ) : null}
                </div>

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
                    {...registerReset('newPassword')}
                    disabled={isResetting}
                  />
                  {resetErrors.newPassword ? (
                    <p className="text-xs text-red-500">
                      {resetErrors.newPassword.message}
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
                    {...registerReset('confirmPassword')}
                    disabled={isResetting}
                  />
                  {resetErrors.confirmPassword ? (
                    <p className="text-xs text-red-500">
                      {resetErrors.confirmPassword.message}
                    </p>
                  ) : null}
                </div>

                {resetError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
                    {resetError}
                  </div>
                ) : null}

                {resetMessage ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-500/10 dark:text-emerald-100">
                    {resetMessage}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 text-base shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isResetting}
                >
                  {isResetting ? 'Guardando...' : 'Restablecer contraseña'}
                </button>

                <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                  ¿No tienes token?{' '}
                  <Link
                    to="/auth/reset-password"
                    className="font-semibold text-primary hover:underline"
                  >
                    Solicítalo aquí
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
