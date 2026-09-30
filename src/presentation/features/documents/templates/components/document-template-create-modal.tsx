import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import {
  documentTemplateCreateSchema,
  type DocumentTemplateCreateFormValues,
} from '@/infrastructure/validations/documents/document-template-admin.schema'
import type { DocumentTypeListItemDto } from '@/infrastructure/documents/dtos/document-template-admin.dto'

interface DocumentTemplateCreateModalProps {
  open: boolean
  types: DocumentTypeListItemDto[]
  isSaving: boolean
  error: string | null
  onClose: () => void
  onCreate: (values: DocumentTemplateCreateFormValues) => Promise<void>
}

export const DocumentTemplateCreateModal = ({ open, types, isSaving, error, onClose, onCreate }: DocumentTemplateCreateModalProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<DocumentTemplateCreateFormValues>({
    resolver: yupResolver(documentTemplateCreateSchema),
    defaultValues: { code: '', name: '', description: '', documentTypeId: '' },
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="create-template-title">
      <form onSubmit={handleSubmit(onCreate)} className="w-full max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950" aria-labelledby="create-template-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="create-template-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">Crear plantilla documental</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">La plantilla se crea sin publicar; después puedes preparar su versión borrador.</p>
          </div>
          <button type="button" onClick={onClose} className="btn-secondary px-3 py-1.5 text-sm">Cerrar</button>
        </div>
        {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">{error}</p> : null}
        <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          Código
          <input {...register('code')} autoFocus className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm uppercase dark:border-slate-700 dark:bg-slate-900" />
          {errors.code ? <span className="block text-xs text-red-600 dark:text-red-300">{errors.code.message}</span> : null}
        </label>
        <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          Nombre
          <input {...register('name')} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
          {errors.name ? <span className="block text-xs text-red-600 dark:text-red-300">{errors.name.message}</span> : null}
        </label>
        <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          Tipo documental
          <select {...register('documentTypeId')} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
            <option value="">Selecciona un tipo…</option>
            {types.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
          </select>
          {errors.documentTypeId ? <span className="block text-xs text-red-600 dark:text-red-300">{errors.documentTypeId.message}</span> : null}
        </label>
        <label className="block space-y-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          Descripción (opcional)
          <textarea {...register('description')} rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
        </label>
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
          <button type="button" onClick={onClose} className="btn-secondary px-4 py-2 text-sm">Cancelar</button>
          <button type="submit" disabled={isSaving || types.length === 0} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
            {isSaving ? 'Creando…' : 'Crear plantilla'}
          </button>
        </div>
      </form>
    </div>
  )
}
