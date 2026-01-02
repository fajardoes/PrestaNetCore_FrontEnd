## 9) Reporte PDF del Mayor contable (General Ledger)

Ahora que ya existe:

- `ReportLayout` en `src/presentation/components/reports/report-layout.tsx`
- `PdfViewerDialog` en `src/presentation/components/reports/pdf-viewer-dialog.tsx`
- `JournalEntryVoucherReport` para comprobante de asiento

debes implementar un **reporte PDF para el Mayor contable** y conectarlo con la pantalla de consulta de Mayor.

### 9.1 Componente de reporte PDF para Mayor

Crea un archivo:

`src/presentation/components/reports/accounting/general-ledger-report.tsx`

Este componente debe:

- Usar `@react-pdf/renderer` y **reutilizar `ReportLayout`** como layout base.
- Ser totalmente presentacional: solo recibe props, no hace llamadas HTTP.

#### Props sugeridas

Primero define tipos internos para el reporte:

```ts
export interface GeneralLedgerLine {
  date: string;             // fecha del movimiento (formato amigable ya procesado)
  documentNumber: string;   // número de documento / referencia externa
  journalEntryNumber?: string; // número de asiento contable (si aplica)
  description: string;      // glosa del movimiento
  debit: number;            // movimiento al Debe
  credit: number;           // movimiento al Haber
  balance: number;          // saldo acumulado luego de este movimiento
}

export interface GeneralLedgerReportProps {
  accountCode: string;
  accountName: string;
  currencyCode: string;     // Ej. "HNL"
  periodLabel: string;      // Ej. "01/01/2026 al 31/01/2026"
  openingBalance: number;   // saldo inicial del período
  lines: GeneralLedgerLine[];
  totals: {
    totalDebit: number;
    totalCredit: number;
    finalBalance: number;
  };
  organizationName?: string;
  logoUrl?: string;
}
```
Si ya existe un DTO de “línea de Mayor” en infrastructure (por ejemplo GeneralLedgerLineDto o similar), no lo dupliques: reutilízalo para mapear los datos hacia GeneralLedgerLine.
Diseño del PDF

Tamaño: A4, orientación horizontal (landscape) para que quepa la tabla cómodamente.

Usa ReportLayout con:

title="Mayor contable"

subtitle algo tipo: "Cuenta ${accountCode} - ${accountName} (${periodLabel})"

organizationName y logoUrl si se reciben.

Dentro del children de ReportLayout:

Resumen inicial

Una pequeña sección tipo:

"Cuenta: {accountCode} - {accountName}"

"Moneda: {currencyCode}"

"Período: {periodLabel}"

"Saldo inicial: {openingBalance} {currencyCode}"

Tabla de movimientos

Columnas sugeridas:

Fecha

Doc.

Asiento

Descripción

Debe

Haber

Saldo

Recorre lines y muestra:

date

documentNumber

journalEntryNumber

description

debit

credit

balance

Requisitos de estilo:

Encabezados de tabla con un fondo gris muy suave y texto en negrita.

Montos (debit, credit, balance) alineados a la derecha, con 2 decimales.

Si usas helper de formateo de moneda, debe ser una función local pura (sin efectos colaterales). Si es más simple, usar debit.toFixed(2) etc.

Totales

Al final de la tabla, muestra una fila de totales:

En columnas de texto, deja "Totales" alineado a la derecha.

En Debe/Haber/Saldo, usa:

totals.totalDebit

totals.totalCredit

totals.finalBalance

Criterios de aceptación del componente

El componente GeneralLedgerReport exporta:

GeneralLedgerLine

GeneralLedgerReportProps

GeneralLedgerReport (componente por defecto o nombrado).

Usa ReportLayout y se ve consistente con el comprobante de asiento.

La orientación del Page es horizontal (orientation="landscape" o equivalente).

Las cantidades están alineadas a la derecha y con dos decimales.

10) Integración del PDF de Mayor con la pantalla de consulta de Mayor

Ubica la pantalla de Mayor contable existente en presentation, por ejemplo algo similar a:

src/presentation/features/accounting/general-ledger/pages/general-ledger-page.tsx

o src/presentation/features/accounting/ledger/pages/ledger-page.tsx

