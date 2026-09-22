import type { ReactNode } from 'react'

interface ProductFormSectionProps {
  title: string
  description?: string
  children: ReactNode
}

export const ProductFormSection = ({
  title,
  description,
  children,
}: ProductFormSectionProps) => (
  <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <header className="px-4 py-3 sm:px-5">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}
    </header>
    <div className="border-t border-slate-200 p-3 dark:border-slate-800 sm:p-4">{children}</div>
  </section>
)
