import type { LucideIcon } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

const getMenuIcon = (iconName: string | null): LucideIcon => {
  if (!iconName) {
    return LucideIcons.Square
  }

  const trimmedName = iconName.endsWith('Icon')
    ? iconName.slice(0, -'Icon'.length)
    : iconName

  const iconLookup = LucideIcons as unknown as Record<string, LucideIcon>
  return iconLookup[trimmedName] ?? iconLookup[iconName] ?? LucideIcons.Square
}

export const MenuIcon = ({
  iconName,
  className,
}: {
  iconName: string | null
  className?: string
}) => {
  const ResolvedIcon = getMenuIcon(iconName)
  return <ResolvedIcon className={className} />
}
