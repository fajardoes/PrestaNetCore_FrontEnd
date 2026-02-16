# Prompt Codex — Frontend PrestaNet
## Módulo: Créditos → Solicitudes de Crédito + Loans (consulta)
**Stack:** React 18 + TS + Vite + Tailwind + React Router 6 + Axios (`httpClient`) + React Hook Form + Yup.  
**Arquitectura obligatoria:** Clean Architecture (core / infrastructure / presentation) según `AGENTS.md` del frontend. fileciteturn0file0

> **Objetivo:** Implementar en el frontend el módulo completo para **Solicitudes de Crédito** (workflow + garantías + preview de cronograma) y la **consulta mínima de Loans** (detalle + cuotas), consumiendo los endpoints existentes del backend.  
> **Reglas:** NO ejecutar `npm/pnpm/yarn/vite/eslint`, NO usar `git`, SOLO crear/modificar archivos del **frontend**. fileciteturn0file0

---

## 1) Menú, navegación y ubicación (sugerencia consistente)
Ubicar dentro del árbol de **Créditos** (si ya existe), y separar “Solicitudes” de “Préstamos”.

### 1.1. Entradas de menú (sugeridas)
- **Créditos**
  - **Solicitudes de Crédito**  
    - route: `/loans/applications`  
    - icon (lucide): `FileText`
  - **Préstamos (consulta)**  
    - route: `/loans`  
    - icon (lucide): `Wallet`

> Si tu sistema usa menú dinámico, agregar estas rutas donde corresponda (frontend routing + backend menus si aplica). Este prompt **solo** cubre frontend.

---

## 2) Alcance funcional exacto (no dejar nada fuera)
### 2.1 Solicitudes de crédito (loan_applications)
Debe incluir:
1. **Listado con filtros + paginación**  
   - filtros: `search`, `clientId`, `loanProductId`, `promoterId`, `statusId`, `createdFrom`, `createdTo`
   - paginación: `skip/take` (take 1..200), navegación por páginas
2. **Crear solicitud (DRAFT)** con validación Yup:
   - `clientId` (required)
   - `loanProductId` (required)
   - `promoterId` (required)
   - `requestedPrincipal` > 0
   - `requestedTerm` > 0
   - `requestedPaymentFrequencyId` (required)
   - `suggestedPaymentFrequencyId` (optional)
   - `requestedRateOverride` (optional)
   - `notes` (optional, max 500)
3. **Editar solicitud** solo si `status == DRAFT`
4. **Detalle** con secciones:
   - cabecera (no. solicitud si existe / id / estado / fechas / cliente / producto / promotor)
   - datos solicitados
   - **Garantías**: agregar/listar/eliminar links
   - **Preview de cronograma** (sin persistencia): usar request overrides
   - **Acciones de workflow** según estado:
     - `DRAFT`: Submit, Cancel, Preview, Edit, Add/Remove collateral
     - `SUBMITTED`: Approve, Reject, Cancel, Preview (sin editar campos)
     - `APPROVED`: solo lectura; mostrar `approvedLoanId` y link a préstamo
     - `REJECTED/CANCELLED`: solo lectura
5. **Reglas UX mínimas**
   - botones deshabilitados cuando la acción no aplica por estado
   - confirmación modal para acciones sensibles: Approve/Reject/Cancel/Delete collateral (usar `confirm-modal`)
   - feedback unificado (toast/modal) al éxito/error

### 2.2 Loans (consulta mínima)
Debe incluir:
1. Listado de préstamos (si NO existe endpoint de listado, hacer navegación desde solicitud aprobada al detalle usando `approvedLoanId`).
2. **Detalle de préstamo**: `GET /api/loans/{id}`
3. **Cuotas**
   - listado: `GET /api/loans/{id}/installments`
   - detalle de cuota: `GET /api/loans/{id}/installments/{installmentNo}`

---

## 3) Contratos (Types/DTOs) y estructura de carpetas
Respetar: **DTOs 1 por archivo** dentro de `src/infrastructure/...` y **kebab-case** en nombres. fileciteturn0file0

### 3.1. Infra DTOs sugeridos
Crear:
```
src/infrastructure/loans/requests/
  loan-application-create-request.ts
  loan-application-update-request.ts
  loan-application-search-request.ts
  loan-application-submit-request.ts
  loan-application-approve-request.ts
  loan-application-reject-request.ts
  loan-application-cancel-request.ts
  loan-application-collateral-add-request.ts
  loan-schedule-preview-request.ts
src/infrastructure/loans/responses/
  loan-application-response.ts
  loan-application-search-response.ts
  loan-application-collateral-response.ts
  loan-schedule-preview-response.ts
  loan-response.ts
  loan-installment-response.ts
  loan-installment-detail-response.ts
```
> Ajusta nombres/campos al shape real devuelto por backend (puedes revisarlo en un directorio superior en PrestaNetCore-BackEnd, en este directorio solo puedes leer para tener contexto del backend).

### 3.2. Interfaces compartidas
Si hay catálogos reutilizables (clientes, productos, promotores, frecuencias, estados), usar interfaces existentes en:
- `src/infrastructure/interfaces/`
o crear nuevas interfaces por dominio sin romper convenciones.

