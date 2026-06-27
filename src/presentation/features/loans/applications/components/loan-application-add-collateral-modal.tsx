import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  loanApplicationCollateralSchema,
  type LoanApplicationCollateralFormValues,
} from '@/infrastructure/validations/loans/loan-application-collateral.schema'
import type { CollateralResponseDto } from '@/infrastructure/intranet/responses/collaterals/collateral-response'
import { HnIdentityText } from '@/presentation/share/components/hn-identity-text'
import { ListFiltersBar } from '@/presentation/share/components/list-filters-bar'
import { TableContainer } from '@/presentation/share/components/table-container'
import { TablePagination } from '@/presentation/share/components/table-pagination'
import { formatMoney } from '@/presentation/features/loans/applications/components/loan-application-ui-utils'

interface LoanApplicationAddCollateralModalProps {
  open: boolean
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (values: LoanApplicationCollateralFormValues) => Promise<void> | void
  listCollaterals: (params: {
    search?: string
    pageNumber: number
    pageSize: number
  }) => Promise<{
    items: CollateralResponseDto[]
    totalCount: number
  }>
}

const defaultValues: LoanApplicationCollateralFormValues = {
  collateralId: '',
  coverageValue: null,
  notes: null,
}

const PAGE_SIZE = 8

export const LoanApplicationAddCollateralModal = ({
  open,
  isSubmitting = false,
  onClose,
  onSubmit,
  listCollaterals,
}: LoanApplicationAddCollateralModalProps) => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [collaterals, setCollaterals] = useState<CollateralResponseDto[]>([])
  const [isLoadingCollaterals, setIsLoadingCollaterals] = useState(false)
  const [collateralsError, setCollateralsError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const {
    setValue,
    watch,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoanApplicationCollateralFormValues>({
    resolver: yupResolver(loanApplicationCollateralSchema),
    defaultValues,
  })

  const selectedCollateralId = watch('collateralId')
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  )

  useEffect(() => {
    if (!open) return
    reset(defaultValues)
    setSearch('')
    setPage(1)
    setCollaterals([])
    setTotalCount(0)
    setCollateralsError(null)
  }, [open, reset])

  useEffect(() => {
    if (!open) return

    const timer = window.setTimeout(() => {
      const loadCollaterals = async () => {
        setIsLoadingCollaterals(true)
        setCollateralsError(null)
        try {
          const result = await listCollaterals({
            search,
            pageNumber: page,
            pageSize: PAGE_SIZE,
          })
          setCollaterals(result.items)
          setTotalCount(result.totalCount ?? 0)
        } catch (error) {
          setCollaterals([])
          setTotalCount(0)
          setCollateralsError(
            error instanceof Error ? error.message : 'No se pudieron cargar las garantías.',
          )
        } finally {
          setIsLoadingCollaterals(false)
        }
      }

      void loadCollaterals()
    }, 250)

    return () => {
      window.clearTimeout(timer)
    }
  }, [listCollaterals, open, page, search])

  const closeModal = () => {
    reset(defaultValues)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Agregar garantía
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Selecciona una garantía del cliente. Solo las disponibles pueden agregarse.
            </p>
          </div>
          <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={closeModal}>
            Cerrar
          </button>
        </div>

        <form
          className="min-h-0 flex-1 space-y-3 overflow-hidden"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
            reset(defaultValues)
          })}
        >
          <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
            <ListFiltersBar
              search={search}
              onSearchChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="Buscar por referencia, descripción, tipo o identidad..."
              status="active"
              onStatusChange={() => undefined}
              showStatus={false}
            />

            <TableContainer mode="legacy-compact" variant="strong" className="h-full">
              <div className="max-h-[46vh] overflow-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left">Accion</th>
                      <th className="text-left">Referencia</th>
                      <th className="text-left">Tipo</th>
                      <th className="text-left">Estado</th>
                      <th className="text-left">Identidad</th>
                      <th className="text-right">Avaluo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingCollaterals ? (
                      <tr>
                        <td colSpan={6} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                          Cargando garantías...
                        </td>
                      </tr>
                    ) : collateralsError ? (
                      <tr>
                        <td colSpan={6} className="px-2 py-6 text-center text-red-600 dark:text-red-300">
                          {collateralsError}
                        </td>
                      </tr>
                    ) : !collaterals.length ? (
                      <tr>
                        <td colSpan={6} className="px-2 py-6 text-center text-slate-500 dark:text-slate-400">
                          No se encontraron garantías para este cliente.
                        </td>
                      </tr>
                    ) : (
                      collaterals.map((collateral) => {
                        const statusCode = collateral.statusCode?.trim().toUpperCase()
                        const isAvailable = statusCode === 'AVAILABLE'
                        const isSelected = selectedCollateralId === collateral.id

                        return (
                          <tr
                            key={collateral.id}
                            className={isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}
                          >
                            <td>
                              <button
                                type="button"
                                className={`btn-table-action border ${
                                  isAvailable
                                    ? 'border-primary/40 bg-primary/10 text-primary-700 hover:bg-primary/20 dark:border-primary/50 dark:bg-primary/20 dark:text-primary-200 dark:hover:bg-primary/30'
                                    : 'cursor-not-allowed border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                                onClick={() => setValue('collateralId', collateral.id, { shouldValidate: true })}
                                disabled={!isAvailable || isSubmitting}
                              >
                                {!isAvailable
                                  ? 'No disponible'
                                  : isSelected
                                    ? 'Seleccionada'
                                    : 'Seleccionar'}
                              </button>
                            </td>
                            <td className="font-medium text-slate-800 dark:text-slate-100">
                              {collateral.referenceNo || '—'}
                            </td>
                            <td>{collateral.collateralTypeName || '—'}</td>
                            <td>{collateral.statusName || '—'}</td>
                            <td>
                              <HnIdentityText
                                value={collateral.ownerIdentity || collateral.ownerClientIdentityNo}
                              />
                            </td>
                            <td className="text-right">
                              {formatMoney(collateral.appraisedValue)}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <TablePagination
                page={page}
                totalPages={totalPages}
                onPageChange={(nextPage) => setPage(Math.max(1, nextPage))}
              />
            </TableContainer>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Solo se permite seleccionar garantías en estado disponible.
            </p>
            {errors.collateralId ? (
              <p className="text-xs text-red-600 dark:text-red-300">{errors.collateralId.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Cobertura (opcional)
            </label>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register('coverageValue', { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Si la dejas vacía, se usará el valor de avalúo de la garantía.
            </p>
            {errors.coverageValue ? (
              <p className="text-xs text-red-600 dark:text-red-300">{errors.coverageValue.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Notas</label>
            <textarea
              rows={2}
              maxLength={250}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              {...register('notes')}
              disabled={isSubmitting}
            />
            {errors.notes ? (
              <p className="text-xs text-red-600 dark:text-red-300">{errors.notes.message}</p>
            ) : null}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-sm"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary px-4 py-2 text-sm"
              disabled={isSubmitting || !selectedCollateralId}
            >
              {isSubmitting ? 'Guardando...' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
