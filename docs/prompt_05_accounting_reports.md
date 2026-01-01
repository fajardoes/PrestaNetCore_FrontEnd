# Rol del asistente

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

---

## 0) Contexto que debes asumir

Ya existen en el frontend de PrestaNet:

- Módulo **Contabilidad** con:
  - Pantallas de **Diario** (journal).
  - Pantalla de **Mayor** (ledger) por cuenta, integrada al backend `/api/accounting/ledger`.
- Infraestructura de PDFs reutilizable:

  - `src/presentation/components/reports/report-layout.tsx`  
    → Layout genérico de reportes con `@react-pdf/renderer`.
  - `src/presentation/components/reports/pdf-viewer-dialog.tsx`  
    → Modal/diálogo reutilizable para ver/descargar PDFs.
  - Reportes contables ya hechos:
    - `JournalEntryVoucherReport` (comprobante de asiento).
    - `GeneralLedgerReport` (libro mayor por cuenta).

- Sistema de rutas y layout principal donde ya se agrupan las pantallas de contabilidad (sidebar/menu “Contabilidad” o similar).
- Un cliente HTTP central (Axios/Fetch wrapper) en `src/infrastructure` que ya se usa para `journal`, `ledger`, etc.  
  **Debes reutilizarlo** para los nuevos reportes, no crear instancias nuevas.

En el **backend** ya están disponibles los nuevos endpoints:

- `GET /api/accounting/reports/trial-balance`
- `GET /api/accounting/reports/balance-sheet`
- `GET /api/accounting/reports/income-statement`

con DTOs similares a los descritos en el prompt backend (TrialBalanceResultDto, BalanceSheetResultDto, IncomeStatementResultDto).

---

## 1) Objetivo en el frontend

Agregar en PrestaNet **pantallas y PDFs** para los nuevos reportes contables:

1. **Balance de Comprobación** (Trial Balance)  
2. **Balance General** (Balance Sheet / Estado de Situación Financiera)  
3. **Estado de Resultados** (Income Statement)

Cada reporte debe tener:

- Página propia con filtros y tabla/resumen.
- Integración con el backend (usando Axios central).
- Botón **“Exportar a PDF”** que use:
  - `ReportLayout` como base.
  - `PdfViewerDialog` para ver/descargar el PDF desde el navegador.

---

## 2) Infraestructura de API (src/infrastructure)

### 2.1. DTOs de lectura

En `src/infrastructure/accounting/dtos/reports/` (o ruta equivalente siguiendo el patrón actual), crea:

1. `trial-balance-request.dto.ts`
2. `trial-balance-result.dto.ts`
3. `financial-statements-request.dto.ts`
4. `balance-sheet-result.dto.ts`
5. `income-statement-result.dto.ts`

Respeta los DTOs del backend, usando nombres en PascalCase para interfaces TypeScript.

Ejemplos (ajusta nombres de campos para que coincidan con la API real):

```ts
// trial-balance-request.dto.ts
export interface TrialBalanceRequestDto {
  fromDate?: string;        // 'YYYY-MM-DD'
  toDate?: string;          // 'YYYY-MM-DD'
  periodId?: string;
  costCenterId?: string;
  includeSubaccounts?: boolean;
  includeZeroBalanceAccounts?: boolean;
}

// trial-balance-result.dto.ts
export interface TrialBalanceRowDto {
  accountId: string;
  accountCode: string;
  accountName: string;
  parentAccountCode?: string | null;
  parentAccountName?: string | null;
  level: number;
  openingBalance: number;
  debit: number;
  credit: number;
  closingBalance: number;
}

export interface TrialBalanceResultDto {
  fromDate: string;
  toDate: string;
  periodId?: string | null;
  costCenterId?: string | null;
  costCenterName?: string | null;
  rows: TrialBalanceRowDto[];
  totalOpeningBalance: number;
  totalDebit: number;
  totalCredit: number;
  totalClosingBalance: number;
}
```
Análogamente para:

FinancialStatementsRequestDto

BalanceSheetAccountDto, BalanceSheetGroupDto, BalanceSheetResultDto

IncomeStatementAccountDto, IncomeStatementGroupDto, IncomeStatementResultDto

Regla importante: un DTO por archivo .ts.

2.2. Cliente de API de reportes contables

En src/infrastructure/accounting/api/ crea un módulo tipo:

accounting-reports-api.ts

Este módulo debe:

Importar la instancia central de Axios (la misma que se usa para journal/ledger).