---

## 4) API Layer (core/api) — endpoints exactos
Crear archivo(s) API:
```
src/core/api/loans/loan-applications-api.ts
src/core/api/loans/loans-api.ts
```
**Usar** el Axios client ya existente (`infrastructure/api/httpClient`). fileciteturn0file0

### 4.1. Loan Applications API
Implementar funciones:
- `createLoanApplication(dto)` → `POST /api/loan-applications`
- `updateLoanApplication(id, dto)` → `PUT /api/loan-applications/{id}`
- `getLoanApplication(id)` → `GET /api/loan-applications/{id}`
- `searchLoanApplications(params)` → `GET /api/loan-applications` (querystring)
- `addCollateral(applicationId, dto)` → `POST /api/loan-applications/{id}/collaterals`
- `listCollaterals(applicationId)` → `GET /api/loan-applications/{id}/collaterals`
- `removeCollateral(applicationId, linkId)` → `DELETE /api/loan-applications/{id}/collaterals/{linkId}`
- `submitApplication(id, dto)` → `POST /api/loan-applications/{id}/submit`
- `approveApplication(id, dto)` → `POST /api/loan-applications/{id}/approve`
- `rejectApplication(id, dto)` → `POST /api/loan-applications/{id}/reject`
- `cancelApplication(id, dto)` → `POST /api/loan-applications/{id}/cancel`
- `previewSchedule(id, dto)` → `POST /api/loan-applications/{id}/schedule/preview`

### 4.2. Loans API (consulta)
- `getLoan(id)` → `GET /api/loans/{id}`
- `listLoanInstallments(loanId)` → `GET /api/loans/{id}/installments`
- `getLoanInstallment(loanId, installmentNo)` → `GET /api/loans/{id}/installments/{installmentNo}`

> Mantener cada función pequeña, tipada y con retorno claro.

---

## 5) Actions (core/actions) — un caso de uso por clase
Crear carpetas:
```
src/core/actions/loan-applications/
src/core/actions/loans/
```
Acciones sugeridas (1 clase por acción):
- `create-loan-application.action.ts`
- `update-loan-application.action.ts`
- `get-loan-application.action.ts`
- `search-loan-applications.action.ts`
- `add-loan-application-collateral.action.ts`
- `list-loan-application-collaterals.action.ts`
- `remove-loan-application-collateral.action.ts`
- `submit-loan-application.action.ts`
- `approve-loan-application.action.ts`
- `reject-loan-application.action.ts`
- `cancel-loan-application.action.ts`
- `preview-loan-application-schedule.action.ts`

Loans:
- `get-loan.action.ts`
- `list-loan-installments.action.ts`
- `get-loan-installment.action.ts`

**Regla TS:** evitar *parameter properties* en constructores (erasableSyntaxOnly). Declarar fields explícitos y asignar en constructor.

---

## 6) Validations (Yup)
Crear esquemas:
```
src/infrastructure/validations/loans/
  loan-application.schema.ts
  loan-application-collateral.schema.ts
  loan-application-workflow.schema.ts
  loan-schedule-preview.schema.ts
```
Requisitos:
- Create/Update: mismas reglas del backend (required + rangos + max length).
- Approve/Submit: `notes` opcional (max si existe).
- Reject/Cancel: `reason` opcional, max 500.
- Collateral add: `collateralId` required; `coverageValue` opcional > 0; `notes` max 250.
- Preview: overrides opcionales (si se envían, validar rangos básicos).

Exportar tipos con `InferType` donde aplique.

---

## 7) Hooks (presentation/features/.../hooks)
Crear feature slice:
```
src/presentation/features/loans/applications/
  hooks/
  components/
  pages/
src/presentation/features/loans/loans-query/
  hooks/
  components/
  pages/
```

Hooks sugeridos:
### 7.1. Solicitudes
- `use-loan-applications-list.ts`  
  - state: filtros + page (skip/take), `data`, `isLoading`, `error`
  - usa `SearchLoanApplicationsAction`
- `use-loan-application.ts`
  - carga detalle + collaterals
- `use-loan-application-mutations.ts`
  - create/update/submit/approve/reject/cancel + add/remove collateral + preview schedule
  - expone `mutateX` con estados independientes o un estado combinado claro

### 7.2. Loans consulta
- `use-loan.ts`
- `use-loan-installments.ts`
- `use-loan-installment.ts`

Hooks deben **llamar acciones**, no APIs directos. fileciteturn0file0

---

## 8) UI / Pages / Components
Usar componentes compartidos obligatorios donde corresponda. fileciteturn0file0

### 8.1. Rutas
Agregar rutas (React Router):
- `/loans/applications` → `LoanApplicationsListPage`
- `/loans/applications/new` → `LoanApplicationCreatePage`
- `/loans/applications/:id` → `LoanApplicationDetailPage`
- `/loans/applications/:id/edit` → `LoanApplicationEditPage`
- `/loans/:id` → `LoanDetailPage`
- `/loans/:id/installments/:installmentNo` → `LoanInstallmentDetailPage`

