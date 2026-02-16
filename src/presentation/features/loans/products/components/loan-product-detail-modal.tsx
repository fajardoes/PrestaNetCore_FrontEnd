import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { LoanProductDetailDto } from '@/infrastructure/loans/dtos/loan-products/loan-product-detail.dto'
import type { LoanCatalogItemDto } from '@/infrastructure/loans/dtos/catalogs/loan-catalog-item.dto'
import type { ChartAccountListItem } from '@/infrastructure/interfaces/accounting/chart-account'
import { PdfViewerDialog } from '@/presentation/components/reports/pdf-viewer-dialog'
import {
  LoanProductReport,
  type LoanProductReportData,
} from '@/presentation/components/reports/loans/loan-product-report'
import { formatRateAsPercent } from '@/core/helpers/rate-percent'

interface LoanProductDetailModalProps {
  open: boolean
  product: LoanProductDetailDto | null
  isLoading: boolean
  error: string | null
  catalogs: {
    termUnits: LoanCatalogItemDto[]
    interestRateTypes: LoanCatalogItemDto[]
    rateBases: LoanCatalogItemDto[]
    amortizationMethods: LoanCatalogItemDto[]
    paymentFrequencies: LoanCatalogItemDto[]
    portfolioTypes: LoanCatalogItemDto[]
    feeTypes: LoanCatalogItemDto[]
    feeChargeBases: LoanCatalogItemDto[]
    feeValueTypes: LoanCatalogItemDto[]
    feeChargeTimings: LoanCatalogItemDto[]
    insuranceTypes: LoanCatalogItemDto[]
    insuranceCalculationBases: LoanCatalogItemDto[]
    insuranceCoveragePeriods: LoanCatalogItemDto[]
    insuranceChargeTimings: LoanCatalogItemDto[]
    collateralTypes: LoanCatalogItemDto[]
  }
  onResolveAccount: (accountId: string) => Promise<ChartAccountListItem | null>
  onClose: () => void
}

const buildCatalogLabel = (items: LoanCatalogItemDto[], id?: string | null) => {
  if (!id) return ''
  const match = items.find((item) => item.id === id)
  if (!match) return id
  return `${match.code} - ${match.name}`
}

