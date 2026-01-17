# Prompt Codex – Frontend: Componente global de reportes PDF + Comprobante de Asiento (Journal) en PrestaNet

**IMPORTANTE (reglas de trabajo):**
- **NO** ejecutes `npm`, `pnpm`, `yarn`, `vite`, `eslint`.
- **NO** uses `git`.
- Solo genera o modifica archivos de **frontend** en este repo.
- Respeta al 100% la arquitectura y convenciones definidas en `agents.md`:
  - React + TypeScript
  - Clean Architecture: `presentation` / `core` / `infrastructure` / `router`
  - Axios centralizado ya existente
  - Validación con **Yup**
  - DTOs **uno por archivo**
  - Nombres de archivos en **kebab-case**
  - `tsconfig` con `erasableSyntaxOnly`: **no usar parameter properties** en constructores (evitar `constructor(private x: ...)`).

**MUY IMPORTANTE:**
- Debes asumir que la librería `@react-pdf/renderer` **ya está instalada** en el proyecto.
- **No** intentes instalarla solo `import` y úsala.

---

## 0) Contexto funcional

- Ya existe módulo contable con:
  - Plan de cuentas
  - Centros de costo
  - Períodos contables + cierre que abre siguiente
  - Diario (Journal) con estados `draft`, `posted`, `voided`
  - Anulación genera asiento inverso `posted`
- Ya existe pantalla de **detalle de asiento contable** (JournalEntryDetail) en el frontend.
- Se desea:
  1. Definir un **componente global de reportes PDF** reutilizable para todo el sistema (no solo contabilidad).
  2. Implementar un **reporte PDF específico** para el comprobante de asiento contable (voucher) usando ese layout global.
  3. Integrarlo en la pantalla de detalle de Journal para poder:
     - Ver
     - Descargar / imprimir
     el comprobante del asiento.

---

## 1) Librería a usar (suposición)

Usa `@react-pdf/renderer` para generar PDFs.

Ejemplos de imports (NO instales nada, solo usa):

```ts
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
```

2) Estructura global de reportes

Crear una pequeña “infraestructura de reportes PDF” bajo:

src/presentation/components/reports/

2.1 report-layout.tsx

Crear un componente base reutilizable para reportes PDF:

Exportar:

ReportLayoutProps

ReportLayout (componente)

Objetivo:

Proveer un layout común:

Encabezado con:

Logo de PrestaNet (si se pasa como prop)

Nombre de la entidad

Título del reporte

Subtítulo opcional (ej. fecha, número de documento)

Pie de página con:

Texto pequeño: nombre del sistema, fecha/hora de impresión, número de página (si es factible con @react-pdf/renderer).

Estilos básicos consistentes (tipografías, tamaños, bordes de tabla, etc.).

ReportLayoutProps sugeridos:

```ts
export interface ReportLayoutProps {
  title: string;                     // Ej. "Comprobante de Asiento Contable"
  subtitle?: string;                 // Ej. "Asiento 202601-000012"
  organizationName?: string;        // Ej. "PrestaNet"
  logoUrl?: string;                 // URL absoluta o base64; dejar opcional
  children: React.ReactNode;        // Contenido del cuerpo del reporte
  showPrintMetadata?: boolean;      // Mostrar "Generado el ... por ..."
}
```
ReportLayout debe:

Renderizar un Document y 1 o más Page.

Encapsular estilos en StyleSheet.create.

Exponer un diseño neutral (colores sobrios, bordes ligeros, tipografía estándar) apto para impresión.

Nota: No “amarres” el layout solo a contabilidad; debe poder usarse para otros reportes en futuro.

3) Reporte PDF específico: Comprobante de Asiento (Journal Voucher)

Crear archivo:

src/presentation/components/reports/journal-entry-voucher-report.tsx

Este componente debe usar ReportLayout internamente y ser específico para mostrar un JournalEntryDetail.

3.1 Props del reporte


```ts
import { JournalEntryDetail } from '@/infrastructure/interfaces/accounting/journal-entry';

export interface JournalEntryVoucherReportProps {
  entry: JournalEntryDetail;
  organizationName?: string;
  logoUrl?: string;
}
```

Donde JournalEntryDetail ya existe y contiene (según backend):

id

date

periodId

number

description

state

sequence

source

costCenterId

totalDebit

totalCredit

lines: JournalEntryLineDto[]:

accountCode

accountName

description

debit

credit

etc.

3.2 Diseño del PDF del comprobante

Dentro de JournalEntryVoucherReport:

Usar ReportLayout como base.

Título sugerido: "Comprobante de Asiento Contable".

Subtítulo sugerido: "Asiento N. {entry.number}" si existe.

Cuerpo debe incluir secciones:

Encabezado de asiento

Número de asiento (entry.number)

Fecha contable (entry.date)

Período (puede mostrarse como año/mes si se tiene, o dejar sólo fecha)

Estado (posted, voided) usando texto legible:

Contabilizado, Anulado, etc.

Datos adicionales

Origen:

source (Manual / Sistema)

