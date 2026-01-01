import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCostCenterAction } from '@/core/actions/accounting/create-cost-center.action'
import {
  costCenterSchema,
  type CostCenterFormValues,
} from '@/infrastructure/validations/accounting/cost-center.schema'
import type { CostCenter } from '@/infrastructure/interfaces/accounting/cost-center'
import type { CreateCostCenterRequest } from '@/infrastructure/interfaces/accounting/requests/create-cost-center.request'

const normalizeSlug = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/(^-|-$)+/g, '')
}

interface UseCostCenterFormOptions {
  costCenter?: CostCenter | null
  onCompleted?: (center: CostCenter) => void
}

export const useCostCenterForm = (options?: UseCostCenterFormOptions) => {
  const { costCenter, onCompleted } = options ?? {}
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const defaultValues = useMemo<CostCenterFormValues>(
    () => ({
      code: '',
      name: '',
      slug: '',
      agencyId: '',
      isActive: true,
    }),
    [],
  )

  const form = useForm<CostCenterFormValues>({
    resolver: zodResolver(costCenterSchema),
    defaultValues,
  })

  useEffect(() => {
    if (costCenter) {
      form.reset({
        code: costCenter.code,
        name: costCenter.name,
        slug: costCenter.slug,
        agencyId: costCenter.agencyId,
        isActive: costCenter.isActive,
      })
      return
    }
    form.reset(defaultValues)
  }, [costCenter, defaultValues, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true)
    setError(null)
    const payload: CreateCostCenterRequest = {
      ...values,
      slug: normalizeSlug(values.slug),
    }

    const result = await createCostCenterAction(payload)
    if (result.success) {
      onCompleted?.(result.data)
      setIsSaving(false)
      return
    }

    setError(result.error)
    setIsSaving(false)
  })

  return {
    form,
    onSubmit,
    isSaving,
    error,
    setError,
  }
}