export const LoanProductDetailModal = ({
  open,
  product,
  isLoading,
  error,
  catalogs,
  onResolveAccount,
  onClose,
}: LoanProductDetailModalProps) => {
  const [isPdfOpen, setIsPdfOpen] = useState(false)
  const [glAccounts, setGlAccounts] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open || !product) return

    const accountIds = [
      product.glLoanPortfolioAccountId,
      product.glInterestIncomeAccountId,
      product.glInterestSuspenseAccountId,
      product.glFeeIncomeAccountId,
      product.glInsurancePayableAccountId,
    ].filter((value): value is string => Boolean(value))

    if (!accountIds.length) return

    let isMounted = true
    Promise.all(accountIds.map((id) => onResolveAccount(id))).then((results) => {
      if (!isMounted) return
      const nextMap: Record<string, string> = {}
      results.forEach((result, index) => {
        const id = accountIds[index]
        if (!result || !id) return
        nextMap[id] = `${result.code} - ${result.name}`
      })
      setGlAccounts((prev) => ({ ...prev, ...nextMap }))
    })

    return () => {
      isMounted = false
    }
  }, [open, product, onResolveAccount])

  const reportData = useMemo<LoanProductReportData | null>(() => {
    if (!product) return null
    return {
      product,
      labels: {
        termUnit: buildCatalogLabel(catalogs.termUnits, product.termUnitId),
        interestRateType: buildCatalogLabel(
          catalogs.interestRateTypes,
          product.interestRateTypeId,
        ),
        rateBase: buildCatalogLabel(catalogs.rateBases, product.rateBaseId),
        amortizationMethod: buildCatalogLabel(
          catalogs.amortizationMethods,
          product.amortizationMethodId,
        ),
        paymentFrequency: buildCatalogLabel(
          catalogs.paymentFrequencies,
          product.paymentFrequencyId,
        ),
        portfolioType: buildCatalogLabel(
          catalogs.portfolioTypes,
          product.portfolioTypeId,
        ),
      },
      glAccounts: {
        loanPortfolio:
          glAccounts[product.glLoanPortfolioAccountId] ||
          product.glLoanPortfolioAccountId,
        interestIncome:
          glAccounts[product.glInterestIncomeAccountId] ||
          product.glInterestIncomeAccountId,
        interestSuspense: product.glInterestSuspenseAccountId
          ? glAccounts[product.glInterestSuspenseAccountId] ||
            product.glInterestSuspenseAccountId
          : null,
        feeIncome: product.glFeeIncomeAccountId
          ? glAccounts[product.glFeeIncomeAccountId] || product.glFeeIncomeAccountId
          : null,
        insurancePayable: product.glInsurancePayableAccountId
          ? glAccounts[product.glInsurancePayableAccountId] ||
            product.glInsurancePayableAccountId
          : null,
      },
      fees: (product.fees ?? []).map((fee) => ({
        feeType: buildCatalogLabel(catalogs.feeTypes, fee.feeTypeId),
        chargeBase: buildCatalogLabel(catalogs.feeChargeBases, fee.chargeBaseId),
        valueType: buildCatalogLabel(catalogs.feeValueTypes, fee.valueTypeId),
        value: fee.value,
        chargeTiming: buildCatalogLabel(
          catalogs.feeChargeTimings,
          fee.chargeTimingId,
        ),
        isActive: fee.isActive,
      })),
      insurances: (product.insurances ?? []).map((insurance) => ({
        insuranceType: buildCatalogLabel(
          catalogs.insuranceTypes,
          insurance.insuranceTypeId,
        ),
        calculationBase: buildCatalogLabel(
          catalogs.insuranceCalculationBases,
          insurance.calculationBaseId,
        ),
        coveragePeriod: buildCatalogLabel(
          catalogs.insuranceCoveragePeriods,
          insurance.coveragePeriodId,
        ),
        rate: insurance.rate,
        chargeTiming: buildCatalogLabel(
          catalogs.insuranceChargeTimings,
          insurance.chargeTimingId,
        ),
        isActive: insurance.isActive,
      })),
      collateralRules: (product.collateralRules ?? []).map((rule) => ({
        collateralType: buildCatalogLabel(
          catalogs.collateralTypes,
          rule.collateralTypeId,
        ),
        minCoverageRatio: rule.minCoverageRatio,
        maxItems: rule.maxItems,
        isActive: rule.isActive,
      })),
    }
  }, [product, catalogs, glAccounts])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl ring-1 ring-black/10 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Detalle de producto
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Parametrizacion completa del producto seleccionado.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-print"
              onClick={() => setIsPdfOpen(true)}
              disabled={!reportData}
            >
              <PrinterIcon className="h-4 w-4" />
              Imprimir
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-icon"
              aria-label="Cerrar modal"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Cargando detalle del producto...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : product ? (
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-200">
            <Section title="Datos generales">
              <DetailItem label="Codigo" value={product.code} />
              <DetailItem label="Nombre" value={product.name} />
              <DetailItem
                label="Estado"
                value={product.isActive ? 'Activo' : 'Inactivo'}
              />
              <DetailItem label="Moneda" value={product.currencyCode} />
              <DetailItem label="Descripcion" value={product.description || '—'} />
            </Section>

            <Section title="Condiciones">
              <DetailItem label="Monto minimo" value={formatAmount(product.minAmount)} />
              <DetailItem label="Monto maximo" value={formatAmount(product.maxAmount)} />
              <DetailItem
                label="Plazo minimo"
                value={`${product.minTerm} ${buildCatalogLabel(catalogs.termUnits, product.termUnitId)}`.trim()}
              />
              <DetailItem
                label="Plazo maximo"
                value={`${product.maxTerm} ${buildCatalogLabel(catalogs.termUnits, product.termUnitId)}`.trim()}
              />
              <DetailItem
                label="Unidad plazo"
                value={buildCatalogLabel(catalogs.termUnits, product.termUnitId)}
              />
            </Section>

            <Section title="Interes y amortizacion">
              <DetailItem
                label="Tipo de tasa"
                value={buildCatalogLabel(
                  catalogs.interestRateTypes,
                  product.interestRateTypeId,
                )}
              />
              <DetailItem label="Tasa nominal" value={formatRateAsPercent(product.nominalRate)} />
              <DetailItem
                label="Base de tasa"
                value={buildCatalogLabel(catalogs.rateBases, product.rateBaseId)}
              />
              <DetailItem
                label="Metodo"
                value={buildCatalogLabel(
                  catalogs.amortizationMethods,
                  product.amortizationMethodId,
                )}
              />
              <DetailItem
                label="Frecuencia"
                value={buildCatalogLabel(
                  catalogs.paymentFrequencies,
                  product.paymentFrequencyId,
                )}
              />
              <DetailItem
                label="Gracia capital"
                value={product.gracePrincipal.toString()}
              />
              <DetailItem
                label="Gracia interes"
                value={product.graceInterest.toString()}
              />
            </Section>

            <Section title="Garantias y seguros">
              <DetailItem
                label="Requiere garantia"
                value={product.requiresCollateral ? 'Si' : 'No'}
              />
              <DetailItem
                label="Ratio minimo garantia"
                value={
                  product.requiresCollateral && product.minCollateralRatio != null
                    ? product.minCollateralRatio.toString()
                    : '—'
                }
              />
              <DetailItem
                label="Tiene seguro"
                value={product.hasInsurance ? 'Si' : 'No'}
              />
            </Section>

            <Section title="Regulacion">
              <DetailItem
                label="Tipo cartera"
                value={buildCatalogLabel(
                  catalogs.portfolioTypes,
                  product.portfolioTypeId,
                )}
              />
            </Section>

            <Section title="Mapeo contable (GL)">
              <DetailItem
                label="Cuenta cartera"
                value={
                  glAccounts[product.glLoanPortfolioAccountId] ||
                  product.glLoanPortfolioAccountId
                }
              />
              <DetailItem
                label="Intereses"
                value={
                  glAccounts[product.glInterestIncomeAccountId] ||
                  product.glInterestIncomeAccountId
                }
              />
              <DetailItem
                label="Intereses suspendidos"
                value={
                  product.glInterestSuspenseAccountId
                    ? glAccounts[product.glInterestSuspenseAccountId] ||
                      product.glInterestSuspenseAccountId
                    : '—'
                }
              />
              <DetailItem
                label="Comisiones"
                value={
                  product.glFeeIncomeAccountId
                    ? glAccounts[product.glFeeIncomeAccountId] ||
                      product.glFeeIncomeAccountId
                    : '—'
                }
              />
              <DetailItem
                label="Seguros por pagar"
                value={
                  product.glInsurancePayableAccountId
                    ? glAccounts[product.glInsurancePayableAccountId] ||
                      product.glInsurancePayableAccountId
                    : '—'
                }
              />
            </Section>

            <Section title="Comisiones">
              {product.fees?.length ? (
                <ul className="space-y-2">
                  {product.fees.map((fee, index) => (
                    <li
                      key={`${fee.feeTypeId}-${index}`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {buildCatalogLabel(catalogs.feeTypes, fee.feeTypeId)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Base: {buildCatalogLabel(catalogs.feeChargeBases, fee.chargeBaseId)}
                        {' | '}Valor: {formatAmount(fee.value)}
                        {' | '}Tipo valor: {buildCatalogLabel(catalogs.feeValueTypes, fee.valueTypeId)}
                        {' | '}Momento: {buildCatalogLabel(catalogs.feeChargeTimings, fee.chargeTimingId)}
                        {' | '}Estado: {fee.isActive ? 'Activo' : 'Inactivo'}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sin comisiones.
                </p>
              )}
            </Section>

            <Section title="Seguros">
              {product.insurances?.length ? (
                <ul className="space-y-2">
                  {product.insurances.map((insurance, index) => (
                    <li
                      key={`${insurance.insuranceTypeId}-${index}`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {buildCatalogLabel(
                          catalogs.insuranceTypes,
                          insurance.insuranceTypeId,
                        )}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Base calculo:{' '}
                        {buildCatalogLabel(
                          catalogs.insuranceCalculationBases,
                          insurance.calculationBaseId,
                        )}
                        {' | '}Cobertura:{' '}
                        {buildCatalogLabel(
                          catalogs.insuranceCoveragePeriods,
                          insurance.coveragePeriodId,
                        )}
                        {' | '}Tasa: {formatAmount(insurance.rate)}
                        {' | '}Momento:{' '}
                        {buildCatalogLabel(
                          catalogs.insuranceChargeTimings,
                          insurance.chargeTimingId,
                        )}
                        {' | '}Estado: {insurance.isActive ? 'Activo' : 'Inactivo'}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sin seguros.
                </p>
              )}
            </Section>

            <Section title="Garantias">
              {product.collateralRules?.length ? (
                <ul className="space-y-2">
                  {product.collateralRules.map((rule, index) => (
                    <li
                      key={`${rule.collateralTypeId}-${index}`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {buildCatalogLabel(catalogs.collateralTypes, rule.collateralTypeId)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Ratio min: {rule.minCoverageRatio} | Max ítems:{' '}
                        {rule.maxItems != null ? rule.maxItems : '—'} | Estado:{' '}
                        {rule.isActive ? 'Activo' : 'Inactivo'}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sin garantias.
                </p>
              )}
            </Section>
          </div>
        ) : null}
      </div>

      {reportData ? (
        <PdfViewerDialog
          isOpen={isPdfOpen}
          onClose={() => setIsPdfOpen(false)}
          title={`Producto ${product?.code ?? ''}`}
          document={<LoanProductReport data={reportData} organizationName="PrestaNet" />}
        />
      ) : null}
    </div>
  )
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="space-y-2">
    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {title}
    </h4>
    <div className="grid gap-2 md:grid-cols-2">{children}</div>
  </div>
)

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="text-xs text-slate-800 dark:text-slate-100">
      {value || '—'}
    </p>
  </div>
)

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0.00'
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

const PrinterIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 9V4h12v5" />
    <path d="M6 18h12v2H6z" />
    <path d="M6 14h12v4H6z" />
    <path d="M4 12h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2Z" />
  </svg>
)
