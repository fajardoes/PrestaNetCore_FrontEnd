import { useEffect, useState, type ReactNode } from 'react'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/react'
import type { Editor as TiptapEditor } from '@tiptap/core'
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react'
import type { DocumentVariableCatalogItemDto } from '@/infrastructure/documents/dtos/document-template-admin.dto'
import {
  DocumentInstallmentsExtension,
  DocumentTextAlignExtension,
  DocumentVariableExtension,
} from '@/presentation/features/documents/templates/components/document-template-editor-extensions'
import '@/presentation/features/documents/templates/components/document-template-editor.css'

const editorExtensions = [
  StarterKit.configure({ link: false }),
  DocumentTextAlignExtension,
  DocumentVariableExtension,
  DocumentInstallmentsExtension,
]

interface DocumentRichTextEditorProps {
  value: string
  onChange: (html: string) => void
  variables: DocumentVariableCatalogItemDto[]
  rootContext: string
  disabled?: boolean
  label: string
}

export const DocumentRichTextEditor = ({
  value,
  onChange,
  variables,
  rootContext,
  disabled = false,
  label,
}: DocumentRichTextEditorProps) => {
  const [selectedVariable, setSelectedVariable] = useState('')
  const editor = useEditor({
    extensions: editorExtensions,
    content: value || '<p></p>',
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'document-template-prosemirror min-h-full focus:outline-none',
        'aria-label': label,
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [disabled, editor])

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
    }
  }, [editor, value])

  const scalarVariables = variables.filter((item) => !item.isCollection)
  const categories = Array.from(new Set(scalarVariables.map((item) => item.category)))
  const canInsertInstallments = rootContext === 'LOAN' || rootContext === 'DISBURSEMENT'

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-900">
        <ToolbarButton label="Negrita" disabled={disabled} active={Boolean(editor?.isActive('bold'))} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton label="Cursiva" disabled={disabled} active={Boolean(editor?.isActive('italic'))} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton label="Título" disabled={disabled} active={Boolean(editor?.isActive('heading', { level: 2 }))} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton label="Lista con viñetas" disabled={disabled} active={Boolean(editor?.isActive('bulletList'))} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          • Lista
        </ToolbarButton>
        <ToolbarButton label="Lista numerada" disabled={disabled} active={Boolean(editor?.isActive('orderedList'))} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
          1. Lista
        </ToolbarButton>
        <span className="mx-1 hidden h-6 w-px bg-slate-300 dark:bg-slate-700 sm:inline-block" />
        <ToolbarButton label="Alinear a la izquierda" disabled={disabled} active={isTextAlignmentActive(editor, 'left')} onClick={() => editor?.chain().focus().setDocumentTextAlign('left').run()}>
          <AlignLeft aria-hidden="true" className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Centrar" disabled={disabled} active={isTextAlignmentActive(editor, 'center')} onClick={() => editor?.chain().focus().setDocumentTextAlign('center').run()}>
          <AlignCenter aria-hidden="true" className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Alinear a la derecha" disabled={disabled} active={isTextAlignmentActive(editor, 'right')} onClick={() => editor?.chain().focus().setDocumentTextAlign('right').run()}>
          <AlignRight aria-hidden="true" className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="mx-1 hidden h-6 w-px bg-slate-300 dark:bg-slate-700 sm:inline-block" />
        <label className="sr-only" htmlFor={`variable-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>Seleccionar variable</label>
        <select
          id={`variable-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          className="max-w-64 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          value={selectedVariable}
          onChange={(event) => setSelectedVariable(event.target.value)}
          disabled={disabled || scalarVariables.length === 0}
        >
          <option value="">Insertar variable…</option>
          {categories.map((category) => (
            <optgroup key={category} label={category}>
              {scalarVariables.filter((item) => item.category === category).map((item) => (
                <option key={item.code} value={item.code}>{item.displayName}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <button
          type="button"
          className="rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200 dark:hover:bg-sky-900"
          disabled={disabled || !selectedVariable || !editor}
          onClick={() => {
            editor?.chain().focus().insertDocumentVariable(selectedVariable).run()
            setSelectedVariable('')
          }}
        >
          Insertar chip
        </button>
        {canInsertInstallments ? (
          <button
            type="button"
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            disabled={disabled || !editor}
            onClick={() => editor?.chain().focus().insertDocumentInstallments().run()}
          >
            Insertar tabla de cuotas
          </button>
        ) : null}
      </div>
      <div className="h-48 min-h-48 max-h-[70vh] resize-y overflow-auto border-b border-slate-200 dark:border-slate-800">
        <EditorContent editor={editor} />
      </div>
      <div className="border-t border-slate-200 px-3 py-1.5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Arrastra la esquina inferior para ajustar el alto. Las variables se insertan como chips y se validan contra el contexto {rootContextLabel(rootContext)}.
      </div>
    </div>
  )
}

const rootContextLabel = (rootContext: string) => ({
  LOAN_APPLICATION: 'solicitud de préstamo',
  LOAN: 'préstamo',
  DISBURSEMENT: 'desembolso',
}[rootContext] ?? rootContext)

const isTextAlignmentActive = (
  editor: TiptapEditor | null,
  alignment: 'left' | 'center' | 'right',
) => Boolean(
  editor?.isActive('paragraph', { textAlign: alignment })
  || editor?.isActive('heading', { textAlign: alignment }),
)

interface ToolbarButtonProps {
  label: string
  active: boolean
  disabled: boolean
  onClick: () => void
  children: ReactNode
}

const ToolbarButton = ({ label, active, disabled, onClick, children }: ToolbarButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    aria-pressed={active}
    disabled={disabled}
    onClick={onClick}
    className={`rounded-md border px-2.5 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
      active
        ? 'border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100'
        : 'border-transparent text-slate-700 hover:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800'
    }`}
  >
    {children}
  </button>
)
