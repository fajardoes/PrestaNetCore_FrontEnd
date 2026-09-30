import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { useDocumentTemplateEditor } from '@/presentation/features/documents/templates/hooks/use-document-template-editor'
import { DocumentTemplateMetadataForm } from '@/presentation/features/documents/templates/components/document-template-metadata-form'
import { DocumentTemplateVersionForm } from '@/presentation/features/documents/templates/components/document-template-version-form'
import { FilePreviewModal } from '@/presentation/share/components/file-preview-modal'
import type {
  DocumentTemplateMetadataFormValues,
} from '@/infrastructure/validations/documents/document-template-admin.schema'
import type { DocumentTemplateVersionDraftRequestDto } from '@/infrastructure/documents/dtos/document-template-admin.dto'

const readPermission = 'documents.templates.read'
const managePermission = 'documents.templates.manage'
const publishPermission = 'documents.templates.publish'
const variablesReadPermission = 'documents.variables.read'

const blankDraft: DocumentTemplateVersionDraftRequestDto = {
  bodyHtml: '<p></p>',
  headerHtml: null,
  footerHtml: null,
  pageSize: 'LETTER',
  orientation: 'PORTRAIT',
  marginTopMm: 15,
  marginRightMm: 15,
  marginBottomMm: 15,
  marginLeftMm: 15,
  requiredVariableCodes: [],
}

