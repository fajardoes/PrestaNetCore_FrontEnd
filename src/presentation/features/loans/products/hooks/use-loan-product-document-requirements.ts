import { useCallback, useEffect, useState } from 'react'
import { loanProductDocumentRequirementsActions } from '@/core/actions/loans/loan-product-document-requirements.actions'
import type {
  LoanProductDocumentRequirementEventDto,
  LoanProductDocumentRequirementsDto,
  LoanProductDocumentRequirementsUpdateRequestDto,
  LoanProductDocumentTemplateOptionDto,
} from '@/infrastructure/loans/dtos/loan-products/loan-product-document-requirement.dto'

export const useLoanProductDocumentRequirements = (
  productId: string,
  canManage: boolean,
) => {
  const [requirements, setRequirements] = useState<LoanProductDocumentRequirementsDto | null>(null)
  const [templates, setTemplates] = useState<LoanProductDocumentTemplateOptionDto[]>([])
  const [events, setEvents] = useState<LoanProductDocumentRequirementEventDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const [requirementsResult, templatesResult, eventsResult] = await Promise.all([
      loanProductDocumentRequirementsActions.get(productId),
      canManage
        ? loanProductDocumentRequirementsActions.getTemplates(productId)
        : Promise.resolve(null),
      loanProductDocumentRequirementsActions.getEvents(productId),
    ])

    if (!requirementsResult.success) {
      setError(requirementsResult.error)
      setIsLoading(false)
      return false
    }

    setRequirements(requirementsResult.data)
    if (templatesResult) {
      if (templatesResult.success) setTemplates(templatesResult.data)
      else setError(templatesResult.error)
    } else {
      setTemplates([])
    }
    if (eventsResult.success) setEvents(eventsResult.data)
    else setError((current) => current ?? eventsResult.error)
    setIsLoading(false)
    return true
  }, [canManage, productId])

  useEffect(() => {
    let active = true
    const load = async () => {
      setIsLoading(true)
      setError(null)
      const [requirementsResult, templatesResult, eventsResult] = await Promise.all([
        loanProductDocumentRequirementsActions.get(productId),
        canManage
          ? loanProductDocumentRequirementsActions.getTemplates(productId)
          : Promise.resolve(null),
        loanProductDocumentRequirementsActions.getEvents(productId),
      ])
      if (!active) return
      if (!requirementsResult.success) {
        setError(requirementsResult.error)
        setIsLoading(false)
        return
      }
      setRequirements(requirementsResult.data)
      if (templatesResult) {
        if (templatesResult.success) setTemplates(templatesResult.data)
        else setError(templatesResult.error)
      } else setTemplates([])
      if (eventsResult.success) setEvents(eventsResult.data)
      else setError((current) => current ?? eventsResult.error)
      setIsLoading(false)
    }
    void load()
    return () => { active = false }
  }, [canManage, productId])

  const save = useCallback(async (payload: LoanProductDocumentRequirementsUpdateRequestDto) => {
    setIsSaving(true)
    setError(null)
    const result = await loanProductDocumentRequirementsActions.replace(productId, payload)
    if (!result.success) {
      setError(result.error)
      setIsSaving(false)
      return false
    }
    setRequirements(result.data)
    const [templatesResult, eventsResult] = await Promise.all([
      loanProductDocumentRequirementsActions.getTemplates(productId),
      loanProductDocumentRequirementsActions.getEvents(productId),
    ])
    if (templatesResult.success) setTemplates(templatesResult.data)
    if (eventsResult.success) setEvents(eventsResult.data)
    setIsSaving(false)
    return true
  }, [productId])

  return { requirements, templates, events, isLoading, isSaving, error, reload, save }
}