Exponer funciones:
```ts
export async function getTrialBalance(params: TrialBalanceRequestDto): Promise<TrialBalanceResultDto> { ... }

export async function getBalanceSheet(params: FinancialStatementsRequestDto): Promise<BalanceSheetResultDto> { ... }

export async function getIncomeStatement(params: FinancialStatementsRequestDto): Promise<IncomeStatementResultDto> { ... }

```
Detalles:

Usar GET con query params contra:

/api/accounting/reports/trial-balance

/api/accounting/reports/balance-sheet

/api/accounting/reports/income-statement

Manejar errores propagando excepciones para que las maneje la capa de presentación (toasts, etc.), de la misma forma que se hace para otros módulos.

3) Capa core: hooks / lógica de carga

En src/core/accounting/reports/ crea hooks tipo:

use-trial-balance.ts

use-balance-sheet.ts

use-income-statement.ts

Cada hook se encargará de:

Mantener el estado de:

isLoading

error (string | null)

data (DTO correspondiente) o null

Exponer una función load que reciba los filtros del formulario y llame al API.

Ejemplo conceptual para Trial Balance:
```ts
export interface TrialBalanceFilters {
  fromDate?: string;
  toDate?: string;
  periodId?: string;
  costCenterId?: string;
  includeSubaccounts: boolean;
  includeZeroBalanceAccounts: boolean;
}

export function useTrialBalance() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TrialBalanceResultDto | null>(null);

  const load = useCallback(async (filters: TrialBalanceFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const request: TrialBalanceRequestDto = {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        periodId: filters.periodId,
        costCenterId: filters.costCenterId,
        includeSubaccounts: filters.includeSubaccounts,
        includeZeroBalanceAccounts: filters.includeZeroBalanceAccounts,
      };

      const response = await getTrialBalance(request);
      setData(response);
    } catch (err) {
      // reutilizar helper global de manejo de errores si existe
      setError('No se pudo cargar el balance de comprobación.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, data, load };
}

```
Para useBalanceSheet y useIncomeStatement es el mismo patrón, cambiando DTOs y textos.

4) Presentación: páginas de reportes contables
4.1. Estructura de rutas

En src/presentation/features/accounting/ crea una carpeta reports/ con:

trial-balance-page.tsx

balance-sheet-page.tsx

income-statement-page.tsx

Cada “page” será una página completa con:

Un formulario de filtros arriba.

Una tabla/resumen de resultados.

Botón “Exportar a PDF”.

Integra estas páginas en el router existente (por ejemplo en src/router/accounting-routes.tsx), añadiendo rutas como:

/accounting/reports/trial-balance

/accounting/reports/balance-sheet

/accounting/reports/income-statement

Y añade entradas al menú lateral bajo el grupo “Contabilidad / Reportes”.

4.2. Componentes de filtro (UI)

Reutiliza los componentes de formulario ya existentes (inputs, selects, datepickers) y el esquema Yup/React Hook Form que PrestaNet ya usa.

Para cada página:

Trial Balance

Filtros sugeridos:

Período contable:

periodId (select) o fromDate + toDate (date pickers).

Si se selecciona periodId, puedes deshabilitar los datepickers o llenarlos automáticamente.

Sucursal / centro de costo:

costCenterId (select).

Opciones:

includeSubaccounts (checkbox).

includeZeroBalanceAccounts (checkbox).

Balance General / Estado de Resultados

Filtros similares, pero más simples:

periodId o fromDate + toDate.

costCenterId.

4.3. Tablas / visualización

Trial Balance Page

Tabla con columnas:

Código

Cuenta

Saldo inicial

Débitos

Créditos

Saldo final

Mostrar totales al pie de la tabla usando TrialBalanceResultDto (totalDebit, etc.).

Montos alineados a la derecha, con 2 decimales.

Si IncludeSubaccounts == false, se mostrarán solo cuentas “resumen”; si true, también subcuentas.

Balance Sheet Page

Mostrar sección por grupos:

Activo

Pasivo

Patrimonio

Para cada grupo:

Título con el nombre (ej. “Activo”).

Lista/tabla de cuentas con:

Código

Nombre

Saldo

Total del grupo.

Mostrar resumen global:

TotalAssets

TotalLiabilities

TotalEquity

Income Statement Page

Secciones por grupos:

Ingresos

Gastos

Otros (si aplica)

Para cada grupo:

Código y nombre del grupo.

Cuentas con código, nombre y saldo del período.

