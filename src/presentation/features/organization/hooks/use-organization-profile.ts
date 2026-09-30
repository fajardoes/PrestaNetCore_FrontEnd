import { useCallback, useState } from 'react'
import {
  getOrganizationProfileAction,
  removeReportLogoAction,
  saveOrganizationProfileAction,
  uploadReportLogoAction,
} from '@/core/actions/organization/organization-profile.action'
import type {
  OrganizationProfileDto,
  OrganizationProfileUpdateDto,
} from '@/infrastructure/interfaces/organization/organization-profile/organization-profile.dto'

export const useOrganizationProfile = () => {
  const [profile, setProfile] = useState<OrganizationProfileDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isRemovingLogo, setIsRemovingLogo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const result = await getOrganizationProfileAction()
    if (result.success) {
      setProfile(result.data)
    } else {
      setError(result.error)
    }
    setIsLoading(false)
    return result
  }, [])

  const save = useCallback(async (payload: OrganizationProfileUpdateDto) => {
    setIsSaving(true)
    setError(null)
    const result = await saveOrganizationProfileAction(payload)
    if (result.success) {
      setProfile(result.data)
    } else {
      setError(result.error)
    }
    setIsSaving(false)
    return result
  }, [])

  const uploadLogo = useCallback(async (file: File) => {
    setIsUploadingLogo(true)
    setError(null)
    const result = await uploadReportLogoAction(file)
    if (result.success) {
      setProfile(result.data)
    } else {
      setError(result.error)
    }
    setIsUploadingLogo(false)
    return result
  }, [])

  const removeLogo = useCallback(async () => {
    setIsRemovingLogo(true)
    setError(null)
    const result = await removeReportLogoAction()
    if (result.success) {
      setProfile(result.data)
    } else {
      setError(result.error)
    }
    setIsRemovingLogo(false)
    return result
  }, [])

  return {
    profile,
    isLoading,
    isSaving,
    isUploadingLogo,
    isRemovingLogo,
    error,
    setError,
    refresh,
    save,
    uploadLogo,
    removeLogo,
  }
}