sourceModule si está disponible en DTO (si no, dejar espacio para futuro).

Centro de costo (si se tiene nombre, mostrarlo; si solo id, mostrar “Centro de costo: {id}”).

Tabla de líneas contables

Columnas:

Código de cuenta

Nombre de cuenta

Descripción (línea)

Debe

Haber

Mostrar todas las líneas del entry.lines.

Totales:

Fila final con sumatoria de debit y credit.

Sección de firmas

Una fila con 2–3 columnas de firma tipo:

Elaborado por

Revisado por

Autorizado por

Usar estilos limpios:

Filas alternadas opcionales suave (pero no obligatorio).

Cantidades alineadas a la derecha.

Montos con 2 decimales; usar función de formateo de moneda simple (ej. basarse en Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' })) si se permite; si no, usar toFixed(2).

4) Helper para renderizar PDF en React

Crear un componente que sirva como “bridge” entre React (DOM) y React-PDF:

Archivo:

src/presentation/components/reports/pdf-viewer-dialog.tsx (o nombre similar)

Este componente debe:

Recibir como props:

isOpen: boolean

onClose: () => void

document: React.ReactElement // <Document>...</Document> de @react-pdf/renderer

title?: string

Mostrar un dialogo/modal (reusar el sistema de modales que ya usas en PrestaNet: shadcn/ui, MUI, componente custom, etc.).

Dentro del modal:

Mostrar un visor de PDF. Opciones:

Opción A (simple): botón “Descargar PDF” que use pdf(<Document />).toBlob() o toDataURL() y luego:

crear un link temporal y hacer download, o

abrir en otra pestaña.

Opción B (más avanzada): usar <PDFViewer> de @react-pdf/renderer dentro del modal (si tu stack lo permite bien).

Incluye botones:

“Cerrar”

“Descargar / Imprimir” (lo que sea más directo usando la API de @react-pdf/renderer).

Importante:
Implementa una versión funcional (aunque no sea ultra sofisticada).
Es válido empezar con:

Botón “Descargar PDF”: genera Blob y dispara window.open(url) o download para que el usuario imprima desde el visor del navegador.

5) Integración con pantalla de detalle de Journal

Localiza la página de detalle de asiento en:

src/presentation/features/accounting/journal/pages/
(o el path equivalente según ya esté implementado, por ejemplo journal-entry-detail-page.tsx o similar).

5.1 Botón “Imprimir / Ver comprobante”

En la parte superior de la página (o en la zona de acciones), agrega:

Botón tipo “Imprimir comprobante” o “Ver comprobante PDF”.

Sólo habilitado cuando:

el asiento existe (ya cargado),

idealmente cuando está en posted o voided (para no imprimir borradores; puedes dejar esto parametrizable).

5.2 Uso del PDF viewer

Cuando el usuario haga clic:

Construir el componente <JournalEntryVoucherReport entry={entry} organizationName="PrestaNet" />.

Pasarlo como document al PdfViewerDialog.

Abrir el modal.

El flujo esperado:

Usuario entra a detalle del asiento.

Ve la info en pantalla.

Hace clic en “Imprimir comprobante”.

Se abre modal con la opción de:

ver el PDF en un visor,

o descargarlo para imprimir.

6) Consideraciones de estilo y reusabilidad

ReportLayout debe ser suficientemente genérico para que en el futuro se usen otros componentes de reporte:

Estados de cuenta.

Comprobantes de pago.

Reportes de ahorros/créditos.

Mantén estilos sobrios, con márgenes razonables para impresión (min 1.5–2 cm).

Usa tamaños estándar como Page size="A4" para este comprobante contable.

7) Manejo de errores

Si la generación de PDF falla (por ejemplo, error al crear Blob), mostrar un mensaje de error usando el sistema global de notificaciones/toasts.

Si el entry no está cargado aún, deshabilitar el botón de imprimir.

8) Criterios de aceptación

Existe un ReportLayout genérico en presentation/components/reports/report-layout.tsx que se pueda reutilizar.

Existe un componente JournalEntryVoucherReport que recibe un JournalEntryDetail y genera un PDF de comprobante contable usando @react-pdf/renderer.

Existe un componente tipo PdfViewerDialog que permite ver/descargar el PDF desde la app React.

En la página de detalle de asiento contable aparece un botón “Imprimir comprobante” (o similar) que abre el PDF del asiento actual.

El código no ejecuta comandos de terminal ni modifica backend.

Toda la lógica de HTTP permanece en core/api + core/actions; este cambio solo toca presentation (más el layout PDF reutilizable).

Entregable

Genera o modifica los archivos necesarios en:

src/presentation/components/reports/report-layout.tsx

src/presentation/components/reports/accounting/journal-entry-voucher-report.tsx

src/presentation/components/reports/pdf-viewer-dialog.tsx

src/presentation/features/accounting/journal/** (página de detalle, para integrar el botón y el modal)

No ejecutes npm, no instales librerías.
Solo debes asumir que @react-pdf/renderer ya está instalada y disponible.