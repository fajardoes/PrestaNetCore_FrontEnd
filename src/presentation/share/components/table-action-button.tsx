import type { ButtonHTMLAttributes } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Ban,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  KeyRound,
  Lock,
  Pencil,
  Plus,
  Power,
  Printer,
  RotateCcw,
  ShieldOff,
  Trash2,
  UserRoundCog,
  type LucideIcon,
} from 'lucide-react'

const tableActionIcons = {
  add: Plus,
  collapse: ChevronUp,
  delete: Trash2,
  disable: ShieldOff,
  download: Download,
  edit: Pencil,
  expand: ChevronDown,
  key: KeyRound,
  lock: Lock,
  moveDown: ArrowDown,
  moveUp: ArrowUp,
  manage: UserRoundCog,
  post: Check,
  print: Printer,
  reverse: RotateCcw,
  select: Check,
  toggle: Power,
  view: Eye,
  void: Ban,
} satisfies Record<string, LucideIcon>

export type TableActionIcon = keyof typeof tableActionIcons

interface TableActionButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> {
  icon: TableActionIcon
  label: string
  tooltip?: string
}

export const TableActionButton = ({
  icon,
  label,
  tooltip,
  className,
  type = 'button',
  ...buttonProps
}: TableActionButtonProps) => {
  const Icon = tableActionIcons[icon]
  const classes = ['btn-table-action', 'w-7', 'px-0', className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...buttonProps}
      type={type}
      className={classes}
      aria-label={label}
      title={tooltip ?? label}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  )
}
