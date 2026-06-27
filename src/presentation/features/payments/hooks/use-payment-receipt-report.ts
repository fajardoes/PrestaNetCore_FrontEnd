import { useCallback, useState } from 'react'
import { getPaymentReceiptReportAction } from '@/core/actions/payments/get-payment-receipt-report.action'

export const usePaymentReceiptReport = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openReceipt = useCallback(async (paymentId: string) => {
    setIsLoading(true)
    setError(null)
    const result = await getPaymentReceiptReportAction(paymentId)
    setIsLoading(false)

    if (!result.success) {
      setError(result.error)
      return result
    }

    const objectUrl = window.URL.createObjectURL(result.data.blob)
    window.open(objectUrl, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000)
    return result
  }, [])

  return {
    isLoading,
    error,
    setError,
    openReceipt,
  }
}