(Si el nombre es distinto, localiza la página donde actualmente se muestran los movimientos del Mayor por cuenta).

10.1 Botón "Exportar a PDF"

En la UI de la página de Mayor:

Cerca del formulario de filtros o del título de la página, agrega un botón:

Texto sugerido: "Exportar a PDF" o "Imprimir Mayor".

Icono opcional según las librerías que ya uses (no agregues nuevas libs solo por el icono).

Deshabilitar el botón cuando:

No haya datos cargados (por ejemplo lines.length === 0).

No se haya seleccionado cuenta, o el filtro esté inválido.

10.2 Uso de PdfViewerDialog + GeneralLedgerReport

La página de Mayor debe:

Tener estado local para controlar el diálogo:
```ts
const [showLedgerPdf, setShowLedgerPdf] = useState(false);
```
Tener un helper de mapeo que:

Tome los datos que ya se usan para renderizar la tabla del Mayor (cuenta, período, movimientos).

Construya un objeto GeneralLedgerReportProps.

Ejemplo conceptual:

```ts
const ledgerReportProps: GeneralLedgerReportProps | null = useMemo(() => {
  if (!selectedAccount || !ledgerData) {
    return null;
  }

  return {
    accountCode: selectedAccount.code,
    accountName: selectedAccount.name,
    currencyCode: ledgerData.currencyCode ?? 'HNL',
    periodLabel: buildPeriodLabel(filters),
    openingBalance: ledgerData.openingBalance,
    lines: ledgerData.lines.map(line => ({
      date: formatDate(line.date),
      documentNumber: line.documentNumber,
      journalEntryNumber: line.journalEntryNumber,
      description: line.description,
      debit: line.debit,
      credit: line.credit,
      balance: line.balance,
    })),
    totals: {
      totalDebit: ledgerData.totalDebit,
      totalCredit: ledgerData.totalCredit,
      finalBalance: ledgerData.finalBalance,
    },
    organizationName: 'PrestaNet',
    logoUrl: undefined, // dejar parametrizable
  };
}, [selectedAccount, ledgerData, filters]);

```

Importante: No hagas nuevas llamadas HTTP solo para el PDF. Reutiliza los datos ya traídos para la tabla del Mayor.

Integrar PdfViewerDialog:
```tsx
<PdfViewerDialog
  isOpen={showLedgerPdf && !!ledgerReportProps}
  onClose={() => setShowLedgerPdf(false)}
  title="Mayor contable"
  document={
    ledgerReportProps ? (
      <GeneralLedgerReport {...ledgerReportProps} />
    ) : null
  }
/>
```

Acción del botón:

Al hacer clic en “Exportar a PDF”:
```ts
const handleExportPdf = () => {
  if (!ledgerReportProps) return;
  setShowLedgerPdf(true);
};
```
10.3 Criterios de aceptación de la integración

En la pantalla de Mayor aparece el botón “Exportar a PDF” (o texto equivalente).

Al hacer clic, se abre PdfViewerDialog mostrando el GeneralLedgerReport para:

La cuenta seleccionada.

El período filtrado.

Los mismos movimientos que se muestran en la tabla.

El usuario puede cerrar el diálogo sin que se pierdan los filtros/estado de la pantalla.

Si no hay datos cargados, el botón está deshabilitado o no hace nada (no debe romper la UI).

11) Errores y casos límite

Si por alguna razón ledgerData o selectedAccount son null al intentar armar el PDF, no abras el dialog y opcionalmente muestra un toast genérico tipo “No hay información para generar el reporte”.

Si la generación del Blob en PdfViewerDialog falla, muestra la notificación de error reutilizando el sistema global de alerts/toasts de PrestaNet.

Resumen de nuevos archivos/cambios para este alcance

Nuevo archivo:

src/presentation/components/reports/accounting/general-ledger-report.tsx

Cambios en:

Pantalla de Mayor contable (general-ledger-page o equivalente):

Agregar botón “Exportar a PDF”.

Agregar estado showLedgerPdf.

Construir GeneralLedgerReportProps a partir de los datos ya existentes.

Usar PdfViewerDialog + GeneralLedgerReport.

No toques la lógica HTTP ni los endpoints del backend; toda la modificación es en la capa presentation.