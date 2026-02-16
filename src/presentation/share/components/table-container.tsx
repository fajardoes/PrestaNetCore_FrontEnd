import type { ReactNode } from 'react'

interface TableContainerProps {
  children: ReactNode
  variant?: 'subtle' | 'default' | 'strong'
  mode?: 'modern' | 'legacy' | 'legacy-compact'
  className?: string
}

const variantClasses: Record<NonNullable<TableContainerProps['variant']>, string> = {
  subtle:
    'border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-950',
  default:
    'border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950',
  strong:
    'border border-slate-300 bg-white shadow-md dark:border-slate-700 dark:bg-slate-950',
}

export const TableContainer = ({
  children,
  variant = 'subtle',
  mode = 'modern',
  className,
}: TableContainerProps) => {
  const modeClasses =
    mode === 'legacy'
      ? [
          'rounded-md shadow-none',
          '[&_thead]:bg-slate-100 dark:[&_thead]:bg-slate-900/80',
          '[&_th]:px-3 [&_th]:py-2 [&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide',
          '[&_td]:px-3 [&_td]:py-2 [&_td]:text-[13px]',
          '[&_tbody_tr]:transition-none',
        ].join(' ')
      : mode === 'legacy-compact'
        ? [
            'rounded-md border-slate-300 shadow-none dark:border-slate-700',
            '[&_thead]:bg-slate-100 dark:[&_thead]:bg-slate-900/80',
            '[&_thead]:border-b [&_thead]:border-slate-300 dark:[&_thead]:border-slate-700',
            '[&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide',
            '[&_td]:px-2.5 [&_td]:py-1.5 [&_td]:text-xs',
            '[&_tbody]:divide-y [&_tbody]:divide-slate-300 dark:[&_tbody]:divide-slate-700',
            '[&_tbody_tr]:transition-none',
          ].join(' ')
        : ''

  const classes = [
    'overflow-hidden rounded-xl',
    variantClasses[variant],
    modeClasses,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return <div className={classes}>{children}</div>
}
