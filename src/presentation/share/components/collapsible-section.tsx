import { ChevronDown } from 'lucide-react'
import { useId, useState, type MouseEvent, type ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  description?: string
  aside?: ReactNode
  children: ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
  surfaceClassName?: string
  className?: string
  contentClassName?: string
  titleClassName?: string
}

export const CollapsibleSection = ({
  title,
  description,
  aside,
  children,
  collapsible = true,
  defaultExpanded = true,
  surfaceClassName,
  className,
  contentClassName,
  titleClassName,
}: CollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const contentId = useId()
  const toggleExpanded = () => setIsExpanded((expanded) => !expanded)
  const handleSectionClick = (event: MouseEvent<HTMLElement>) => {
    if (!collapsible) return

    const target = event.target
    if (
      target instanceof Element &&
      target.closest(
        'button, a, input, select, textarea, [role="button"], [data-collapsible-content]',
      )
    ) {
      return
    }

    toggleExpanded()
  }

  const headerContent = (
    <div className="min-w-0">
      <h2
        className={`${titleClassName ?? 'text-base'} font-semibold text-slate-900 dark:text-slate-100`}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      ) : null}
    </div>
  )

  return (
    <section
      onClick={handleSectionClick}
      className={[
        'rounded-xl border border-slate-200 p-4 shadow-sm dark:border-slate-800',
        surfaceClassName ?? 'bg-white dark:bg-slate-950',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex flex-wrap items-start gap-3">
        {collapsible ? (
          <button
            type="button"
            className="min-w-0 flex-1 cursor-pointer rounded-md text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            aria-expanded={isExpanded}
            aria-controls={contentId}
            onClick={toggleExpanded}
          >
            {headerContent}
          </button>
        ) : (
          <div className="min-w-0 flex-1">{headerContent}</div>
        )}

        <div className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-2">
          {aside}
          {collapsible ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:ring-offset-slate-950 motion-reduce:transition-none"
              aria-label={`${isExpanded ? 'Contraer' : 'Expandir'} ${title}`}
              aria-expanded={isExpanded}
              aria-controls={contentId}
              onClick={toggleExpanded}
            >
              <span className="hidden sm:inline">{isExpanded ? 'Contraer' : 'Expandir'}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform motion-reduce:transition-none ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
          ) : null}
        </div>
      </div>

      {!collapsible || isExpanded ? (
        <div
          id={collapsible ? contentId : undefined}
          data-collapsible-content={collapsible ? true : undefined}
          className={contentClassName ?? 'mt-3'}
        >
          {children}
        </div>
      ) : null}
    </section>
  )
}
