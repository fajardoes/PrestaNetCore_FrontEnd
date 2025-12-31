import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { getJournalEntryAction } from '@/core/actions/accounting/get-journal-entry.action'
import { createJournalEntryAction } from '@/core/actions/accounting/create-journal-entry.action'
import { updateJournalEntryAction } from '@/core/actions/accounting/update-journal-entry.action'
import {
  journalEntrySchema,
  type JournalEntryFormValues,
} from '@/infrastructure/validations/accounting/journal-entry.schema'
import type { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry'
import type { JournalEntryLineRequest } from '@/infrastructure/interfaces/accounting/requests/create-journal-entry.request'
import type { CreateJournalEntryRequest } from '@/infrastructure/interfaces/accounting/requests/create-journal-entry.request'
import type { UpdateJournalEntryRequest } from '@/infrastructure/interfaces/accounting/requests/update-journal-entry.request'

interface UseJournalEntryFormOptions {
  entryId?: string | null
  onCompleted?: (entry: JournalEntryDetail) => void
}

const normalizeAmount = (value: number): number => {
  if (Number.isFinite(value)) return value
  return 0
}

const buildLinesPayload = (lines: JournalEntryFormValues['lines']): JournalEntryLineRequest[] => {
  return lines.map((line) => ({
    accountId: line.accountId,
    description: line.description?.trim() || undefined,
    debit: normalizeAmount(line.debit),
    credit: normalizeAmount(line.credit),
    reference: line.reference?.trim() || undefined,
  }))
}

export const useJournalEntryForm = (options?: UseJournalEntryFormOptions) => {
  const { entryId, onCompleted } = options ?? {}
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingEntry, setIsLoadingEntry] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultValues = useMemo<JournalEntryFormValues>(
    () => ({
      date: '',
      description: '',
      costCenterId: '',
      lines: [
        {
          accountId: '',
          description: '',
          debit: 0,
          credit: 0,
          reference: '',
        },
      ],
    }),
    [],
  )

  const form = useForm<JournalEntryFormValues>({
    resolver: yupResolver(journalEntrySchema),
    defaultValues,
  })

  const loadEntry = useCallback(
    async (id: string) => {
      setIsLoadingEntry(true)
      setError(null)
      const result = await getJournalEntryAction(id)

      if (result.success) {
        form.reset({
          date: result.data.date,
          description: result.data.description ?? '',
          costCenterId: result.data.costCenterId ?? '',
          lines: result.data.lines.map((line) => ({
            accountId: line.accountId,
            description: line.description ?? '',
            debit: normalizeAmount(line.debit),
            credit: normalizeAmount(line.credit),
            reference: line.reference ?? '',
          })),
        })
        setIsLoadingEntry(false)
        return
      }

      setError(result.error)
      setIsLoadingEntry(false)
    },
    [form],
  )

  useEffect(() => {
    if (entryId) {
      void loadEntry(entryId)
      return
    }
    form.reset(defaultValues)
    setError(null)
  }, [entryId, loadEntry, form, defaultValues])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true)
    setError(null)

    const payloadBase: CreateJournalEntryRequest = {
      date: values.date,
      description: values.description.trim(),
      costCenterId: values.costCenterId ? values.costCenterId : null,
      lines: buildLinesPayload(values.lines),
    }

    const result = entryId
      ? await updateJournalEntryAction(entryId, payloadBase as UpdateJournalEntryRequest)
      : await createJournalEntryAction(payloadBase)

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
    isLoadingEntry,
    error,
    setError,
  }
}
