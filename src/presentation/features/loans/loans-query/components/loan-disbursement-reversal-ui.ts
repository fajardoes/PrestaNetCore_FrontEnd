const replaceStatusLabels = (message: string) =>
  message
    .replace(/\bestado\s+DELINQUENT\b/gi, 'estado de mora')
    .replace(/\bDELINQUENT\b/gi, 'en mora')
    .replace(/\bDISBURSEMENT_REVERSED\b/gi, 'desembolso revertido')
    .replace(/\bACTIVE\b/gi, 'activo')
    .replace(/\bDISBURSED\b/gi, 'desembolsado')
    .replace(/\bMATURED\b/gi, 'vencido')
    .replace(/\bCLOSED\b/gi, 'cerrado')

export const translateDisbursementReversalMessage = (
  message?: string | null,
) => {
  if (!message?.trim()) return ''

  return replaceStatusLabels(message.trim()).replace(
    /(['"]?)loans\.disbursement_reversal(?:\.[a-z_]+)?\1/gi,
    'la reversión del desembolso',
  )
}
