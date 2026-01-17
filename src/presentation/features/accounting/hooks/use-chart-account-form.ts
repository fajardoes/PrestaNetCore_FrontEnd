import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createChartAccountAction } from '@/core/actions/accounting/create-chart-account.action'
import { updateChartAccountAction } from '@/core/actions/accounting/update-chart-account.action'
import {
  chartAccountSchema,
  type ChartAccountFormValues,
} from '@/infrastructure/validations/accounting/chart-account.schema'
import type {
  ChartAccountDetail,
  ChartAccountListItem,
} from '@/infrastructure/interfaces/accounting/chart-account'
import type { CreateChartAccountRequest } from '@/infrastructure/interfaces/accounting/requests/create-chart-account.request'

const normalizeSlug = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/(^-|-$)+/g, '')
}

interface UseChartAccountFormOptions {
  chartAccount?: ChartAccountDetail | ChartAccountListItem | null
  onCompleted?: (account: ChartAccountDetail) => void
}

export const useChartAccountForm = (options?: UseChartAccountFormOptions) => {
  const { chartAccount, onCompleted } = options ?? {}
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const defaultValues = useMemo<ChartAccountFormValues>(
    () => ({
      code: '',
      name: '',
      slug: '',
      level: undefined,
      parentId: undefined,
      isGroup: false,
      normalBalance: 'debit',
      isActive: true,
    }),
    [],
  )

  const form = useForm<ChartAccountFormValues>({
    resolver: zodResolver(chartAccountSchema),
    defaultValues,
  })

  useEffect(() => {
    if (chartAccount) {
      form.reset({
        code: chartAccount.code,
        name: chartAccount.name,
        slug: chartAccount.slug,
        level: chartAccount.level,
        parentId: chartAccount.parentId ?? undefined,
        isGroup: chartAccount.isGroup,
        normalBalance: chartAccount.normalBalance,
        isActive: chartAccount.isActive,
      })
      return
    }
    form.reset(defaultValues)
  }, [chartAccount, defaultValues, form])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true)
    setError(null)
    const payload: CreateChartAccountRequest = {
      ...values,
      slug: normalizeSlug(values.slug),
      parentId: values.parentId || null,
      level:
        typeof values.level === 'number' && !Number.isNaN(values.level)
          ? values.level
          : undefined,
    }

    const result = chartAccount
      ? await updateChartAccountAction(chartAccount.id, payload)
      : await createChartAccountAction(payload)

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
