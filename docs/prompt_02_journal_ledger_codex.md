# Prompt Codex – Frontend: Diario Contable (Journal) + Libro Mayor básico

**IMPORTANTE (reglas de trabajo):**
- **NO** ejecutes `npm`, `pnpm`, `yarn`, `vite`, `eslint`, ni ningún comando de terminal.
- **NO** uses `git`.
- Solo genera o modifica archivos de frontend en este repo.
- Respeta al 100% la arquitectura y convenciones definidas en `agents.md`:
  - React + TypeScript
  - Clean Architecture: `presentation` / `core` / `infrastructure` / `router`
  - Axios centralizado (instancia ya existente del proyecto)
  - Validación con **Yup** (no usar Zod)
  - DTOs **uno por archivo**
  - Nombres de archivos en **kebab-case**
  - `tsconfig` con `erasableSyntaxOnly`: **no usar parameter properties en constructores** (nada de `constructor(private x: ...)`).

---

## 0) Contexto backend (ya implementado)

El backend ya tiene implementado el **módulo de Diario** y un endpoint base de **Mayor**, con las siguientes rutas (todas con JWT requerido):

### Journal (Diario)

Base: `/api/accounting/journal`

- `GET /api/accounting/journal`
  - Query params: `page`, `pageSize`, `fromDate`, `toDate`, `periodId`, `state`, `costCenterId`, `source`, `search`
  - Response: `PagedResponseDto<JournalEntryListItemDto>`

- `GET /api/accounting/journal/{id}`
  - Response: `JournalEntryDetailDto`

- `POST /api/accounting/journal`
  - Crea un asiento en estado **draft**
  - Body: `CreateJournalEntryRequestDto`
  - Response: `JournalEntryDetailDto`

- `PUT /api/accounting/journal/{id}`
  - Actualiza un asiento **solo si está en draft**
  - Body: `UpdateJournalEntryRequestDto`
  - Response: `JournalEntryDetailDto`

- `POST /api/accounting/journal/{id}/post`
  - Pasa el asiento de `draft` a `posted`
  - Asigna:
    - `periodId`
    - `sequence` (correlativo por período)
    - `number` con formato `YYYYMM-######`
  - Response: `JournalEntryDetailDto`

- `POST /api/accounting/journal/{id}/void`
  - Anula un asiento `posted`
  - Crea asiento inverso `posted`
  - Marca el original como `voided`
  - Body: `VoidJournalEntryRequestDto`
  - Response: `JournalEntryDetailDto` del asiento original (ya `voided`)

Estados válidos:
- `draft`
- `posted`
- `voided`

### Ledger (Mayor base)

- `GET /api/accounting/ledger`
  - Query params:
    - `accountId` (requerido)
    - `fromDate`
    - `toDate`
    - `costCenterId?`
    - `includeOpeningBalance?` (bool)
  - Response (simplificada):
    - Lista de `LedgerEntryDto`:
      - `date`
      - `journalId`
      - `journalNumber`
      - `description`
      - `debit`
      - `credit`
      - `balance` (saldo acumulado simple)
    - Opcionalmente un `openingBalance` numérico (si el backend lo expone; asumir que sí o dejar campo opcional).

---

## 1) Objetivo en frontend

Implementar en el frontend de PrestaNet:

1. Un **módulo de Diario contable** donde se pueda:
   - listar asientos (paginado + filtros),
   - crear asientos en estado `draft`,
   - editar asientos `draft`,
   - postear asientos (`draft → posted`),
   - anular asientos `posted` (`posted → voided` con asiento inverso).

2. Una **pantalla básica de Libro Mayor**:
   - Seleccionar cuenta contable (del plan de cuentas ya implementado),
   - Elegir rango de fechas,
   - Ver los movimientos de esa cuenta (debe/haber) con saldo acumulado,
   - Mostrar (si existe) saldo inicial.

Todo esto respetando:
- estructura `presentation/features/accounting/**`,
- capa `core` (actions + api),
- capa `infrastructure` (interfaces + validations).

