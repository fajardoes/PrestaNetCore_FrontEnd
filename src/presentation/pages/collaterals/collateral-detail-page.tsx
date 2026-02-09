import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { formatHnIdentity } from '@/core/helpers/hn-identity'
import { useCollateralDetail } from '@/presentation/features/collaterals/hooks/use-collateral-detail'
import { CollateralDocumentsPanel } from '@/presentation/pages/collaterals/components/collateral-documents-panel'

type DetailTab = 'data' | 'documents'

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString('es-HN')
}

const formatMoney = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const CollateralDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [tab, setTab] = useState<DetailTab>('data')
  const { collateral, isLoading, error, loadById } = useCollateralDetail()

  useEffect(() => {
    if (!id) return
    void loadById(id)
  }, [id, loadById])

  const statusBadgeClass = useMemo(() => {
    if (!collateral?.isActive) {
      return 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40'
    }
    return 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:ring-emerald-500/40'
  }, [collateral?.isActive])

  if (isLoading && !collateral) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        Cargando garantía...
      </div>
    )
  }

  if (error && !collateral) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-100">
        {error}
      </div>
    )
  }

  if (!collateral) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-100">
        No se encontró la garantía.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              Garantía {collateral.referenceNo ? `- ${collateral.referenceNo}` : ''}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                Tipo: {collateral.collateralTypeName ?? '—'}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                Estado: {collateral.statusName ?? '—'}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                Propietario: {collateral.ownerClientName ?? collateral.ownerClientFullName ?? '—'}
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                Avalúo: {formatMoney(collateral.appraisedValue)}
              </span>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClass}`}>
                {collateral.isActive ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={() => navigate('/clients/collaterals')}
            >
              Volver
            </button>
            <button
              type="button"
              className="btn-primary px-4 py-2 text-sm"
              onClick={() => navigate(`/clients/collaterals/${collateral.id}/edit`)}
            >
              Editar
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === 'data'
                ? 'bg-primary text-white'
                : 'text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
            onClick={() => setTab('data')}
          >
            Datos
          </button>
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === 'documents'
                ? 'bg-primary text-white'
                : 'text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
            onClick={() => setTab('documents')}
          >
            Documentos
          </button>
        </div>

        {tab === 'data' ? (
          <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-2">
            <DetailItem label="Referencia" value={collateral.referenceNo || '—'} />
            <DetailItem label="Tipo" value={collateral.collateralTypeName ?? '—'} />
            <DetailItem label="Estado" value={collateral.statusName ?? '—'} />
            <DetailItem
              label="Propietario"
              value={collateral.ownerClientName ?? collateral.ownerClientFullName ?? '—'}
            />
            <DetailItem
              label="Identidad"
              value={
                formatHnIdentity(
                  collateral.ownerIdentity ?? collateral.ownerClientIdentityNo,
                ) || '—'
              }
            />
            <DetailItem label="Valor avalúo" value={formatMoney(collateral.appraisedValue)} />
            <DetailItem label="Fecha avalúo" value={formatDate(collateral.appraisedDate)} />
            <DetailItem label="Creada" value={formatDate(collateral.createdAt)} />
            <div className="md:col-span-2">
              <DetailItem label="Descripción" value={collateral.description || '—'} />
            </div>
          </div>
        ) : (
          <CollateralDocumentsPanel collateralId={collateral.id} />
        )}
      </div>
    </div>
  )
}

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="text-sm text-slate-800 dark:text-slate-100">{value}</p>
  </div>
)
