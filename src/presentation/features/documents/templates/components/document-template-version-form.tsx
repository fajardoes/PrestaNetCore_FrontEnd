import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  documentTemplateVersionSchema,
  type DocumentTemplateVersionFormValues,
} from '@/infrastructure/validations/documents/document-template-admin.schema'
import type {
  DocumentTemplateVersionDetailDto,
  DocumentTemplateVersionDraftRequestDto,
  DocumentTemplateVersionSummaryDto,
  DocumentVariableCatalogItemDto,
} from '@/infrastructure/documents/dtos/document-template-admin.dto'
import { DocumentRichTextEditor } from '@/presentation/features/documents/templates/components/document-rich-text-editor'

type FragmentKey = 'bodyHtml' | 'headerHtml' | 'footerHtml'

interface DocumentTemplateVersionFormProps {
  version: DocumentTemplateVersionDetailDto
  versions: DocumentTemplateVersionSummaryDto[]
  variables: DocumentVariableCatalogItemDto[]
  rootContext: string
  canManage: boolean
  canPublish: boolean
  isProcessing: boolean
  canPreview: boolean
  operationMessage: string | null
  onSave: (payload: DocumentTemplateVersionDraftRequestDto) => Promise<void>
  onValidate: (payload: DocumentTemplateVersionDraftRequestDto) => Promise<void>
  onPreviewHtml: (payload: DocumentTemplateVersionDraftRequestDto) => Promise<void>
  onPreviewPdf: (payload: DocumentTemplateVersionDraftRequestDto) => Promise<void>
  onPublish: (payload: DocumentTemplateVersionDraftRequestDto) => Promise<void>
  onSelectVersion: (versionId: string) => void
}

const fragmentTabs: { key: FragmentKey; label: string; description: string }[] = [
  { key: 'bodyHtml', label: 'Contenido', description: 'Contenido principal del documento; requerido.' },
  { key: 'headerHtml', label: 'Encabezado', description: 'Opcional. Se imprime antes del contenido principal.' },
  { key: 'footerHtml', label: 'Pie', description: 'Opcional. Se imprime después del contenido principal.' },
]