Mostrar resumen:

TotalIncome

TotalExpenses

NetResult (Utilidad/Pérdida del período).

5) PDFs de los nuevos reportes

Usa el layout y el visor global que ya tienes:

ReportLayout (report-layout.tsx)

PdfViewerDialog (pdf-viewer-dialog.tsx)

5.1. Componentes PDF específicos

En src/presentation/components/reports/accounting/ crea:

trial-balance-report.tsx

balance-sheet-report.tsx

income-statement-report.tsx

Cada uno debe:

Usar @react-pdf/renderer (Document, Page, View, Text, etc.).

Usar ReportLayout como contenedor principal.

Recibir props fuertemente tipadas basadas en los DTOs de infraestructura:

Para Trial Balance:
```ts
export interface TrialBalanceReportProps {
  companyName: string;
  logoUrl?: string;
  result: TrialBalanceResultDto; // directamente el DTO
  currencyCode: string;         // fijo o parametrizable
}

```
Para Balance Sheet:

```ts
export interface BalanceSheetReportProps {
  companyName: string;
  logoUrl?: string;
  result: BalanceSheetResultDto;
  currencyCode: string;
}

```
Para Income Statement:

```ts
export interface IncomeStatementReportProps {
  companyName: string;
  logoUrl?: string;
  result: IncomeStatementResultDto;
  currencyCode: string;
}

```
Dentro de ReportLayout, renderizar:

Encabezado con:

Título: “Balance de Comprobación”, “Balance General”, “Estado de Resultados”.

Subtítulo: período (ej. "Del {fromDate} al {toDate}").

Nombre de sucursal si CostCenterName no es null.

Cuerpo: tablas/estructuras equivalentes a las que se ven en la página.

Pie de página: puedes reutilizar el mismo estilo que otros reportes (usuario + fecha/hora de generación si se pasa como prop o se genera localmente).

Importante:

Para fechas en PDFs, evita usar new Date() con zona horaria; utiliza helpers como:

formatDateFromString('YYYY-MM-DD') → 'dd/MM/yyyy' (sin tocar timezone).

Montos alineados a la derecha.

5.2. Integración con PdfViewerDialog

En cada página (trial-balance-page.tsx, balance-sheet-page.tsx, etc.):

Mantener estado para el dialog:
```ts
const [showPdf, setShowPdf] = useState(false);
```
Agregar botón “Exportar a PDF” que:

Solo se habilita cuando hay data cargada.

Al hacer clic, setea showPdf = true.

Renderizar el PdfViewerDialog:

```ts
<PdfViewerDialog
  isOpen={showPdf && !!data}
  onClose={() => setShowPdf(false)}
  title="Balance de Comprobación"
  document={
    data ? (
      <TrialBalanceReport
        companyName="Nombre de la Entidad"
        currencyCode="HNL"
        result={data}
      />
    ) : null
  }
/>

```
Análogo para BalanceSheetReport y IncomeStatementReport.
6) Manejo de errores y UX

Usa los mismos patrones de UX que el resto de la app:

Spinners / indicadores de carga mientras isLoading === true.

Mensajes de error (toasts, banners) si error no es null.

Si el usuario intenta exportar a PDF sin haber consultado el reporte:

Deshabilitar el botón o mostrar mensaje de “No hay datos para exportar”.

7) Criterios de aceptación

Balance de Comprobación

Nueva ruta en el frontend para TrialBalancePage.

Formulario de filtros:

Período (periodId o rango de fechas).

Cost center/sucursal.

Opciones (subcuentas / cuentas en cero).

Tabla con filas por cuenta (o cuenta padre) y totales.

Botón “Exportar a PDF” que abre PdfViewerDialog con TrialBalanceReport.

Balance General

Nueva ruta para BalanceSheetPage.

Filtros (período + cost center).

Secciones por grupo (Activo, Pasivo, Patrimonio).

Resumen de totales.

Botón “Exportar a PDF” → BalanceSheetReport.

Estado de Resultados

Nueva ruta para IncomeStatementPage.

Filtros (período + cost center).

Secciones por grupos de ingresos/gastos.

Resumen de TotalIncome, TotalExpenses, NetResult.

Botón “Exportar a PDF” → IncomeStatementReport.

Todo el código:

Respeta la estructura presentation/core/infrastructure/router.

No introduce librerías nuevas.

Usa report-layout y pdf-viewer-dialog ya existentes.

Usa los clientes HTTP y patrones de error ya definidos en PrestaNet.