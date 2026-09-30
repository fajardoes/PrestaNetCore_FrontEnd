import { Extension, Node } from '@tiptap/core'
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    documentTextAlign: {
      setDocumentTextAlign: (alignment: 'left' | 'center' | 'right') => ReturnType
    }
    documentVariable: {
      insertDocumentVariable: (expression: string) => ReturnType
    }
    documentInstallments: {
      insertDocumentInstallments: () => ReturnType
    }
  }
}

const allowedTextAlignments = ['left', 'center', 'right'] as const

export const DocumentTextAlignExtension = Extension.create({
  name: 'documentTextAlign',
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element) => {
              const alignment = element.getAttribute('align')
              return allowedTextAlignments.includes(alignment as (typeof allowedTextAlignments)[number])
                ? alignment
                : null
            },
            renderHTML: (attributes) =>
              allowedTextAlignments.includes(attributes.textAlign as (typeof allowedTextAlignments)[number])
                ? { align: attributes.textAlign }
                : {},
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setDocumentTextAlign:
        (alignment) =>
        ({ commands }) => {
          const attributes = { textAlign: alignment }
          return commands.updateAttributes('paragraph', attributes)
            || commands.updateAttributes('heading', attributes)
        },
    }
  },
})

const readExpression = (element: HTMLElement) => {
  const match = /^\{\{\s*([^{}]+?)\s*\}\}$/.exec(element.textContent?.trim() ?? '')
  return match ? { expression: match[1].trim() } : false
}

export const DocumentVariableExtension = Node.create({
  name: 'documentVariable',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return { expression: { default: '' } }
  },
  parseHTML() {
    return [{ tag: 'span.document-variable-chip', getAttrs: (element) => readExpression(element as HTMLElement) }]
  },
  renderHTML({ node }) {
    return ['span', { class: 'document-variable-chip' }, `{{${node.attrs.expression}}}`]
  },
  renderText({ node }) {
    return `{{${node.attrs.expression}}}`
  },
  addCommands() {
    return {
      insertDocumentVariable:
        (expression: string) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { expression } }),
    }
  },
})

const InstallmentsTableNodeView = ({ selected }: NodeViewProps) => (
  <NodeViewWrapper as="div" className="my-4" contentEditable={false}>
    <div
      className={`overflow-hidden rounded-lg border bg-white dark:bg-slate-950 ${
        selected ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-300 dark:border-slate-700'
      }`}
      aria-label="Tabla controlada de cuotas"
    >
      <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        Tabla controlada de cuotas del préstamo
      </div>
      <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
        <thead className="bg-slate-100 dark:bg-slate-900">
          <tr>
            {['Cuota', 'Vencimiento', 'Capital', 'Interés', 'Total', 'Saldo'].map((heading) => (
              <th key={heading} className="px-2 py-2 font-semibold">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-200 dark:border-slate-800">
            <td className="px-2 py-2">1</td>
            <td className="px-2 py-2">15/02/2026</td>
            <td className="px-2 py-2">L 0.00</td>
            <td className="px-2 py-2">L 0.00</td>
            <td className="px-2 py-2">L 0.00</td>
            <td className="px-2 py-2">L 0.00</td>
          </tr>
          <tr className="border-t border-slate-200 dark:border-slate-800">
            <td className="px-2 py-2 text-slate-500 dark:text-slate-400" colSpan={6}>
              Los datos visibles aquí son ilustrativos.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </NodeViewWrapper>
)

export const DocumentInstallmentsExtension = Node.create({
  name: 'documentInstallments',
  group: 'block',
  atom: true,
  selectable: true,
  parseHTML() {
    return [{ tag: 'table.document-installments-table' }]
  },
  renderHTML() {
    return [
      'table',
      { class: 'document-installments-table' },
      ['thead', {}, ['tr', {},
        ['th', {}, 'Cuota'],
        ['th', {}, 'Vencimiento'],
        ['th', {}, 'Capital'],
        ['th', {}, 'Interés'],
        ['th', {}, 'Total'],
        ['th', {}, 'Saldo'],
      ]],
      ['tbody', {},
        '{{#each loan.installments}}',
        ['tr', {},
          ['td', {}, '{{this.installment_no}}'],
          ['td', {}, '{{this.due_date}}'],
          ['td', {}, '{{this.principal}}'],
          ['td', {}, '{{this.interest}}'],
          ['td', {}, '{{this.total}}'],
          ['td', {}, '{{this.outstanding_amount}}'],
        ],
        '{{/each}}',
      ],
    ]
  },
  addCommands() {
    return {
      insertDocumentInstallments:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name }),
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(InstallmentsTableNodeView)
  },
})
