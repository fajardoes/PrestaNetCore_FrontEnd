import { formatHnIdentity } from '@/core/helpers/hn-identity'

interface HnIdentityTextProps {
  value?: string | null
  fallback?: string
  className?: string
}

export const HnIdentityText = ({
  value,
  fallback = '—',
  className,
}: HnIdentityTextProps) => {
  const formatted = formatHnIdentity(value)
  return <span className={className}>{formatted || fallback}</span>
}

