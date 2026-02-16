import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNotifications } from '@/providers/NotificationProvider'
import { ConfirmModal } from '@/presentation/features/loans/products/components/confirm-modal'
import { FilePreviewModal } from '@/presentation/share/components/file-preview-modal'
import { TableContainer } from '@/presentation/share/components/table-container'
import { useCollateralDocuments } from '@/presentation/features/collaterals/hooks/use-collateral-documents'
import type { CollateralDocumentResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-document-response'
import {
  collateralDocumentUploadSchema,
  type CollateralDocumentUploadFormValues,
} from '@/infrastructure/validations/collaterals/collateral-document-upload.schema'

interface CollateralDocumentsPanelProps {
  collateralId: string
}

const DOCUMENT_TYPES = [
  { value: 'TITLE_DEED', label: 'Título de propiedad' },
  { value: 'APPRAISAL', label: 'Avalúo' },
  { value: 'PHOTO', label: 'Fotografía' },
  { value: 'OTHER', label: 'Otro' },
] as const

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('es-HN')
}

const formatBytes = (value?: number | string | null) => {
  const bytes =
    typeof value === 'string'
      ? Number(value)
      : typeof value === 'number'
        ? value
        : Number.NaN

  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export const CollateralDocumentsPanel = ({ collateralId }: CollateralDocumentsPanelProps) => {
  const { notify } = useNotifications()
  const {
    documents,
    isLoading,
    isUploading,
    isDeleting,
    isDownloading,
    isPreviewing,
    error,
    load,
    upload,
    remove,
    download,
    preview,
  } = useCollateralDocuments()
  const [pendingDeleteDocument, setPendingDeleteDocument] =
    useState<CollateralDocumentResponseDto | null>(null)
  const [previewDocument, setPreviewDocument] = useState<{
    id: string
    fileName: string
    contentType: string
    objectUrl: string
    downloadUrl: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CollateralDocumentUploadFormValues>({
    resolver: yupResolver(collateralDocumentUploadSchema),
    defaultValues: {
      documentType: 'OTHER',
    },
  })

  useEffect(() => {
    void load(collateralId)
  }, [collateralId, load])

  useEffect(() => {
    return () => {
      if (previewDocument?.objectUrl) {
        window.URL.revokeObjectURL(previewDocument.objectUrl)
      }
    }
  }, [previewDocument])

  const selectedFile = watch('file')

  const submitUpload = handleSubmit(async (values) => {
    const result = await upload(collateralId, values.file, values.documentType)
    if (result.success) {
      notify('Documento cargado correctamente.', 'success')
      reset({ documentType: values.documentType })
      await load(collateralId)
      return
    }

    notify(result.error, 'error')
  })

  const documentTypeLabel = useMemo(() => {
    const map = new Map<string, string>()
    DOCUMENT_TYPES.forEach((item) => map.set(item.value, item.label))
    return map
  }, [])

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Subir documento
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Formatos permitidos: PDF, JPG, PNG. Tamaño máximo 10 MB.
        </p>

        <form className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_auto]" onSubmit={submitUpload} noValidate>
          <div className="space-y-1">
            <label className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
              <span className="rounded-md bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                Seleccionar archivo
              </span>
              <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                {selectedFile ? selectedFile.name : 'Ningún archivo seleccionado'}
              </span>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  setValue('file', file as File, { shouldValidate: true })
                }}
                disabled={isUploading}
              />
            </label>
            {selectedFile ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seleccionado: {selectedFile.name}
              </p>
            ) : null}
            {errors.file ? <p className="text-xs text-red-500">{errors.file.message}</p> : null}
          </div>

          <div className="space-y-1">
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary dark:focus:ring-primary/40"
              {...register('documentType')}
              disabled={isUploading}
            >
              {DOCUMENT_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {errors.documentType ? (
              <p className="text-xs text-red-500">{errors.documentType.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            className="btn-primary h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isUploading}
          >
            {isUploading ? 'Subiendo...' : 'Subir'}
          </button>
        </form>

        {error ? (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </div>

      <TableContainer mode="legacy-compact">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Tipo Documento
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Tipo MIME
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Tamaño
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Fecha subida
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    Cargando documentos...
                  </td>
                </tr>
              ) : !documents.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400">
                    No hay documentos para esta garantía.
                  </td>
                </tr>
              ) : (
                documents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900">
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      {item.documentType
                        ? documentTypeLabel.get(item.documentType) ?? item.documentType
                        : 'Sin tipo'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-100">
                      {item.fileName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {item.contentType}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {formatBytes(item.sizeBytes)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {formatDate(item.uploadedOperationalDate)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="btn-table-action"
                          disabled={isPreviewing}
                          onClick={async () => {
                            const result = await preview(item.downloadUrl, item.fileName)
                            if (!result.success) {
                              notify(result.error, 'error')
                              return
                            }

                            setPreviewDocument((previous) => {
                              if (previous?.objectUrl) {
                                window.URL.revokeObjectURL(previous.objectUrl)
                              }
                              return {
                                id: item.id,
                                fileName: result.data.fileName,
                                contentType: result.data.contentType || item.contentType,
                                objectUrl: result.data.objectUrl,
                                downloadUrl: item.downloadUrl,
                              }
                            })
                          }}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className="btn-table-action"
                          disabled={isDownloading}
                          onClick={async () => {
                            const result = await download(item.downloadUrl, item.fileName)
                            if (!result.success) {
                              notify(result.error, 'error')
                            }
                          }}
                        >
                          Descargar
                        </button>
                        <button
                          type="button"
                          className="btn-table-action text-red-600 hover:text-red-700 dark:text-red-300 dark:hover:text-red-200"
                          disabled={isDeleting}
                          onClick={() => {
                            setPendingDeleteDocument(item)
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TableContainer>

      <ConfirmModal
        open={Boolean(pendingDeleteDocument)}
        title="Eliminar documento"
        description="¿Estás seguro de eliminar este documento? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isProcessing={isDeleting}
        onCancel={() => setPendingDeleteDocument(null)}
        onConfirm={async () => {
          if (!pendingDeleteDocument) return
          const result = await remove(collateralId, pendingDeleteDocument.id)
          if (result.success) {
            notify('Documento eliminado correctamente.', 'success')
            setPendingDeleteDocument(null)
            await load(collateralId)
            return
          }
          notify(result.error, 'error')
        }}
      />

      <FilePreviewModal
        open={Boolean(previewDocument)}
        fileName={previewDocument?.fileName}
        fileUrl={previewDocument?.objectUrl}
        contentType={previewDocument?.contentType}
        isLoading={isPreviewing}
        error={null}
        isDownloading={isDownloading}
        onClose={() => {
          setPreviewDocument((previous) => {
            if (previous?.objectUrl) {
              window.URL.revokeObjectURL(previous.objectUrl)
            }
            return null
          })
        }}
        onDownload={
          previewDocument
            ? async () => {
                const result = await download(
                  previewDocument.downloadUrl,
                  previewDocument.fileName,
                )
                if (!result.success) {
                  notify(result.error, 'error')
                }
              }
            : undefined
        }
      />
    </div>
  )
}