### 8.2. Listado de Solicitudes
**Página:** `LoanApplicationsListPage`
- Usar `ListFiltersBar` (search + status + children para filtros extra)  
- Tabla con `TableContainer mode="legacy-compact"`  
- Paginación con `TablePagination`  
- Acciones por fila con `.btn-table-action`:
  - Ver detalle (`Eye`)
  - Editar (solo DRAFT) (`Pencil`)
- Botón “Crear solicitud” (`Plus`)

**Columnas sugeridas**
- Código/No (si existe), Cliente, Producto, Promotor, Principal, Plazo, Estado, Fecha creación, Acciones

### 8.3. Crear/Editar Solicitud (Form)
**Component:** `LoanApplicationForm`
- React Hook Form + resolver Yup
- Usar `AsyncSelect` para:
  - Cliente
  - Producto
  - Promotor
  - Frecuencia de pago (si catálogo remoto)
- Campos numéricos: principal, term, rate override (opcional)
- Textarea notes (max 500)
- Validación inline + submit

**Pages**
- `LoanApplicationCreatePage`: create + redirect a detalle al éxito
- `LoanApplicationEditPage`: precargar datos; bloquear edición si no DRAFT (si URL directa, mostrar read-only y aviso)

### 8.4. Detalle Solicitud
**Page:** `LoanApplicationDetailPage` (orquesta)
Secciones (componentes presentacionales):
- `LoanApplicationHeaderCard`
  - estado con badge (color por status)
  - botones de acciones workflow según estado
- `LoanApplicationRequestedDataCard`
- `LoanApplicationCollateralsCard`
  - lista (tabla o cards) + botón agregar
  - botón eliminar link (confirm modal)
- `LoanApplicationSchedulePreviewCard`
  - formulario mínimo de overrides (principal/term/frecuencia/tasa/firstDueDate)  
  - botón “Previsualizar” → llama preview y muestra tabla de cuotas
  - mostrar `metadata` (nominalRate, effectivePeriodRate, methods, lastInstallmentAdjustment)

**Workflow actions**
- `submit`: modal con notes opcional
- `approve`: confirm modal (y notes opcional)
- `reject`: modal con reason opcional
- `cancel`: modal con reason opcional
- Al aprobar: si response trae `approvedLoanId`, mostrar botón “Ir al préstamo”

### 8.5. Garantías (collaterals)
**Modal:** `LoanApplicationAddCollateralModal`
- `AsyncSelect` para buscar/seleccionar garantía (si existe endpoint de catálogos/garantías; puedes revisarlo en un directorio superior en PrestaNetCore-BackEnd, en este directorio solo puedes leer para tener contexto del backend)
- `coverageValue` y `notes` opcionales
- submit → `addCollateral`

### 8.6. Loans — Consulta mínima
**LoanDetailPage**
- Cargar `loan` + `installments` (en paralelo)
- Mostrar datos del préstamo + tabla de cuotas
- Acciones por cuota:
  - Ver detalle (link a `/loans/:id/installments/:installmentNo`)

**LoanInstallmentDetailPage**
- Mostrar principal/interés/total + componentes si aplica
- Mostrar fechas (original/adjusted) si vienen en backend para cuota (puedes revisarlo en un directorio superior en PrestaNetCore-BackEnd, en este directorio solo puedes leer para tener contexto del backend)

---

## 9) Manejo de errores, loading y estados
- Mostrar loading consistente (skeleton/spinner ya existente en el proyecto).
- Si backend devuelve 409 (conflicto) en approve, mostrar mensaje claro: “La solicitud ya fue aprobada o existe un préstamo asociado.”
- Para validaciones (400/422), mapear a UI si tienes helper; si no, mostrar detalle principal (problem details) y mantener logs en consola solo en dev.

---

## 10) Checklist de archivos esperados (entregable)
**Infra**
- requests/responses DTOs (1 por archivo)
- schemas Yup

**Core**
- api (2 archivos)
- actions (clases por caso de uso)

**Presentation**
- routes
- features:
  - loans/applications (hooks/components/pages)
  - loans/loans-query (hooks/components/pages)

**Reutilización obligatoria**
- `ListFiltersBar`, `TableContainer`, `TablePagination`, `AsyncSelect`, `DatePicker`, `ConfirmModal` donde aplique. fileciteturn0file0

---

## 11) Notas de integración (importante)
- No inventar endpoints nuevos: usar exactamente los descritos.
- Si para selects asíncronos faltan endpoints (clientes/productos/promotores/frecuencias/status), **usar los que ya existan en tu frontend** (por ejemplo los del módulo de productos o catálogos) y solo adaptar labels/values.
- Mantener soporte dark mode en todos los componentes (`dark:`). fileciteturn0file0

---

## 12) Referencia del backend (para contexto)
Este frontend consume el módulo backend ya implementado y debe respetar estados y reglas (DRAFT/SUBMITTED/APPROVED/REJECTED/CANCELLED, approve transaccional, preview sin persistencia, etc.). fileciteturn0file1