---

## 2) Estructura de carpetas a crear/usar

### 2.1 Interfaces & Validaciones (infrastructure)

Crear/actualizar bajo:

`src/infrastructure/interfaces/accounting/`:

- `journal-entry.ts`
  - `JournalEntryListItem`
  - `JournalEntryDetail`
  - `JournalEntryLine`

- `requests/create-journal-entry.request.ts`
  - `CreateJournalEntryRequest`

- `requests/update-journal-entry.request.ts`
  - `UpdateJournalEntryRequest`

- `requests/void-journal-entry.request.ts`
  - `VoidJournalEntryRequest`

- `journal-filter.ts`
  - `JournalFilter` (fromDate, toDate, periodId, state, costCenterId, source, search, page, pageSize)

- `ledger-entry.ts`
  - `LedgerEntry`
  - `LedgerResponse` (si el backend envía openingBalance + lista, definir aquí)

> Tip: reusar `PagedResponse<T>` que ya está definido para otros módulos contables.

Crear validaciones en:

`src/infrastructure/validations/accounting/`:

- `journal-entry.schema.ts`
  - Yup schema para `CreateJournalEntryRequest` / `UpdateJournalEntryRequest`
  - Reglas mínimas:
    - `date` requerido
    - `description` requerido, longitud mínima razonable
    - al menos 1 línea
    - cada línea con:
      - `accountId` requerido
      - `debit` y `credit` >= 0
      - no permitir ambos > 0
- `void-journal-entry.schema.ts`
  - Yup schema para `VoidJournalEntryRequest`:
    - `reason` requerido y con longitud mínima
    - `date` opcional

### 2.2 Core API & Actions

En `src/core/api/accounting-api.ts`:

Agregar funciones:

- `getJournalEntries(params: JournalFilter): Promise<PagedResponse<JournalEntryListItem>>`
- `getJournalEntryById(id: string): Promise<JournalEntryDetail>`
- `createJournalEntry(payload: CreateJournalEntryRequest): Promise<JournalEntryDetail>`
- `updateJournalEntry(id: string, payload: UpdateJournalEntryRequest): Promise<JournalEntryDetail>`
- `postJournalEntry(id: string): Promise<JournalEntryDetail>`
- `voidJournalEntry(id: string, payload: VoidJournalEntryRequest): Promise<JournalEntryDetail>`

- `getLedger(params: { accountId: string; fromDate?: string; toDate?: string; costCenterId?: string; includeOpeningBalance?: boolean; }): Promise<LedgerResponse>`

Usar la instancia Axios del proyecto, añadiendo solo las rutas y tipos.

En `src/core/actions/accounting/`:

Crear actions (uno por archivo):

- `list-journal-entries.action.ts`
- `get-journal-entry.action.ts`
- `create-journal-entry.action.ts`
- `update-journal-entry.action.ts`
- `post-journal-entry.action.ts`
- `void-journal-entry.action.ts`
- `get-ledger.action.ts`

Cada action:
- Llama a la función correspondiente de `accounting-api`.
- Devuelve `ApiResult<T>` usando el patrón ya existente en el proyecto.
- Interpreta errores de backend (Problem Details) y mapea a mensajes/errores consistentes.

---

## 3) Feature en presentation: Journal + Ledger

Crear un sub-módulo en:

`src/presentation/features/accounting/journal/`

### 3.1 Components

Bajo `.../journal/components/` crear:

- `journal-table.tsx`
  - Tabla para listar `JournalEntryListItem`
  - Columnas sugeridas:
    - Número (`number`)
    - Fecha (`date`)
    - Descripción
    - Estado (`state` con badge)
    - Tipo (`source` – manual/system)
    - Total Debe (`totalDebit`)
    - Total Haber (`totalCredit`)
    - Acciones:
      - Ver / Detalle
      - Editar (solo si `state = 'draft'`)
      - Postear (solo si `state = 'draft'`)
      - Anular (solo si `state = 'posted'`)
  - Debe recibir props:
    - `items`, `onView`, `onEdit`, `onPost`, `onVoid`

