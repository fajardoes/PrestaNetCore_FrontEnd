import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, RotateCcw, Save, Trash2 } from 'lucide-react'
import { useLoanProductDocumentRequirements } from '@/presentation/features/loans/products/hooks/use-loan-product-document-requirements'
import type {
  DocumentGenerationTiming,
  LoanProductDocumentRequirementDto,
  LoanProductDocumentRequirementUpdateItemDto,
} from '@/infrastructure/loans/dtos/loan-products/loan-product-document-requirement.dto'

interface LoanProductDocumentRequirementsEditorProps {
  productId: string
  canManage: boolean
}

const timingOptions: Array<{ value: DocumentGenerationTiming; label: string }> = [
  { value: 'PRE_DISBURSEMENT', label: 'Antes del desembolso' },
  { value: 'POST_DISBURSEMENT', label: 'Después del desembolso' },
  { value: 'ON_DEMAND', label: 'Bajo demanda' },
]

const toUpdateItem = (
  requirement: LoanProductDocumentRequirementDto,
): LoanProductDocumentRequirementUpdateItemDto => ({
  documentTemplateId: requirement.documentTemplateId,
  isRequired: requirement.isRequired,
  generationTiming: requirement.generationTiming,
  displayOrder: requirement.displayOrder,
  applicabilityRuleCode: null,
})

const normalizeOrder = (items: LoanProductDocumentRequirementUpdateItemDto[]) =>
  items.map((item, index) => ({ ...item, displayOrder: index }))

const eventLabel: Record<string, string> = {
  REQUIREMENT_ADDED: 'Requisito agregado',
  REQUIREMENT_UPDATED: 'Requisito actualizado',
  REQUIREMENT_DEACTIVATED: 'Requisito desactivado',
  REQUIREMENT_REACTIVATED: 'Requisito reactivado',
}

