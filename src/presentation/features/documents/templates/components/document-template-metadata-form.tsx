import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import {
  documentTemplateMetadataSchema,
  type DocumentTemplateMetadataFormValues,
} from '@/infrastructure/validations/documents/document-template-admin.schema'
import type { DocumentTemplateDetailDto } from '@/infrastructure/documents/dtos/document-template-admin.dto'

interface DocumentTemplateMetadataFormProps {
  template: DocumentTemplateDetailDto
  canManage: boolean
  isSaving: boolean
  onSave: (values: DocumentTemplateMetadataFormValues) => Promise<void>
}

export const DocumentTemplateMetadataForm = ({ template, canManage, isSaving, onSave }: DocumentTemplateMetadataFormProps) => {
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<DocumentTemplateMetadataFormValues>({
    resolver: yupResolver(documentTemplateMetadataSchema),
    defaultValues: {
      name: template.name,
      description: template.description ?? '',
      isActive: template.isActive,
    },
  })

  useEffect(() => {
    reset({ name: template.name, description: template.description ?? '', isActive: template.isActive })
  }, [reset, template])

  return (
    <form onSubmit={handleSubmit(onSave)} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-2">
      <div className="md:col-span-2">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Datos de la plantilla</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Código: <span className="font-mono">{template.code}</span> · {template.documentTypeName}</p>
        </div>
      </div>
      <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        Nombre
        <input {...register('name')} disabled={!canManage || isSaving} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
        {errors.name ? <span className="block text-xs text-red-600 dark:text-red-300">{errors.name.message}</span> : null}
      </label>
      <label className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-200">
        Descripción
        <input {...register('description')} disabled={!canManage || isSaving} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900" />
        {errors.description ? <span className="block text-xs text-red-600 dark:text-red-300">{errors.description.message}</span> : null}
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input {...register('isActive')} type="checkbox" disabled={!canManage || isSaving} className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-900" />
        Plantilla activa
      </label>
      {canManage ? (
        <div className="flex justify-end">
          <button type="submit" disabled={!isDirty || isSaving} className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50">
            {isSaving ? 'Guardando…' : 'Guardar datos'}
          </button>
        </div>
      ) : null}
    </form>
  )
}
