type MessageTone = 'info' | 'success' | 'warning' | 'error'

interface MessageModalProps {
  open: boolean
  title: string
  description: string
  tone?: MessageTone
  acknowledgeLabel?: string
  onAcknowledge: () => void
}

const toneClasses: Record<MessageTone, string> = {
  info: 'bg-sky-50 text-sky-800 dark:bg-sky-900/30 dark:text-sky-100',
  success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100',
  warning: 'bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100',
  error: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-100',
}

const buttonToneClasses: Record<MessageTone, string> = {
  info: 'border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 dark:border-sky-500/40 dark:bg-sky-900/30 dark:text-sky-100 dark:hover:bg-sky-900/45',
  success:
    'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-100 dark:hover:bg-emerald-900/45',
  warning:
    'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-900/30 dark:text-amber-100 dark:hover:bg-amber-900/45',
  error:
    'border-red-300 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-100 dark:hover:bg-red-900/45',
}

export const MessageModal = ({
  open,
  title,
  description,
  tone = 'info',
  acknowledgeLabel = 'OK',
  onAcknowledge,
}: MessageModalProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
      <div className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xl ring-1 ring-black/10 dark:border-slate-700 dark:bg-slate-950">
        <div className={`px-3.5 py-2.5 ${toneClasses[tone]}`}>
          <h3 className="text-sm font-semibold tracking-wide">{title}</h3>
        </div>

        <div className="px-4 py-4">
          <p className="text-xs leading-5 text-slate-700 dark:text-slate-200">{description}</p>
        </div>

        <div className="flex justify-center border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <button
            type="button"
            className={`min-w-20 rounded-md border px-5 py-1.5 text-xs font-medium transition-colors ${buttonToneClasses[tone]}`}
            onClick={onAcknowledge}
          >
            {acknowledgeLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