export const DocumentTemplateEditorPage = () => {
  const { templateId } = useParams<{ templateId: string }>()
  const { hasPermission, isLoading: isPermissionLoading } = useUserPermissions()
  const canRead = hasPermission(readPermission)
  const canManage = hasPermission(managePermission)
  const canPublish = hasPermission(publishPermission)
  const canReadVariables = hasPermission(variablesReadPermission)
  const editor = useDocumentTemplateEditor()
  const [operationMessage, setOperationMessage] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    if (canRead && templateId) void editor.load(templateId, canReadVariables)
  }, [canRead, canReadVariables, editor.load, templateId])

  useEffect(() => () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
  }, [pdfUrl])

  const handleMetadataSave = async (values: DocumentTemplateMetadataFormValues) => {
    if (!templateId) return
    const result = await editor.updateMetadata(templateId, {
      name: values.name.trim(),
      description: values.description.trim() || null,
      isActive: values.isActive,
    })
    setOperationMessage(result.success ? 'Se actualizaron los datos de la plantilla.' : null)
  }

  const handleCreateDraft = async () => {
    if (!templateId) return
    setOperationMessage(null)
    const result = await editor.createDraft(templateId, blankDraft)
    if (result.success) setOperationMessage(`Se creó la versión borrador ${result.data.versionNumber}.`)
  }

  const handleSave = async (payload: DocumentTemplateVersionDraftRequestDto) => {
    if (!templateId || !editor.version) return
    setOperationMessage(null)
    const result = await editor.saveDraft(templateId, editor.version.id, payload)
    if (result.success) setOperationMessage(`Se guardó la versión borrador ${result.data.versionNumber}.`)
  }

  const saveAndValidate = useCallback(async (payload: DocumentTemplateVersionDraftRequestDto) => {
    if (!templateId || !editor.version) return null
    const saved = await editor.saveDraft(templateId, editor.version.id, payload)
    if (!saved.success) return null
    const validation = await editor.validateDraft(templateId, saved.data.id, payload.requiredVariableCodes)
    if (!validation.success) return null
    return { versionId: saved.data.id, validation: validation.data }
  }, [editor, templateId])

  const handleValidate = async (payload: DocumentTemplateVersionDraftRequestDto) => {
    setOperationMessage(null)
    const result = await saveAndValidate(payload)
    if (result) setOperationMessage(result.validation.isValid ? 'La versión cumple las validaciones.' : 'La versión se validó; revisa los errores indicados antes de continuar.')
  }

  const handleHtmlPreview = async (payload: DocumentTemplateVersionDraftRequestDto) => {
    if (!templateId) return
    setOperationMessage(null)
    const saved = await saveAndValidate(payload)
    if (!saved || !saved.validation.isValid) {
      setOperationMessage('Corrige y valida la versión antes de abrir la vista previa.')
      return
    }
    const result = await editor.previewHtml(templateId, saved.versionId)
    if (result.success) {
      setPreviewHtml(result.data.html)
      setOperationMessage('Vista HTML temporal generada con datos sintéticos; no es un documento oficial.')
    }
  }

  const handlePdfPreview = async (payload: DocumentTemplateVersionDraftRequestDto) => {
    if (!templateId) return
    setOperationMessage(null)
    const saved = await saveAndValidate(payload)
    if (!saved || !saved.validation.isValid) {
      setOperationMessage('Corrige y valida la versión antes de generar el PDF temporal.')
      return
    }
    const result = await editor.previewPdf(templateId, saved.versionId)
    if (result.success) {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
      setPdfUrl(URL.createObjectURL(result.data))
      setOperationMessage('PDF temporal generado con datos sintéticos. No se almacenó ni se creó un documento oficial.')
    }
  }

  const handlePublish = async (payload: DocumentTemplateVersionDraftRequestDto) => {
    if (!templateId || !editor.version) return
    setOperationMessage(null)

    let versionId = editor.version.id
    if (canManage) {
      const saved = await saveAndValidate(payload)
      if (!saved) return
      if (!saved.validation.isValid) {
        setOperationMessage('No se publicó: la versión tiene errores de validación.')
        return
      }
      versionId = saved.versionId
    }
    const result = await editor.publish(templateId, versionId)
    if (result.success) {
      setOperationMessage(result.data.published
        ? `Se publicó la versión ${result.data.version.versionNumber}.`
        : `No se publicó: ${result.data.validation.errors.join(' ') || 'la versión no superó la validación del backend.'}`)
    }
  }

  if (isPermissionLoading) return <PageMessage>Verificando permisos…</PageMessage>
  if (!canRead) return <PageMessage>No tienes permiso para consultar las plantillas documentales.</PageMessage>
  if (editor.isLoading) return <PageMessage>Cargando plantilla y versiones…</PageMessage>
  if (!editor.template) {
    return (
      <PageMessage>
        <p>{editor.error ?? 'No se encontró la plantilla solicitada.'}</p>
        <Link to="/documents/templates" className="mt-3 inline-block font-medium text-sky-700 hover:underline dark:text-sky-300">Volver al listado</Link>
      </PageMessage>
    )
  }

  const hasDraft = editor.versions.some((item) => item.status === 'DRAFT')
  const canCreateDraft = canManage && editor.template.isActive && !hasDraft
  const isProcessing = Boolean(editor.busyAction)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link to="/documents/templates" className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-300">← Plantillas documentales</Link>
          <h1 className="mt-0.5 text-xl font-semibold text-slate-900 dark:text-slate-50">{editor.template.name}</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">{contextLabel(editor.template.context)} · {editor.template.documentTypeName}</p>
        </div>
        {canCreateDraft ? <button type="button" onClick={() => void handleCreateDraft()} disabled={isProcessing} className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50">Crear versión borrador</button> : null}
      </div>

      {editor.error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">{editor.error}</div> : null}
      {!canReadVariables ? <p role="note" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">No tienes `documents.variables.read`; el catálogo de chips no está disponible para esta sesión.</p> : null}

      <DocumentTemplateMetadataForm
        template={editor.template}
        canManage={canManage}
        isSaving={editor.busyAction === 'metadata'}
        onSave={handleMetadataSave}
      />

      {editor.version ? (
        <DocumentTemplateVersionForm
          version={editor.version}
          versions={editor.versions}
          variables={editor.variables}
          rootContext={editor.template.context}
          canManage={canManage}
          canPublish={canPublish}
          isProcessing={isProcessing}
          canPreview={true}
          operationMessage={operationMessage}
          onSave={handleSave}
          onValidate={handleValidate}
          onPreviewHtml={handleHtmlPreview}
          onPreviewPdf={handlePdfPreview}
          onPublish={handlePublish}
          onSelectVersion={(versionId) => { void editor.selectVersion(editor.template!.id, versionId) }}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-950">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Aún no hay versiones</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Crea una versión borrador para editar contenido y configurar la página.</p>
        </div>
      )}

      {previewHtml !== null ? (
        <HtmlPreviewModal html={previewHtml} onClose={() => setPreviewHtml(null)} />
      ) : null}
      <FilePreviewModal
        open={Boolean(pdfUrl)}
        fileName="vista-previa-temporal.pdf"
        fileUrl={pdfUrl ?? undefined}
        contentType="application/pdf"
        onClose={() => setPdfUrl(null)}
        onDownload={pdfUrl ? () => downloadTemporaryPdf(pdfUrl) : undefined}
      />
    </div>
  )
}

const HtmlPreviewModal = ({ html, onClose }: { html: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-6" role="presentation">
    <section className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950" aria-labelledby="html-preview-title">
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div><h2 id="html-preview-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">Vista previa HTML</h2><p className="text-xs text-slate-500 dark:text-slate-400">Temporal · datos sintéticos · no oficial</p></div>
        <button type="button" onClick={onClose} className="btn-secondary px-3 py-1.5 text-sm">Cerrar</button>
      </header>
      <iframe
        title="Vista previa HTML temporal de la plantilla"
        sandbox=""
        srcDoc={createPreviewDocument(html)}
        className="min-h-0 flex-1 bg-white"
      />
    </section>
  </div>
)

const createPreviewDocument = (html: string) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body{font-family:Arial,sans-serif;color:#0f172a;margin:24px;line-height:1.45}
  table{width:100%;border-collapse:collapse;margin:12px 0}
  th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left}
  th{background:#f1f5f9}
  .document-variable-chip{padding:1px 4px;border-radius:4px;background:#e0f2fe;color:#075985;font-family:monospace}
  @media print{body{margin:0}}
</style></head><body>${html}</body></html>`

const downloadTemporaryPdf = (url: string) => {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'vista-previa-temporal.pdf'
  anchor.click()
}

const contextLabel = (context: string) => ({
  LOAN_APPLICATION: 'Solicitud de préstamo',
  LOAN: 'Préstamo',
  DISBURSEMENT: 'Desembolso',
}[context] ?? context)

const PageMessage = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">{children}</div>
)
