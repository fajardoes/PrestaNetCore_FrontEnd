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
import type { AccountingPeriodDto } from '@/infrastructure/interfaces/accounting/accounting-period'
import { doesDateBelongToPeriod, getJournalAccountingDate } from '@/presentation/features/accounting/accounting-ui'

interface UseJournalEntryFormOptions {
  entryId?: string | null
  onCompleted?: (entry: JournalEntryDetail) => void
  adjustmentPeriods?: AccountingPeriodDto[]
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
    costCenterId: line.costCenterId || null,
    reference: line.reference?.trim() || undefined,
  }))
}

export const useJournalEntryForm = (options?: UseJournalEntryFormOptions) => {
  const { entryId, onCompleted } = options ?? {}
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingEntry, setIsLoadingEntry] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [legacyHeaderOnly, setLegacyHeaderOnly] = useState(false)

  const defaultValues = useMemo<JournalEntryFormValues>(
    () => ({
      date: '',
      eventDate: '',
      postingMode: 'MANUAL_REGULAR',
      requestedPostingPeriodId: '',
      description: '',
      costCenterId: '',
      lines: [
        {
          accountId: '',
          description: '',
          debit: 0,
          credit: 0,
          reference: '',
          costCenterId: null,
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
      setLegacyHeaderOnly(false)
      const result = await getJournalEntryAction(id)

      if (result.success) {
        form.reset({
          date: getJournalAccountingDate(result.data),
          eventDate: result.data.eventDate ?? '',
          postingMode: result.data.postingMode === 'MANUAL_ADJUSTMENT'
            ? 'MANUAL_ADJUSTMENT'
            : 'MANUAL_REGULAR',
          requestedPostingPeriodId: result.data.postingPeriodId ?? result.data.periodId ?? '',
          description: result.data.description ?? '',
          costCenterId: result.data.costCenterId ?? '',
          lines: result.data.lines.map((line) => ({
            accountId: line.accountId,
            description: line.description ?? '',
            debit: normalizeAmount(line.debit),
            credit: normalizeAmount(line.credit),
            costCenterId: line.costCenterId ?? null,
            costCenterCode: line.costCenterCode ?? null,
            costCenterName: line.costCenterName ?? null,
            reference: line.reference ?? '',
          })),
        })
        setLegacyHeaderOnly(
          Boolean(result.data.costCenterId)
            && result.data.lines.length > 0
            && result.data.lines.every((line) => !line.costCenterId),
        )
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
    setLegacyHeaderOnly(false)
  }, [entryId, loadEntry, form, defaultValues])

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true)
    setError(null)

    if (values.postingMode === 'MANUAL_ADJUSTMENT') {
      const selectedPeriod =
        options?.adjustmentPeriods?.find((period) => period.id === values.requestedPostingPeriodId) ??
        null

      if (!selectedPeriod || !doesDateBelongToPeriod(values.date, selectedPeriod)) {
        form.setError('date', {
          type: 'manual',
          message: 'La fecha contable debe pertenecer al periodo de ajuste seleccionado.',
        })
        setIsSaving(false)
        return
      }
    }

    if (
      entryId
      && legacyHeaderOnly
      && values.costCenterId
      && values.lines.every((line) => !line.costCenterId)
    ) {
      form.setError('costCenterId', {
        type: 'manual',
        message: 'Este borrador histórico tiene el centro solo en la cabecera. Asígnalo a las líneas o limpia la cabecera antes de guardar.',
      })
      setError('Corrige la asignación histórica del centro de costo antes de guardar.')
      setIsSaving(false)
      return
    }

    const payloadBase: CreateJournalEntryRequest = {
      date: values.date,
      eventDate: values.eventDate?.trim() ? values.eventDate : null,
      postingMode: values.postingMode,
      requestedPostingPeriodId:
        values.postingMode === 'MANUAL_ADJUSTMENT'
          ? values.requestedPostingPeriodId || null
          : null,
      description: values.description.trim(),
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