- `journal-filters-bar.tsx`
  - Encima de la tabla, reusar el componente global de filtros/paginación del proyecto si existe
  - Filtros:
    - Rango de fechas (from/to)
    - Período (dropdown si ya existe info, o dejar TODO)
    - Estado (draft/posted/voided)
    - Fuente (manual/system)
    - Texto libre `search` (busca en descripción/número)
  - Puede componerse sobre `ListFiltersBar` global si ya existe.

- `journal-entry-form-modal.tsx`
  - Modal + formulario de asiento:
    - Encabezado:
      - Fecha
      - Cost center (select si está disponible)
      - Descripción
    - Tabla de líneas editable:
      - Cuenta (selector; ver nota de integración con plan de cuentas)
      - Descripción
      - Debe
      - Haber
      - Referencia
    - Mostrar sumatoria Debe/Haber y diferencia
    - Botones:
      - Guardar (create/update draft)
      - Cancelar
  - Usar React Hook Form + Yup schema creado.

- `journal-entry-void-modal.tsx`
  - Modal para anular:
    - Mostrar número, fecha, descripción del asiento
    - Campo `reason` (textarea, requerido)
    - Campo `date` (fecha de anulación, opcional o requerido según regla)
    - Botones: Confirmar / Cancelar

- `journal-entry-state-badge.tsx`
  - Componente pequeño para mostrar el estado:
    - `draft` → gris
    - `posted` → verde
    - `voided` → rojo/amarillo
  - Debe soportar dark mode (usar clases `dark:`).

- (Opcional) `journal-entry-detail-drawer.tsx` o `journal-entry-detail-modal.tsx`
  - Para mostrar detalle de asiento en modo solo lectura.

> Nota: si ya hay componentes globales de modales en `presentation/share/components`, reusarlos.

### 3.2 Hooks

En `.../journal/hooks/`:

- `use-journal-list.ts`
  - Encapsula:
    - estado de `filters` (fromDate, toDate, state, etc.)
    - estado de `page`, `pageSize`
    - llamada a `list-journal-entries.action`
  - Expone:
    - `entries`, `pagination`, `isLoading`, `error`
    - setters `setFilters`, `setPage`, etc.

- `use-journal-entry-form.ts`
  - Encapsula:
    - lógica de crear/editar:
      - modo `create` vs `edit`
      - carga de información cuando hay `entryId`
    - React Hook Form + Yup
    - submit: llama a `create-journal-entry.action` o `update-journal-entry.action`

- `use-post-journal-entry.ts`
  - Encapsula:
    - llamada a `post-journal-entry.action`
    - manejo de loading y error
    - para usar desde el botón de Postear en la tabla/detalle

- `use-void-journal-entry.ts`
  - Encapsula:
    - llamada a `void-journal-entry.action`
    - manejo de loading y error
    - para usar desde `journal-entry-void-modal`

### 3.3 Page

En `.../journal/pages/`:

- `journal-page.tsx`
  - Página principal:
    - Usa `use-journal-list` para cargar datos.
    - Usa `journal-filters-bar` arriba.
    - Usa `journal-table` para mostrar lista.
    - Contiene el estado de:
      - si se está mostrando modal de crear/editar
      - si se está mostrando modal de anulación
      - qué asiento está seleccionado
    - Botón “Nuevo asiento” (abre modal en modo create).
    - Cuando se ejecuta Post/Anular:
      - mostrar toast de éxito/fracaso (reusar sistema de notificaciones global del proyecto).
      - refrescar lista.

---

## 4) Feature Libro Mayor (Ledger)

Crear módulo en:

`src/presentation/features/accounting/ledger/`

### 4.1 Components

