import { useEffect, useRef } from 'react'
import { LoginForm } from './LoginForm'

interface LoginDropdownProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const LoginDropdown = ({ open, onOpenChange }: LoginDropdownProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onOpenChange(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onOpenChange])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="btn-primary shadow"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Iniciar sesión
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-80 rounded-xl border border-slate-200 bg-white p-5 shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 text-center">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Acceso a la plataforma
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Ingresa tus credenciales del prestanet.
            </p>
          </div>
          <LoginForm onSuccess={() => onOpenChange(false)} />
        </div>
      ) : null}
    </div>
  )
}
