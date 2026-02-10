import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PromoterForm } from '@/presentation/features/sales/promoters/components/promoter-form'
import { usePromoterDetail } from '@/presentation/features/sales/promoters/hooks/use-promoter-detail'
import { useSavePromoter } from '@/presentation/features/sales/promoters/hooks/use-save-promoter'
import { useAgencies } from '@/presentation/features/catalog/hooks/use-agencies'
import type { PromoterFormValues } from '@/infrastructure/validations/sales/promoter.schema'
import type {
  CreatePromoterRequest,
  UpdatePromoterRequest,
} from '@/infrastructure/interfaces/sales/promoter'

export const PromoterFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { data, isLoading, error, loadById, reset } = usePromoterDetail()
  const { create, update, isSaving, error: saveError, clearError } =
    useSavePromoter()
  const { agencies, isLoading: agenciesLoading, error: agenciesError } =
    useAgencies()

  useEffect(() => {
    if (id) {
      void loadById(id)
      return
    }
    reset()
  }, [id, loadById, reset])

  const initialValues = useMemo<PromoterFormValues | undefined>(() => {
    if (!data) return undefined
    return {
      clientId: data.clientId,
      agencyId: data.agencyId,
      code: data.code ?? '',
      notes: data.notes ?? '',
      isActive: data.isActive,
    }
  }, [data])

  const handleSubmit = async (values: PromoterFormValues) => {
    clearError()
    if (isEdit && id) {
      const payload: UpdatePromoterRequest = {
        agencyId: values.agencyId,
        code: values.code ?? null,
        notes: values.notes ?? null,
        isActive: values.isActive,
      }
      const result = await update(id, payload)
      if (result.success) {
        navigate('/sales/promoters')
      }
      return
    }

    const payload: CreatePromoterRequest = {
      clientId: values.clientId.trim(),
      agencyId: values.agencyId,
      code: values.code ?? null,
      notes: values.notes ?? null,
    }
    const result = await create(payload)
    if (result.success) {
      navigate('/sales/promoters')
    }
  }

  if (isEdit && isLoading && !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando promotor...
      </div>
    )
  }

  if (isEdit && error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-100">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          {isEdit ? 'Editar promotor' : 'Nuevo promotor'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Registra el cliente empleado y define su codigo interno.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <PromoterForm
          initialValues={initialValues}
          promoter={data}
          agencies={agencies}
          agenciesLoading={agenciesLoading}
          agenciesError={agenciesError}
          isEdit={isEdit}
          isSaving={isSaving}
          error={saveError}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/sales/promoters')}
        />
      </div>
    </div>
  )
}
