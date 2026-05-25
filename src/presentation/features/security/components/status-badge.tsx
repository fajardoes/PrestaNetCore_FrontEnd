interface StatusBadgeProps {
  isDeleted: boolean
  mustChangePassword?: boolean
}

export const StatusBadge = ({
  isDeleted,
  mustChangePassword,
}: StatusBadgeProps) => {
  if (mustChangePassword) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:ring-amber-500/40">
        <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
        Requiere cambio
      </span>
    )
  }

  if (isDeleted) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 ring-1 ring-red-200 dark:bg-red-500/10 dark:text-red-100 dark:ring-red-500/40">
        <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
        Inactivo
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 ring-1 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-100 dark:ring-sky-500/40">
      <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden />
      Activo
    </span>
  )
}
