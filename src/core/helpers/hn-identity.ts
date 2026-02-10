export const formatHnIdentity = (value?: string | null): string => {
  const raw = value?.trim() ?? ''
  if (!raw) return ''

  const digits = raw.replace(/\D/g, '')
  if (!digits) return raw

  const first = digits.slice(0, 4)
  const second = digits.slice(4, 8)
  const third = digits.slice(8, 13)

  if (digits.length <= 4) return first
  if (digits.length <= 8) return `${first}-${second}`
  return `${first}-${second}-${third}`
}

