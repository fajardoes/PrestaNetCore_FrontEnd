import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNotifications } from '@/providers/NotificationProvider'
import type { OrganizationProfileUpdateDto } from '@/infrastructure/interfaces/organization/organization-profile/organization-profile.dto'
import { useOrganizationProfile } from '@/presentation/features/organization/hooks/use-organization-profile'

const emptyForm: OrganizationProfileUpdateDto = {
  legalName: '',
  commercialName: '',
  rtn: '',
  address: '',
  phone: '',
  email: '',
  legalRepresentativeName: '',
  legalRepresentativeIdentity: '',
}

const fields: Array<{
  name: keyof OrganizationProfileUpdateDto
  label: string
  required?: boolean
  type?: 'text' | 'email' | 'tel'
  maxLength: number
  wide?: boolean
}> = [
  { name: 'legalName', label: 'Razón social', required: true, maxLength: 200 },
  { name: 'commercialName', label: 'Nombre comercial', maxLength: 200 },
  { name: 'rtn', label: 'RTN', required: true, maxLength: 20 },
  { name: 'phone', label: 'Teléfono institucional', required: true, type: 'tel', maxLength: 50 },
  { name: 'address', label: 'Dirección institucional', required: true, maxLength: 500, wide: true },
  { name: 'email', label: 'Correo electrónico', type: 'email', maxLength: 254 },
  { name: 'legalRepresentativeName', label: 'Representante legal', required: true, maxLength: 200 },
  {
    name: 'legalRepresentativeIdentity',
    label: 'Identidad del representante legal',
    required: true,
    maxLength: 50,
  },
]

export const OrganizationProfilePage = () => {
  const { notify } = useNotifications()
  const {
    profile,
    isLoading,
    isSaving,
    isUploadingLogo,
    isRemovingLogo,
    error,
    setError,
    refresh,
    save,
    uploadLogo,
    removeLogo,
  } = useOrganizationProfile()
  const [form, setForm] = useState<OrganizationProfileUpdateDto>(emptyForm)

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!profile) return
    setForm({
      legalName: profile.legalName ?? '',
      commercialName: profile.commercialName ?? '',
      rtn: profile.rtn ?? '',
      address: profile.address ?? '',
      phone: profile.phone ?? '',
      email: profile.email ?? '',
      legalRepresentativeName: profile.legalRepresentativeName ?? '',
      legalRepresentativeIdentity: profile.legalRepresentativeIdentity ?? '',
    })
  }, [profile])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const requiredFields: Array<[keyof OrganizationProfileUpdateDto, string]> = [
      ['legalName', 'La razón social'],
      ['rtn', 'El RTN'],
      ['address', 'La dirección institucional'],
      ['phone', 'El teléfono institucional'],
      ['legalRepresentativeName', 'El representante legal'],
      ['legalRepresentativeIdentity', 'La identidad del representante legal'],
    ]
    const missing = requiredFields.find(([name]) => !form[name]?.trim())
    if (missing) {
      setError(`${missing[1]} es obligatoria.`)
      return
    }

    const normalizedEmail = form.email?.trim() || null
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Ingresa un correo electrónico válido o deja el campo vacío.')
      return
    }

    const result = await save({
      legalName: form.legalName.trim(),
      commercialName: form.commercialName?.trim() || null,
      rtn: form.rtn.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: normalizedEmail,
      legalRepresentativeName: form.legalRepresentativeName.trim(),
      legalRepresentativeIdentity: form.legalRepresentativeIdentity.trim(),
    })
    if (result.success) {
      notify('Los datos institucionales se guardaron correctamente.', 'success')
    }
  }

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!['png', 'jpg', 'jpeg'].includes(extension ?? '')) {
      setError('Selecciona una imagen PNG o JPEG.')
      input.value = ''
      return
    }

    const result = await uploadLogo(file)
    if (result.success) {
      notify('El logo para reportes se cargó correctamente.', 'success')
    }
    input.value = ''
  }

  const handleRemoveLogo = async () => {
    const result = await removeLogo()
    if (result.success) {
      notify('Se quitó la referencia al logo de reportes.', 'success')
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Cargando configuración institucional…
      </div>
    )
  }

  if (!profile && error) {
    return (
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-100">
        <p className="font-semibold">No se pudo abrir la configuración institucional</p>
        <p className="text-sm">{error}</p>
        <button type="button" className="btn-secondary btn-list-action" onClick={() => void refresh()}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Datos institucionales</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Información de la institución utilizada en documentos y reportes.
        </p>
      </header>

      {error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <form
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        onSubmit={handleSubmit}
      >
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Información de la institución</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Los campos marcados con * son necesarios para completar el perfil.
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              profile?.isConfigured
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200'
            }`}>
              {profile?.isConfigured ? 'Configuración completa' : 'Pendiente de completar'}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field.name} className={`block space-y-1.5 ${field.wide ? 'md:col-span-2' : ''}`}>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {field.label}{field.required ? ' *' : ''}
                </span>
                <input
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
                  type={field.type ?? 'text'}
                  value={form[field.name] ?? ''}
                  maxLength={field.maxLength}
                  required={field.required}
                  autoComplete="off"
                  onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Logo para documentos y reportes</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Se almacena como documento institucional controlado. Solo se aceptan imágenes PNG o JPEG.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {profile?.reportLogoFileName ?? 'No hay un logo configurado'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">El logo del frontend no se configura aquí.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className={`btn-secondary btn-list-action cursor-pointer ${!profile?.isConfigured || isUploadingLogo || isSaving || isRemovingLogo ? 'pointer-events-none opacity-50' : ''}`}>
                {isUploadingLogo ? 'Cargando…' : profile?.reportLogoDocumentId ? 'Cambiar logo' : 'Cargar logo'}
                <input
                  className="sr-only"
                  type="file"
                  accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                  disabled={!profile?.isConfigured || isUploadingLogo || isSaving || isRemovingLogo}
                  onChange={(event) => void handleLogoChange(event)}
                />
              </label>
              {profile?.reportLogoDocumentId ? (
                <button
                  type="button"
                  className="btn-secondary btn-list-action disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => void handleRemoveLogo()}
                  disabled={isRemovingLogo || isUploadingLogo || isSaving}
                >
                  {isRemovingLogo ? 'Quitando…' : 'Quitar logo'}
                </button>
              ) : null}
            </div>
          </div>
          {!profile?.isConfigured ? (
            <p className="text-xs text-amber-700 dark:text-amber-300">Guarda primero los datos obligatorios para habilitar la carga del logo.</p>
          ) : null}
        </section>

        <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-800">
          <button type="submit" className="btn-primary btn-list-action" disabled={isSaving || isUploadingLogo || isRemovingLogo}>
            {isSaving ? 'Guardando…' : 'Guardar datos institucionales'}
          </button>
        </div>
      </form>
    </div>
  )
}
