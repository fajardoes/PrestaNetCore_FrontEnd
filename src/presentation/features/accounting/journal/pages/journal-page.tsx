import { useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/providers/NotificationProvider'
import { useJournalList } from '@/presentation/features/accounting/journal/hooks/use-journal-list'
import { useJournalEntryForm } from '@/presentation/features/accounting/journal/hooks/use-journal-entry-form'
import { usePostJournalEntry } from '@/presentation/features/accounting/journal/hooks/use-post-journal-entry'
import { useVoidJournalEntry } from '@/presentation/features/accounting/journal/hooks/use-void-journal-entry'
import { useJournalEntryDetail } from '@/presentation/features/accounting/journal/hooks/use-journal-entry-detail'
import { JournalFiltersBar } from '@/presentation/features/accounting/journal/components/journal-filters-bar'
import { JournalTable } from '@/presentation/features/accounting/journal/components/journal-table'
import { JournalEntryFormModal } from '@/presentation/features/accounting/journal/components/journal-entry-form-modal'
import { JournalEntryVoidModal } from '@/presentation/features/accounting/journal/components/journal-entry-void-modal'
import { JournalEntryDetailModal } from '@/presentation/features/accounting/journal/components/journal-entry-detail-modal'
import { JournalEntryPostModal } from '@/presentation/features/accounting/journal/components/journal-entry-post-modal'
import { usePostableAccounts } from '@/presentation/features/accounting/hooks/use-postable-accounts'
import { useCostCenterOptions } from '@/presentation/features/accounting/hooks/use-cost-center-options'
import type { JournalEntryListItem } from '@/infrastructure/interfaces/accounting/journal-entry'

export const JournalPage = () => {
  const { user } = useAuth()
  const { notify } = useNotifications()
  const isAdmin =
    user?.roles?.some((role) => role.toLowerCase() === 'admin') ?? false

  const {
    entries,
    page,
    totalPages,
    isLoading,
    error,
    filters,
    setFilters,
    setPage,
    resetFilters,
    refresh,
  } = useJournalList({ enabled: isAdmin })

  const accountsHook = usePostableAccounts({ enabled: isAdmin })
  const costCentersHook = useCostCenterOptions({ enabled: isAdmin })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [voidEntry, setVoidEntry] = useState<JournalEntryListItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [postEntryId, setPostEntryId] = useState<string | null>(null)

  const formHook = useJournalEntryForm({
    entryId: editingId,
    onCompleted: async () => {
      notify(
        editingId ? 'Asiento actualizado correctamente.' : 'Asiento creado en borrador.',
        'success',
      )
      setIsFormOpen(false)
      setEditingId(null)
      await refresh()
    },
  })

  const postHook = usePostJournalEntry({
    onCompleted: async () => {
      notify('Asiento contabilizado correctamente.', 'success')
      await refresh()
    },
  })

  const voidHook = useVoidJournalEntry({
    onCompleted: async () => {
      notify('Asiento anulado correctamente.', 'success')
      await refresh()
    },
  })

  const detailHook = useJournalEntryDetail()
  const postDetailHook = useJournalEntryDetail()

  const canCreate = isAdmin

  const handleView = async (entry: JournalEntryListItem) => {
    setIsDetailOpen(true)
    await detailHook.loadEntry(entry.id)
  }

  const handleEdit = (entry: JournalEntryListItem) => {
    setEditingId(entry.id)
    formHook.setError(null)
    setIsFormOpen(true)
  }

  const handlePost = async (entry: JournalEntryListItem) => {
    setPostEntryId(entry.id)
    await postDetailHook.loadEntry(entry.id)
  }

  const handleVoid = (entry: JournalEntryListItem) => {
    setVoidEntry(entry)
  }

  const canShowRestriction = useMemo(() => !isAdmin, [isAdmin])

  if (canShowRestriction) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-500/10 dark:text-amber-50">
        <p className="font-semibold">Acceso restringido</p>
        <p className="text-sm">
          Solo los usuarios con rol <span className="font-semibold">Admin</span>{' '}
          pueden gestionar el diario contable.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Contabilidad - Diario contable
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Registra, edita, contabiliza y anula asientos contables según el flujo del diario.
        </p>
      </div>

      <JournalFiltersBar
        filters={filters}
        onFiltersChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
        onReset={() => {
          resetFilters()
          setPage(1)
        }}
        actions={
          canCreate ? (
            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => {
                setEditingId(null)
                formHook.setError(null)
                formHook.form.reset()
                setIsFormOpen(true)
              }}
            >
              Nuevo asiento
            </button>
          ) : null
        }
      />

      <JournalTable
        items={entries}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={totalPages}
        onPageChange={(next) => setPage(Math.min(Math.max(1, next), totalPages))}
        onView={handleView}
        onEdit={handleEdit}
        onPost={handlePost}
        onVoid={handleVoid}
      />

      <JournalEntryFormModal
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingId(null)
          formHook.setError(null)
        }}
        form={formHook.form}
        onSubmit={formHook.onSubmit}
        isSaving={formHook.isSaving}
        isLoading={formHook.isLoadingEntry}
        error={formHook.error}
        isEdit={Boolean(editingId)}
        accounts={accountsHook.accounts}
        costCenters={costCentersHook.costCenters}
      />

      <JournalEntryPostModal
        open={Boolean(postEntryId)}
        entry={postDetailHook.entry}
        isLoading={postDetailHook.isLoading || postHook.isLoading}
        error={postHook.error ?? postDetailHook.error}
        onClose={() => {
          setPostEntryId(null)
          postDetailHook.clear()
        }}
        onConfirm={async () => {
          if (!postEntryId || !postDetailHook.entry) return
          if (postDetailHook.entry.totalDebit !== postDetailHook.entry.totalCredit) return
          const result = await postHook.postEntry(postEntryId)
          if (result.success) {
            setPostEntryId(null)
            postDetailHook.clear()
          } else {
            notify(result.error ?? 'No fue posible contabilizar el asiento.', 'error')
          }
        }}
      />

      <JournalEntryVoidModal
        open={Boolean(voidEntry)}
        entry={voidEntry}
        onClose={() => {
          setVoidEntry(null)
        }}
        onSubmit={async (values) => {
          if (!voidEntry) return
          const result = await voidHook.voidEntry(voidEntry.id, {
            reason: values.reason,
            date: values.date ? values.date : null,
          })
          if (result.success) {
            setVoidEntry(null)
          } else {
            notify(result.error ?? 'No fue posible anular el asiento.', 'error')
          }
        }}
        isSubmitting={voidHook.isLoading}
        error={voidHook.error}
      />

      <JournalEntryDetailModal
        open={isDetailOpen}
        entry={detailHook.entry}
        isLoading={detailHook.isLoading}
        error={detailHook.error}
        onClose={() => {
          setIsDetailOpen(false)
          detailHook.clear()
        }}
      />
    </div>
  )
}