- `ledger-filters-bar.tsx`
  - Filtros:
    - Cuenta contable (combo o autocomplete):
      - Reusar el API de plan de cuentas (`/api/accounting/chart`) para buscar cuentas **posteables** (no grupos).
      - Mostrar `code + name` en las opciones.
    - Rango de fechas (from/to).
    - Cost center (si está disponible un catálogo ya en frontend).
  - Botón “Consultar”.

- `ledger-table.tsx`
  - Tabla con columnas:
    - Fecha
    - Número de asiento (`journalNumber`)
    - Descripción
    - Debe
    - Haber
    - Saldo acumulado (`balance`)
  - Fila opcional al inicio con “Saldo inicial” si `includeOpeningBalance` está activo y viene en el response.

### 4.2 Hook

- `use-ledger.ts`
  - Guarda el filtro actual:
    - `accountId` (obligatorio)
    - `fromDate`, `toDate`
    - `costCenterId?`
    - `includeOpeningBalance` (bool)
  - Llama a `get-ledger.action`.
  - Expone:
    - `entries`, `openingBalance?`, `isLoading`, `error`, `setFilters`, `reload`.

### 4.3 Page

En `.../ledger/pages/`:

- `ledger-page.tsx`
  - Usa `ledger-filters-bar` + `ledger-table`.
  - Si no hay `accountId` seleccionado, muestra un mensaje tipo:
    - “Seleccione una cuenta contable para ver el libro mayor.”
  - Cuando hay data:
    - mostrar saldo inicial (si existe),
    - tabla de movimientos.

---

## 5) Integración con menú y rutas

### 5.1 Rutas

En el router principal del proyecto:

- Agregar rutas (protegidas para rol Admin u otro rol contable que ya exista):

  - `/accounting/journal` → `JournalPage`
  - `/accounting/ledger` → `LedgerPage`

Usar los wrappers de rutas protegidas que ya definiste (por ejemplo `RequireAdmin`, `MiddleWare`, etc.), siguiendo el mismo patrón del módulo de Seguridad y el módulo contable existente.

### 5.2 Menú lateral

En la sección “Contabilidad” (donde ya están Plan de cuentas, Centros de costo, Períodos), agregar:

- “Diario” → `/accounting/journal`
- “Libro mayor” → `/accounting/ledger`

---

## 6) Manejo de errores y UX

- Todos los errores de acciones deben usar el sistema centralizado de manejo de errores/mensajes del proyecto:
  - Si el backend devuelve Problem Details (`title`, `detail`, `errors`), mostrarlos de forma amigable.
  - En `post` y `void`:
    - Si hay error 409 (por ejemplo, período cerrado), mostrar mensaje claro:
      - “No se puede contabilizar el asiento porque el período contable está cerrado o bloqueado.”
- En la UI del formulario:
  - Mostrar siempre la suma de Debe/Haber.
  - Mostrar un aviso si el asiento está desbalanceado antes de enviar (aunque la validación final también esté en el backend).

---

## 7) Criterios de aceptación

1. La ruta `/accounting/journal` muestra lista de asientos con paginación y filtros.
2. Se puede crear un asiento en `draft`, editarlo, y luego postearlo.
3. Un asiento `posted` no se puede editar; solo anular.
4. La anulación genera la llamada a `void` y actualiza el estado en pantalla.
5. La ruta `/accounting/ledger` permite seleccionar una cuenta y ver el libro mayor básico (movimientos + saldo acumulado).
6. Toda la lógica de HTTP vive en `core/api` + `core/actions`; los componentes de `presentation` solo orquestan UI.
7. No se ejecutó ningún comando en terminal ni se tocó código backend.

---

## Entregable

Genera y/o modifica los archivos necesarios en:

- `src/infrastructure/interfaces/accounting/**`
- `src/infrastructure/validations/accounting/**`
- `src/core/api/accounting-api.ts`
- `src/core/actions/accounting/**`
- `src/presentation/features/accounting/journal/**`
- `src/presentation/features/accounting/ledger/**`
- archivos de rutas y menú donde se registran las nuevas pantallas

Sin ejecutar comandos ni modificar el backend.