export const LoanProductDocumentRequirementsEditor = ({
  productId,
  canManage,
}: LoanProductDocumentRequirementsEditorProps) => {
  const { requirements, templates, events, isLoading, isSaving, error, reload, save } =
    useLoanProductDocumentRequirements(productId, canManage)
  const [draft, setDraft] = useState<LoanProductDocumentRequirementUpdateItemDto[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    if (requirements) {
      setDraft(requirements.requirements.filter((item) => item.isActive).map(toUpdateItem))
    }
  }, [requirements])

  const activeRequirements = requirements?.requirements.filter((item) => item.isActive) ?? []
  const inactiveRequirements = requirements?.requirements.filter((item) => !item.isActive) ?? []
  const activeIds = useMemo(() => new Set(draft.map((item) => item.documentTemplateId)), [draft])
  const original = activeRequirements.map(toUpdateItem)
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(original)
  const isProductActive = requirements?.productIsActive ?? false

  const addSelectedTemplate = () => {
    if (!selectedTemplateId) {
      const hasAvailableTemplate = templates.some(
        (item) => item.isOperationallyReady && !activeIds.has(item.id),
      )
      setSelectionError(
        hasAvailableTemplate
          ? 'Selecciona una plantilla para agregarla.'
          : 'No hay plantillas publicadas disponibles para agregar.',
      )
      return
    }

    const template = templates.find((item) => item.id === selectedTemplateId)
    if (!template || !template.isOperationallyReady || activeIds.has(template.id)) {
      setSelectionError('La plantilla seleccionada ya no está disponible para agregar.')
      return
    }

    const inactive = inactiveRequirements.find((item) => item.documentTemplateId === template.id)
    const nextItem: LoanProductDocumentRequirementUpdateItemDto = inactive
      ? toUpdateItem(inactive)
      : {
          documentTemplateId: template.id,
          isRequired: false,
          generationTiming: 'ON_DEMAND',
          displayOrder: draft.length,
          applicabilityRuleCode: null,
        }
    setDraft((current) => [
      ...current,
      { ...nextItem, displayOrder: Math.max(-1, ...current.map((item) => item.displayOrder)) + 1 },
    ])
    setSelectedTemplateId('')
    setSelectionError(null)
    setSaveMessage(null)
  }

  const reactivate = (item: LoanProductDocumentRequirementDto) => {
    const template = templates.find((option) => option.id === item.documentTemplateId)
    if (!template?.isOperationallyReady || !isProductActive) return
    setDraft((current) => [...current, { ...toUpdateItem(item), displayOrder: current.length }])
    setSaveMessage(null)
  }

  const move = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= draft.length) return
    setDraft((current) => {
      const reordered = [...current]
      const [moved] = reordered.splice(index, 1)
      reordered.splice(targetIndex, 0, moved)
      return normalizeOrder(reordered)
    })
    setSaveMessage(null)
  }

  const handleSave = async () => {
    setSaveMessage(null)
    const desiredRequirements = isProductActive ? normalizeOrder(draft) : draft
    const succeeded = await save({ requirements: desiredRequirements })
    if (succeeded) setSaveMessage('Requisitos documentales guardados.')
  }

  if (isLoading && !requirements) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Cargando requisitos documentales…</p>
  }

  if (error && !requirements) {
    return (
      <div className="space-y-3">
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>
        <button type="button" className="btn-secondary text-sm" onClick={() => void reload()}>Reintentar</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-100">
        La versión publicada se define al generar el documento.
      </div>

      {!isProductActive ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          El producto está inactivo. Puedes revisar o retirar requisitos, pero no agregar o reactivar asociaciones.
        </p>
      ) : null}

      {canManage ? (
        <div className="space-y-1.5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              aria-label="Seleccionar plantilla documental"
              aria-describedby={selectionError ? 'document-template-selection-error' : undefined}
              aria-invalid={selectionError ? true : undefined}
              value={selectedTemplateId}
              onChange={(event) => {
                setSelectedTemplateId(event.target.value)
                setSelectionError(null)
              }}
              className={`min-w-0 flex-1 rounded-md border bg-white px-3 py-2 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-100 ${selectionError ? 'border-red-500 dark:border-red-400' : 'border-slate-300 dark:border-slate-700'}`}
              disabled={!isProductActive || isSaving}
            >
              <option value="">Selecciona una plantilla publicada</option>
              {templates.map((template) => {
                const activeDuplicate = activeIds.has(template.id)
                const label = `${template.name} · ${template.documentTypeName} · ${template.context}${template.publishedVersionNumber ? ` · v${template.publishedVersionNumber}` : ' · Sin versión publicada'}`
                return (
                  <option key={template.id} value={template.id} disabled={!template.isOperationallyReady || activeDuplicate}>
                    {label}
                  </option>
                )
              })}
            </select>
            <button
              type="button"
              className="btn-secondary inline-flex items-center justify-center gap-2 text-sm"
              onClick={addSelectedTemplate}
              disabled={!isProductActive || isSaving}
            >
              Agregar
            </button>
          </div>
          {selectionError ? (
            <p id="document-template-selection-error" role="alert" className="text-xs text-red-600 dark:text-red-300">
              {selectionError}
            </p>
          ) : null}
        </div>
      ) : null}

      {templates.some((item) => !item.isOperationallyReady) ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          Las plantillas sin tipo activo o sin versión publicada se muestran como referencia, pero no pueden asociarse todavía.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="min-w-[980px] w-full divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2 font-semibold">Plantilla / tipo</th>
              <th className="px-3 py-2 font-semibold">Contexto</th>
              <th className="px-3 py-2 font-semibold">Versión publicada</th>
              <th className="px-3 py-2 font-semibold">Momento</th>
              <th className="px-3 py-2 font-semibold">Obligatorio</th>
              <th className="px-3 py-2 font-semibold">Orden</th>
              <th className="px-3 py-2 font-semibold">Estado</th>
              {canManage ? <th className="px-3 py-2 font-semibold">Acciones</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-950">
            {draft.map((item, index) => {
              const configured = activeRequirements.find((entry) => entry.documentTemplateId === item.documentTemplateId)
              const template = templates.find((entry) => entry.id === item.documentTemplateId)
              const context = configured?.context ?? template?.context ?? '—'
              const ready = configured?.isOperationallyReady ?? template?.isOperationallyReady ?? false
              return (
                <tr key={item.documentTemplateId}>
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-100">
                    <div className="font-medium">{configured?.templateName ?? template?.name ?? item.documentTemplateId}</div>
                    <div className="text-slate-500 dark:text-slate-400">{configured?.documentTypeName ?? template?.documentTypeName ?? 'Tipo documental no disponible'}</div>
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{context}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                    {configured?.publishedVersionNumber ?? template?.publishedVersionNumber
                      ? `v${configured?.publishedVersionNumber ?? template?.publishedVersionNumber}`
                      : 'Sin versión publicada'}
                  </td>
                  <td className="px-3 py-2">
                    <select
                      aria-label={`Momento de generación para ${configured?.templateName ?? template?.name ?? 'plantilla'}`}
                      value={item.generationTiming}
                      onChange={(event) => {
                        const generationTiming = event.target.value as DocumentGenerationTiming
                        setDraft((current) => current.map((value) => value.documentTemplateId === item.documentTemplateId ? { ...value, generationTiming } : value))
                        setSaveMessage(null)
                      }}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                      disabled={!canManage || isSaving || !isProductActive}
                    >
                      {timingOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Requisito obligatorio para ${configured?.templateName ?? template?.name ?? 'plantilla'}`}
                      checked={item.isRequired}
                      onChange={(event) => {
                        setDraft((current) => current.map((value) => value.documentTemplateId === item.documentTemplateId ? { ...value, isRequired: event.target.checked } : value))
                        setSaveMessage(null)
                      }}
                      disabled={!canManage || isSaving || !isProductActive}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-700"
                    />
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{index + 1}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-1 font-medium ${ready ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200'}`}>
                      {ready ? 'Operativa' : 'Requiere atención'}
                    </span>
                  </td>
                  {canManage ? (
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button type="button" className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Subir requisito" onClick={() => move(index, -1)} disabled={index === 0 || isSaving || !isProductActive}><ArrowUp className="h-4 w-4" /></button>
                        <button type="button" className="rounded p-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800" aria-label="Bajar requisito" onClick={() => move(index, 1)} disabled={index === draft.length - 1 || isSaving || !isProductActive}><ArrowDown className="h-4 w-4" /></button>
                        <button type="button" className="rounded p-1 text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-500/10" aria-label="Desactivar requisito" onClick={() => { setDraft((current) => { const remaining = current.filter((value) => value.documentTemplateId !== item.documentTemplateId); return isProductActive ? normalizeOrder(remaining) : remaining }); setSaveMessage(null) }} disabled={isSaving}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              )
            })}
            {draft.length === 0 ? (
              <tr><td colSpan={canManage ? 8 : 7} className="px-3 py-8 text-center text-slate-500 dark:text-slate-400">No hay requisitos documentales activos para este producto.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {inactiveRequirements.length > 0 ? (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-200">Asociaciones inactivas</h3>
          <ul className="space-y-2">
            {inactiveRequirements.map((item) => {
              const template = templates.find((option) => option.id === item.documentTemplateId)
              const canReactivate = canManage && isProductActive && Boolean(template?.isOperationallyReady) && !activeIds.has(item.documentTemplateId)
              return (
                <li key={item.id} className="flex flex-col gap-2 rounded-md border border-slate-200 p-3 text-xs dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-slate-700 dark:text-slate-300">{item.templateName} · {item.documentTypeName} · {item.context} · Inactiva</span>
                  {canManage ? <button type="button" className="btn-secondary inline-flex items-center justify-center gap-1 text-xs" onClick={() => reactivate(item)} disabled={!canReactivate || isSaving}><RotateCcw className="h-3.5 w-3.5" /> Reactivar</button> : null}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {canManage ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p aria-live="polite" className="text-xs text-slate-500 dark:text-slate-400">
            {error ?? saveMessage ?? (hasChanges ? 'Hay cambios documentales sin guardar.' : 'Sin cambios pendientes.')}
          </p>
          <button type="button" className="btn-primary inline-flex items-center justify-center gap-2 text-sm" onClick={() => void handleSave()} disabled={!hasChanges || isSaving || !requirements}>
            <Save className="h-4 w-4" /> {isSaving ? 'Guardando…' : 'Guardar requisitos'}
          </button>
        </div>
      ) : null}

      <details className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
        <summary className="cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-200">Historial de cambios</summary>
        <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
          {events.map((event) => (
            <li key={event.id} className="border-l-2 border-slate-200 pl-3 dark:border-slate-700">
              <span className="font-medium">{eventLabel[event.eventType] ?? event.eventType}</span> · {event.templateName} · {new Date(event.occurredAt).toLocaleString('es-HN', { timeZone: 'America/Tegucigalpa' })}
            </li>
          ))}
          {events.length === 0 ? <li>No hay cambios registrados.</li> : null}
        </ul>
      </details>
    </div>
  )
}