export const DocumentTemplateVersionForm = ({
  version,
  versions,
  variables,
  rootContext,
  canManage,
  canPublish,
  isProcessing,
  canPreview,
  operationMessage,
  onSave,
  onValidate,
  onPreviewHtml,
  onPreviewPdf,
  onPublish,
  onSelectVersion,
}: DocumentTemplateVersionFormProps) => {
  const [activeFragment, setActiveFragment] = useState<FragmentKey>('bodyHtml')
  const { register, control, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm<DocumentTemplateVersionFormValues>({
    resolver: yupResolver(documentTemplateVersionSchema),
    defaultValues: toFormValues(version),
  })

  useEffect(() => {
    reset(toFormValues(version))
  }, [reset, version])

  const isDraft = version.status === 'DRAFT'
  const editable = canManage && isDraft
  const requiredCodes = watch('requiredVariableCodes') ?? []
  const requiredVariables = useMemo(
    () => variables.filter((item) => !item.isCollection),
    [variables],
  )
  const requiredVariableGroups = useMemo(() => {
    const groups = new Map<string, DocumentVariableCatalogItemDto[]>()
    for (const variable of requiredVariables) {
      const group = groups.get(variable.category) ?? []
      group.push(variable)
      groups.set(variable.category, group)
    }

    return Array.from(groups, ([category, items]) => ({ category, items }))
  }, [requiredVariables])
  const submit = (action: (payload: DocumentTemplateVersionDraftRequestDto) => Promise<void>) =>
    handleSubmit(async (values) => action(toDraftRequest(values)))
  const hasBodyContent = hasRenderableContent(watch('bodyHtml'))

  const toggleRequiredCode = (code: string, checked: boolean) => {
    const nextCodes = checked
      ? Array.from(new Set([...requiredCodes, code]))
      : requiredCodes.filter((item) => item !== code)
    setValue('requiredVariableCodes', nextCodes, { shouldDirty: true, shouldValidate: true })
  }
  const submitFromButton = (action: (payload: DocumentTemplateVersionDraftRequestDto) => Promise<void>) =>
    () => { void submit(action)() }

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Versión {version.versionNumber}</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Estado: <StatusLabel status={version.status} /> · {isDraft ? 'Los cambios se guardan en esta versión borrador.' : 'Esta versión es de solo lectura.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="document-version-select">Elegir versión</label>
          <select
            id="document-version-select"
            value={version.id}
            onChange={(event) => onSelectVersion(event.target.value)}
            disabled={isDirty || isProcessing}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {versions.map((item) => (
              <option key={item.id} value={item.id}>v{item.versionNumber} · {statusText(item.status)}</option>
            ))}
          </select>
        </div>
      </div>

      {operationMessage ? <p role="status" className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/50 dark:text-sky-100">{operationMessage}</p> : null}

      <form className="space-y-3" onSubmit={submit(onSave)}>
        <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800" role="tablist" aria-label="Fragmentos de plantilla">
          {fragmentTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeFragment === tab.key}
              onClick={() => setActiveFragment(tab.key)}
              className={`rounded-t-lg border-b-2 px-3 py-1.5 text-sm font-medium ${activeFragment === tab.key
                ? 'border-sky-600 text-sky-800 dark:text-sky-200'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {fragmentTabs.map((tab) => (
          <div key={tab.key} role="tabpanel" hidden={activeFragment !== tab.key} className="space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">{tab.description}</p>
            <Controller
              control={control}
              name={tab.key}
              render={({ field }) => (
                <DocumentRichTextEditor
                  label={tab.label}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  variables={variables}
                  rootContext={rootContext}
                  disabled={!editable}
                />
              )}
            />
            {errors[tab.key] ? <p className="text-xs text-red-600 dark:text-red-300">{errors[tab.key]?.message}</p> : null}
          </div>
        ))}

        <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Página y márgenes</h3>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1 text-xs font-medium text-slate-700 dark:text-slate-300">Tamaño
                <select {...register('pageSize')} disabled={!editable} className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950">
                  <option value="LETTER">Carta (LETTER)</option><option value="LEGAL">Oficio (LEGAL)</option><option value="A4">A4</option>
                </select>
              </label>
              <label className="space-y-1 text-xs font-medium text-slate-700 dark:text-slate-300">Orientación
                <select {...register('orientation')} disabled={!editable} className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950">
                  <option value="PORTRAIT">Vertical</option><option value="LANDSCAPE">Horizontal</option>
                </select>
              </label>
              {marginFields.map((field) => (
                <label key={field.name} className="space-y-1 text-xs font-medium text-slate-700 dark:text-slate-300">{field.label} (mm)
                  <input
                    {...register(field.name, { valueAsNumber: true })}
                    type="number" min="0" step="0.1" disabled={!editable}
                    className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm tabular-nums dark:border-slate-700 dark:bg-slate-950"
                  />
                  {errors[field.name] ? <span className="block text-xs text-red-600 dark:text-red-300">{errors[field.name]?.message}</span> : null}
                </label>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Los márgenes se almacenan en milímetros.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Variables requeridas</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Marca solo los datos indispensables. Cada variable marcada debe aparecer en el contenido, encabezado o pie y tener un valor al generar el documento.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Si falta ese valor, la generación falla; si el documento es un requisito PRE obligatorio, también puede bloquear el desembolso. Una variable no marcada no bloquea la generación y, si falta, normalmente se verá vacía.
            </p>
            <p className="text-xs text-sky-700 dark:text-sky-300">
              Esta casilla no inserta la variable: agrega su chip desde «Insertar variable…» en el editor.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              La lista está agrupada con las mismas categorías del selector de variables.
            </p>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
              {requiredVariables.length === 0 ? <p className="p-2 text-xs text-slate-500 dark:text-slate-400">No hay variables disponibles para este contexto.</p> : null}
              {requiredVariableGroups.map((group) => (
                <section key={group.category} className="mb-2 last:mb-0">
                  <h4 className="sticky top-0 border-b border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                    {group.category}
                  </h4>
                  {group.items.map((item) => (
                    <label key={item.code} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900">
                      <input type="checkbox" checked={requiredCodes.includes(item.code)} disabled={!editable} onChange={(event) => toggleRequiredCode(item.code, event.target.checked)} className="rounded border-slate-300 text-sky-600 dark:border-slate-700 dark:bg-slate-900" />
                      <span className="min-w-0 flex-1 font-medium">{item.displayName}</span>
                      <span className="inline-flex max-w-[55%] truncate rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 font-mono text-[10px] text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200">
                        {item.code}
                      </span>
                    </label>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </div>

        {version.validation ? (
          <ValidationSummary isValid={version.validation.isValid} errors={version.validation.errors} />
        ) : null}
        {!hasBodyContent ? <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">Agrega texto, un chip de variable o la tabla controlada antes de validar, previsualizar o publicar.</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
          <p className="max-w-2xl text-xs text-slate-500 dark:text-slate-400">Las vistas previa HTML y PDF usan datos sintéticos y son temporales; no crean documentos oficiales.</p>
          <div className="flex flex-wrap justify-end gap-2">
            {editable ? <button type="submit" disabled={isProcessing || !isDirty} className="btn-primary px-3 py-2 text-sm disabled:opacity-50">{isProcessing ? 'Procesando…' : 'Guardar borrador'}</button> : null}
            {editable ? <button type="button" disabled={isProcessing || isDirty} onClick={submitFromButton(onValidate)} className="btn-secondary px-3 py-2 text-sm disabled:opacity-50">Validar</button> : null}
            {canManage && canPreview ? <button type="button" disabled={isProcessing || isDirty || !hasBodyContent || !version.validation?.isValid} onClick={submitFromButton(onPreviewHtml)} className="btn-secondary px-3 py-2 text-sm disabled:opacity-50">Vista previa HTML</button> : null}
            {canManage && canPreview ? <button type="button" disabled={isProcessing || isDirty || !hasBodyContent || !version.validation?.isValid} onClick={submitFromButton(onPreviewPdf)} className="btn-secondary px-3 py-2 text-sm disabled:opacity-50">Vista previa PDF</button> : null}
            {canPublish && isDraft ? <button type="button" disabled={isProcessing || isDirty || !hasBodyContent} onClick={submitFromButton(onPublish)} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-500">Publicar</button> : null}
          </div>
        </div>
      </form>
    </section>
  )
}

const marginFields: { name: 'marginTopMm' | 'marginRightMm' | 'marginBottomMm' | 'marginLeftMm'; label: string }[] = [
  { name: 'marginTopMm', label: 'Superior' },
  { name: 'marginRightMm', label: 'Derecho' },
  { name: 'marginBottomMm', label: 'Inferior' },
  { name: 'marginLeftMm', label: 'Izquierdo' },
]

const toFormValues = (version: DocumentTemplateVersionDetailDto): DocumentTemplateVersionFormValues => ({
  bodyHtml: version.bodyHtml,
  headerHtml: version.headerHtml ?? '',
  footerHtml: version.footerHtml ?? '',
  pageSize: version.pageSize as DocumentTemplateVersionFormValues['pageSize'],
  orientation: version.orientation as DocumentTemplateVersionFormValues['orientation'],
  marginTopMm: version.marginTopMm,
  marginRightMm: version.marginRightMm,
  marginBottomMm: version.marginBottomMm,
  marginLeftMm: version.marginLeftMm,
  requiredVariableCodes: version.requiredVariableCodes ?? [],
})

const toDraftRequest = (values: DocumentTemplateVersionFormValues): DocumentTemplateVersionDraftRequestDto => ({
  bodyHtml: values.bodyHtml,
  headerHtml: values.headerHtml || null,
  footerHtml: values.footerHtml || null,
  pageSize: values.pageSize as DocumentTemplateVersionDraftRequestDto['pageSize'],
  orientation: values.orientation as DocumentTemplateVersionDraftRequestDto['orientation'],
  marginTopMm: values.marginTopMm,
  marginRightMm: values.marginRightMm,
  marginBottomMm: values.marginBottomMm,
  marginLeftMm: values.marginLeftMm,
  requiredVariableCodes: values.requiredVariableCodes ?? [],
})

const statusText = (status: string) => ({ DRAFT: 'Borrador', PUBLISHED: 'Publicada', SUPERSEDED: 'Reemplazada', RETIRED: 'Retirada' }[status] ?? status)

const hasRenderableContent = (value: string | undefined) =>
  (value ?? '').replace(/<[^>]*>/g, '').replace(/&nbsp;|&#160;/gi, ' ').trim().length > 0

const StatusLabel = ({ status }: { status: string }) => (
  <span className="font-semibold text-slate-800 dark:text-slate-200">{statusText(status)}</span>
)

const ValidationSummary = ({ isValid, errors: validationErrors }: { isValid: boolean; errors: string[] }) => (
  <div className={`rounded-xl border p-3 ${isValid ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100' : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100'}`}>
    <h3 className="text-sm font-semibold">{isValid ? 'Validación del backend aprobada' : 'La versión necesita ajustes'}</h3>
    {validationErrors.length > 0 ? <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">{validationErrors.map((error, index) => <li key={`${index}-${error}`}>{error}</li>)}</ul> : null}
  </div>
)
