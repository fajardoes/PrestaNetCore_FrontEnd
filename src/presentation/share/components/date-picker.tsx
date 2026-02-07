import {
  type ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  error?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  allowFutureDates?: boolean
}

const WEEK_DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const normalizeDate = (date: Date | null | undefined) => {
  if (!date) return null
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

const parseValue = (value?: string | null) => {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  const parsed = new Date(year, month - 1, day)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }
  parsed.setHours(0, 0, 0, 0)
  return parsed
}

const formatDisplayValue = (value: Date | null) => {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('es', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(value)
  } catch {
    const day = `${value.getDate()}`.padStart(2, '0')
    const month = `${value.getMonth() + 1}`.padStart(2, '0')
    return `${day}/${month}/${value.getFullYear()}`
  }
}

const formatISODate = (value: Date) => {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  const day = `${value.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const DatePicker = ({
  value,
  onChange,
  onBlur,
  placeholder = 'Selecciona una fecha',
  error,
  disabled = false,
  minDate,
  maxDate,
  allowFutureDates = false,
}: DatePickerProps) => {
  const today = useMemo(() => {
    const current = new Date()
    current.setHours(0, 0, 0, 0)
    return current
  }, [])

  const selectedDate = useMemo(() => parseValue(value), [value])
  const normalizedMin = useMemo(() => normalizeDate(minDate), [minDate])
  const normalizedMax = useMemo(() => {
    const explicitMax = normalizeDate(maxDate)
    if (explicitMax) return explicitMax
    if (allowFutureDates) return null
    return today
  }, [allowFutureDates, maxDate, today])
  const minYear = normalizedMin?.getFullYear() ?? 1900
  const maxYear = normalizedMax?.getFullYear() ?? today.getFullYear()
  const yearOptions = useMemo(() => {
    const years: number[] = []
    for (let year = maxYear; year >= minYear; year -= 1) {
      years.push(year)
    }
    return years
  }, [maxYear, minYear])

  const [isOpen, setIsOpen] = useState(false)
  const [currentView, setCurrentView] = useState<Date>(() => {
    return selectedDate ?? today
  })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedDate) {
      setCurrentView(selectedDate)
    }
  }, [selectedDate])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        onBlur?.()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        onBlur?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onBlur])

  const calendarDays = useMemo(() => {
    const year = currentView.getFullYear()
    const month = currentView.getMonth()
    const startOfMonth = new Date(year, month, 1)
    const leadingEmpty = (startOfMonth.getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: Array<number | null> = []

    for (let i = 0; i < leadingEmpty; i += 1) {
      cells.push(null)
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(day)
    }

    while (cells.length % 7 !== 0) {
      cells.push(null)
    }

    return { cells, year, month }
  }, [currentView])

  const toggleOpen = () => {
    if (disabled) return
    setIsOpen((prev) => !prev)
  }

  const clampDate = (candidate: Date) => {
    if (normalizedMin && candidate < normalizedMin) {
      return new Date(normalizedMin)
    }
    if (normalizedMax && candidate > normalizedMax) {
      return new Date(normalizedMax)
    }
    return candidate
  }

  const updateView = (updater: (prev: Date) => Date) => {
    setCurrentView((prev) => clampDate(updater(prev)))
  }

  const goToPreviousMonth = () => {
    updateView((prev) => {
      const previous = new Date(prev)
      previous.setMonth(prev.getMonth() - 1)
      return previous
    })
  }

  const goToNextMonth = () => {
    updateView((prev) => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() + 1)
      return next
    })
  }

  const goToPreviousYear = () => {
    updateView((prev) => {
      const previous = new Date(prev)
      previous.setFullYear(prev.getFullYear() - 1)
      return previous
    })
  }

  const goToNextYear = () => {
    updateView((prev) => {
      const next = new Date(prev)
      next.setFullYear(prev.getFullYear() + 1)
      return next
    })
  }

  const handleMonthSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const month = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(month)) return
    updateView((prev) => {
      const next = new Date(prev)
      next.setMonth(month)
      return next
    })
  }

  const handleYearSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const year = Number.parseInt(event.target.value, 10)
    if (Number.isNaN(year)) return
    updateView((prev) => {
      const next = new Date(prev)
      next.setFullYear(year)
      return next
    })
  }

  const handleSelectDay = (day: number) => {
    const candidate = new Date(calendarDays.year, calendarDays.month, day)
    candidate.setHours(0, 0, 0, 0)

    if (
      (normalizedMin && candidate < normalizedMin) ||
      (normalizedMax && candidate > normalizedMax)
    ) {
      return
    }

    onChange(formatISODate(candidate))
    setIsOpen(false)
    onBlur?.()
  }

  const handleClear = () => {
    if (disabled) return
    onChange('')
    onBlur?.()
  }

  const displayValue = formatDisplayValue(selectedDate)

  const isDateDisabled = (day: number | null) => {
    if (!day) return true
    const candidate = new Date(calendarDays.year, calendarDays.month, day)
    candidate.setHours(0, 0, 0, 0)
    if (normalizedMin && candidate < normalizedMin) return true
    if (normalizedMax && candidate > normalizedMax) return true
    return false
  }

  const isSameDay = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getFullYear() === calendarDays.year &&
      selectedDate.getMonth() === calendarDays.month &&
      selectedDate.getDate() === day
    )
  }

  const isToday = (day: number) => {
    return (
      today.getFullYear() === calendarDays.year &&
      today.getMonth() === calendarDays.month &&
      today.getDate() === day
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleOpen}
        onBlur={onBlur}
        disabled={disabled}
        className="mt-1 flex w-full items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-left text-sm text-slate-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-primary/40"
      >
        <span className={displayValue ? '' : 'text-slate-400'}>
          {displayValue || placeholder}
        </span>
        <svg
          className="h-4 w-4 text-slate-500 dark:text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {error ? (
        <span className="mt-1 block text-xs text-red-500">{error}</span>
      ) : null}

      {displayValue ? (
        <button
          type="button"
          onClick={handleClear}
          className="mt-1 text-xs font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={disabled}
        >
          Limpiar fecha
        </button>
      ) : null}

      {isOpen ? (
        <div className="absolute left-0 right-0 z-20 mt-2 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="space-y-3 border-b border-slate-100 px-3 py-3 dark:border-slate-800">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-200">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goToPreviousYear}
                  className="rounded-full p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Año anterior"
                >
                  «
                </button>
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="rounded-full p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Mes anterior"
                >
                  ‹
                </button>
              </div>
              <p className="text-sm font-semibold capitalize text-slate-700 dark:text-slate-100">
                {new Intl.DateTimeFormat('es', {
                  month: 'long',
                  year: 'numeric',
                }).format(currentView)}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="rounded-full p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Mes siguiente"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={goToNextYear}
                  className="rounded-full p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Año siguiente"
                >
                  »
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <select
                value={`${currentView.getMonth()}`}
                onChange={handleMonthSelect}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm capitalize text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                aria-label="Seleccionar mes"
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <select
                value={`${currentView.getFullYear()}`}
                onChange={handleYearSelect}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                aria-label="Seleccionar año"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 px-3 pb-3 pt-2 text-center text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
            {WEEK_DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 px-3 pb-3">
            {calendarDays.cells.map((day, index) => {
              if (day === null) {
                return <span key={`empty-${index}`} />
              }

              const disabledDay = isDateDisabled(day)
              const selected = isSameDay(day)
              const todayMatch = isToday(day)

              return (
                <button
                  type="button"
                  key={`${calendarDays.month}-${day}`}
                  onClick={() => handleSelectDay(day)}
                  disabled={disabledDay}
                  className={`h-9 w-9 rounded-full text-sm transition ${
                    selected
                      ? 'bg-primary text-primary-foreground shadow'
                      : todayMatch
                        ? 'border border-primary/50 text-primary'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800'
                  } ${disabledDay ? 'cursor-not-allowed text-slate-300 hover:bg-transparent dark:text-slate-600' : ''}`}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
