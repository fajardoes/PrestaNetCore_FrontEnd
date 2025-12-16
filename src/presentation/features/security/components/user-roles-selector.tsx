import type { SecurityRole } from '@/infrastructure/interfaces/security/role'

interface UserRolesSelectorProps {
  availableRoles: SecurityRole[]
  value: string[]
  onChange: (roles: string[]) => void
  isLoading?: boolean
  disabled?: boolean
}

export const UserRolesSelector = ({
  availableRoles,
  value,
  onChange,
  isLoading,
  disabled,
}: UserRolesSelectorProps) => {
  const toggleRole = (role: string) => {
    if (disabled) return
    if (value.includes(role)) {
      onChange(value.filter((r) => r !== role))
      return
    }
    onChange([...value, role])
  }

  if (isLoading) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Cargando roles...
      </p>
    )
  }

  if (!availableRoles.length) {
    return (
      <p className="text-sm text-red-600 dark:text-red-300">
        No hay roles configurados. Solicita a un administrador que los cree.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {availableRoles.map((role) => (
        <label
          key={role.name}
          className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-primary/50"
        >
          <span className="flex flex-col">
            <span className="font-semibold">{role.name}</span>
            {role.description ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {role.description}
              </span>
            ) : null}
          </span>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50 dark:border-slate-600 dark:bg-slate-900"
            checked={value.includes(role.name)}
            onChange={() => toggleRole(role.name)}
            disabled={disabled}
          />
        </label>
      ))}
    </div>
  )
}
