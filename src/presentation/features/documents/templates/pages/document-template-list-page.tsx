import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserPermissions } from '@/presentation/features/security/hooks/use-user-permissions'
import { useDocumentTemplateList } from '@/presentation/features/documents/templates/hooks/use-document-template-list'
import { DocumentTemplateCreateModal } from '@/presentation/features/documents/templates/components/document-template-create-modal'
import { ListFiltersBar, type StatusFilterValue } from '@/presentation/share/components/list-filters-bar'
import { TableContainer } from '@/presentation/share/components/table-container'
import type { DocumentTemplateCreateFormValues } from '@/infrastructure/validations/documents/document-template-admin.schema'

const readPermission = 'documents.templates.read'
const managePermission = 'documents.templates.manage'

export const DocumentTemplateListPage = () => {
  const navigate = useNavigate()
  const { hasPermission, isLoading: isPermissionLoading } = useUserPermissions()
  const canRead = hasPermission(readPermission)
  const canManage = hasPermission(managePermission)
  const { items, types, isLoading, isSaving, error, load, create } = useDocumentTemplateList(canRead)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilterValue>('active')
  const [rootContext, setRootContext] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const rootContexts = useMemo(
    () => Array.from(new Set(types.map((type) => type.context))).sort(),
    [types],
  )

  if (isPermissionLoading) return <PageMessage>Verificando permisos…</PageMessage>
  if (!canRead) return <PageMessage>No tienes permiso para consultar las plantillas documentales.</PageMessage>

  const submitSearch = () => {
    void load({
      search: search.trim() || undefined,
      rootContext: rootContext || undefined,
      isActive: status === 'all' ? undefined : status === 'active',
    })
  }

  const submitCreate = async (values: DocumentTemplateCreateFormValues) => {
    const result = await create({
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      description: values.description.trim() || null,
      documentTypeId: values.documentTypeId,
    })
    if (result.success) {
      setIsCreateOpen(false)
      navigate(`/documents/templates/${result.data.id}`)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">Plantillas documentales</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Administra plantillas, versiones borrador y vistas previas temporales.</p>
        </div>
        {canManage ? <button type="button" onClick={() => setIsCreateOpen(true)} className="btn-primary btn-list-action">Crear plantilla</button> : null}
      </header>

      {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">{error}</div> : null}

      <ListFiltersBar
        search={search}
        onSearchChange={setSearch}
        searchLabel="Código o nombre"
        placeholder="Buscar plantillas…"
        status={status}
        onStatusChange={setStatus}
        layout="two-rows"
        searchAction={<button type="button" onClick={submitSearch} disabled={isLoading} className="btn-primary btn-list-action disabled:opacity-50">{isLoading ? 'Buscando…' : 'Buscar'}</button>}
      >
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          Contexto
          <select value={rootContext} onChange={(event) => setRootContext(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900">
            <option value="">Todos</option>
            {rootContexts.map((context) => <option key={context} value={context}>{contextLabel(context)}</option>)}
          </select>
        </label>
      </ListFiltersBar>

      <TableContainer mode="legacy-compact" className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr><th>Código</th><th>Plantilla</th><th>Tipo documental</th><th>Contexto</th><th>Versiones</th><th>Publicada</th><th>Estado</th><th className="text-right">Acción</th></tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">Cargando plantillas…</td></tr> : null}
            {!isLoading && items.length === 0 ? <tr><td colSpan={8} className="px-3 py-8 text-center text-slate-500 dark:text-slate-400">No hay plantillas para los filtros seleccionados.</td></tr> : null}
            {!isLoading ? items.map((item) => (
              <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="font-mono text-xs text-slate-600 dark:text-slate-300">{item.code}</td>
                <td><span className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>{item.description ? <span className="mt-0.5 block max-w-sm truncate text-xs text-slate-500 dark:text-slate-400">{item.description}</span> : null}</td>
                <td>{item.documentTypeName}</td>
                <td>{contextLabel(item.context)}</td>
                <td className="tabular-nums">{item.versionCount}</td>
                <td>{item.publishedVersionNumber ? `v${item.publishedVersionNumber}` : '—'}</td>
                <td><span className={item.isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}>{item.isActive ? 'Activa' : 'Inactiva'}</span></td>
                <td className="text-right"><button type="button" onClick={() => navigate(`/documents/templates/${item.id}`)} className="btn-table-action">Administrar</button></td>
              </tr>
            )) : null}
          </tbody>
        </table>
      </TableContainer>

      <DocumentTemplateCreateModal
        open={isCreateOpen}
        types={types}
        isSaving={isSaving}
        error={error}
        onClose={() => setIsCreateOpen(false)}
        onCreate={submitCreate}
      />
    </div>
  )
}

const contextLabel = (context: string) => ({
  LOAN_APPLICATION: 'Solicitud de préstamo',
  LOAN: 'Préstamo',
  DISBURSEMENT: 'Desembolso',
}[context] ?? context)

const PageMessage = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">{children}</div>
)
