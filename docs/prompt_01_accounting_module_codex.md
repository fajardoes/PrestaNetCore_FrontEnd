# Prompt Codex – Frontend Módulo Contable (Plan de Cuentas + Centros de Costo + Períodos/Cierre)

**IMPORTANTE (reglas de trabajo):**
- **NO** ejecutes `npm`, **NO** ejecutes `vite`, **NO** corras `lint`, **NO** uses `git`.
- Solo genera/edita código y archivos.
- Respeta estrictamente la arquitectura y convenciones del proyecto descritas en `agents.md`. fileciteturn2file1

---

## 0) Contexto del backend (ya implementado)

El backend expone el núcleo contable con JWT requerido y paginación estándar `PagedResponseDto<T>` con `items`, `totalCount`, `pageNumber`, `pageSize`. Endpoints: fileciteturn2file0

### Chart of Accounts (Plan de cuentas)
- `GET /api/accounting/chart?page={int}&pageSize={int}&search={text}&parentId={guid?}&isActive={bool?}`
- `GET /api/accounting/chart/{id}`
- `POST /api/accounting/chart` → `CreateChartAccountRequestDto`
- `PUT /api/accounting/chart/{id}` → `UpdateChartAccountRequestDto`

### Cost Centers (Centros de costo)
- `GET /api/accounting/cost_centers?page={int}&pageSize={int}&search={text}&isActive={bool?}`
- `POST /api/accounting/cost_centers` → `CreateCostCenterRequestDto`
- `POST /api/accounting/cost_centers/sync_with_agencies`

### Periods (Períodos y cierre mensual)
- `GET /api/accounting/periods?page={int}&pageSize={int}&year={int?}&state={open|closed|locked}`
- `POST /api/accounting/periods/open` → `OpenPeriodRequestDto`
- `POST /api/accounting/periods/{periodId}/close` → `ClosePeriodRequestDto`

Validaciones mínimas sugeridas por backend: fileciteturn2file0
- `slug` solo minúsculas/números/guiones
- `normalBalance` en `{debit, credit}`
- `month` entre `1..12`

---

## 1) Contexto del frontend y reglas obligatorias

El frontend usa Clean Architecture: `core` (acciones + api), `infrastructure` (interfaces + validaciones + http), `presentation` (features hooks/components/pages), `routes`, `providers`. fileciteturn2file1

Reglas clave: fileciteturn2file1
1. **Pages solo orquestan** (estado UI, modales, pasan props). No HTTP directo.
2. **Components = UI pura** (props/callbacks).
3. **Hooks** (por feature) llaman **actions** y exponen `{ mutate, isLoading, error }`.
4. **Actions** devuelven `ApiResult<T>` y unifican manejo de errores.
5. **API layer** usa Axios desde `infrastructure/api/httpClient` (instancia del proyecto).
6. Formularios: **React Hook Form + Yup** (preferir Yup para este feature).
7. Dark mode obligatorio (Tailwind `dark:`).
8. TypeScript estricto y configuración `erasableSyntaxOnly`: **NO usar parameter properties** en constructores (no `constructor(private x: ...)`). Usa fields + asignación explícita.

Componentes compartidos para listados:
- `src/presentation/share/components/list-filters-bar.tsx`
- `src/presentation/share/components/table-pagination.tsx` fileciteturn2file1

---

## 2) Objetivo del módulo contable en frontend

Implementar un **módulo “Contabilidad”** con 3 sub-módulos:

1) **Plan de cuentas** (listado paginado, búsqueda, filtro por activo, filtro por parent, crear/editar)  
2) **Centros de costo** (listado paginado, filtro activo, crear/editar opcional, botón **sync_with_agencies**)  
3) **Períodos contables** (listado paginado con filtro por año/estado, abrir período, cerrar período con notes)

Todo debe quedar listo para que después se implementen **asientos contables** sin re-trabajo.

### Acceso / permisos
- Por defecto, proteger el módulo con rol `Admin` (igual que Seguridad).
- Implementa el guard de rutas usando el patrón del proyecto (ej. `RequireAdmin` / verificación en `UserContext`).

---

## 3) Estructura exacta a crear/usar

Crea un feature slice:

```
src/presentation/features/accounting/
  components/
    chart-accounts-table.tsx
    chart-account-form-modal.tsx
    cost-centers-table.tsx
    cost-center-form-modal.tsx
    periods-table.tsx
    open-period-modal.tsx
    close-period-modal.tsx
    accounting-status-badge.tsx
  hooks/
    use-chart-accounts.ts
    use-chart-account-form.ts
    use-cost-centers.ts
    use-cost-center-form.ts
    use-periods.ts
    use-open-period.ts
    use-close-period.ts
    use-sync-cost-centers.ts
  pages/
    chart-accounts-page.tsx
    cost-centers-page.tsx
    periods-page.tsx
```

Y en capas inferiores:

```
src/infrastructure/interfaces/accounting/
  paged-response.ts
  chart-account.ts
  cost-center.ts
  accounting-period.ts
  requests/
    create-chart-account.request.ts
    update-chart-account.request.ts
    create-cost-center.request.ts
    open-period.request.ts
    close-period.request.ts

src/infrastructure/validations/accounting/
  chart-account.schema.ts
  cost-center.schema.ts
  open-period.schema.ts
  close-period.schema.ts

src/core/api/accounting-api.ts
src/core/actions/accounting/
  list-chart-accounts.action.ts
  get-chart-account.action.ts
  create-chart-account.action.ts
  update-chart-account.action.ts
  list-cost-centers.action.ts
  create-cost-center.action.ts
  sync-cost-centers.action.ts
  list-periods.action.ts
  open-period.action.ts
  close-period.action.ts
```

**Nombres de archivos en kebab-case** siempre.

---

## 4) Contratos (interfaces) y tipos

### 4.1 Paginación
Crear `PagedResponse<T>` compatible con backend:
```ts
export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}
```

### 4.2 ChartAccount
Basado en los DTOs del backend: fileciteturn2file0
- `ChartAccountListItem`
- `ChartAccountDetail`
- Requests:
  - `CreateChartAccountRequest`
  - `UpdateChartAccountRequest`

Campos mínimos:
- `id`
- `code`
- `name`
- `slug`
- `level?`
- `parentId?`
- `isGroup`
- `normalBalance: 'debit' | 'credit'`
- `isActive`

### 4.3 CostCenter
- `id`, `code`, `name`, `slug`, `agencyId`, `isActive`

### 4.4 AccountingPeriod
- `id`, `fiscalYear`, `month`, `state: 'open'|'closed'|'locked'`, `openedAt?`, `closedAt?`, `notes?`

---

## 5) API layer (core/api/accounting-api.ts)

Implementar wrappers HTTP usando el cliente Axios del proyecto (`infrastructure/api/httpClient` o la instancia que ya usan las features existentes).  
Requisitos:
- Todas las funciones deben retornar data ya tipada.
- Manejo de query params consistente y seguro.

Funciones mínimas:

```ts
getChartAccounts(params)
getChartAccountById(id)
createChartAccount(payload)
updateChartAccount(id, payload)

getCostCenters(params)
createCostCenter(payload)
syncCostCentersWithAgencies()

getPeriods(params)
openPeriod(payload)
closePeriod(periodId, payload)
```

---

## 6) Actions (core/actions/accounting/*)

Cada action:
- llama a `core/api/accounting-api`
- captura errores y devuelve `ApiResult<T>` usando el patrón existente del proyecto
- interpreta Problem Details en errores (400/404/409) para mensajes amigables

---

## 7) Hooks (presentation/features/accounting/hooks)

### 7.1 Hooks de listados
- `use-chart-accounts`:
  - estados: `search`, `statusFilter (active|inactive|all)`, `page`, `pageSize`, `parentId?`
  - llama action `list-chart-accounts.action`
  - calcula `totalPages = ceil(totalCount/pageSize)`
- `use-cost-centers`:
  - búsqueda + status + paginación
- `use-periods`:
  - filtros: `year?`, `state?`, paginación

### 7.2 Hooks de formularios
- `use-chart-account-form`:
  - RHF + Yup, submit → create/update según modo
  - normaliza `slug` (lowercase + kebab-case) o valida estrictamente
- `use-cost-center-form`
- `use-open-period`
- `use-close-period`
- `use-sync-cost-centers`:
  - expone `sync()` y estados `isLoading/error`

---

## 8) UI (components + pages)

### 8.1 Reutilizar componentes compartidos
En cada página de listado usa:
- `ListFiltersBar` (`presentation/share/components/list-filters-bar.tsx`) fileciteturn2file1
- `TablePagination` (`presentation/share/components/table-pagination.tsx`) fileciteturn2file1

### 8.2 Páginas
- `chart-accounts-page.tsx`:
  - tabla con columnas: Código, Nombre, Tipo (Grupo/Posteable), Naturaleza (Debe/Haber), Activo, Acciones
  - botón “Crear cuenta”
  - acción “Editar”
  - filtros: search + activo/inactivo/todos + parentId (opcional select)
- `cost-centers-page.tsx`:
  - tabla: Código, Nombre, AgenciaId (o etiqueta si ya hay helper para nombre), Activo, Acciones
  - botón “Sync con agencias” (endpoint sync_with_agencies)
  - (opcional) modal “Crear/Editar centro”
- `periods-page.tsx`:
  - tabla: Año, Mes, Estado, Abierto/Cerrado, Acciones
  - acciones:
    - “Abrir período” → modal con fiscalYear/month/notes
    - “Cerrar período” (solo si state=open) → modal notes

### 8.3 Badges
Crear `accounting-status-badge.tsx`:
- Para period state: `open`, `closed`, `locked`
- Para isActive: activo/inactivo
- Debe tener estilos dark mode.

### 8.4 Modales y feedback
Usa los componentes compartidos del proyecto para modales/toasts si ya existen.
Mostrar errores de backend (Problem Details) y éxitos.

---

## 9) Validaciones (Yup)

Crear schemas:

- `chart-account.schema.ts`:
  - `code` requerido, max len razonable, patrón permitido (permitir puntos).
  - `name` requerido
  - `slug` requerido, regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
  - `normalBalance` oneOf(['debit','credit'])
  - `level` opcional int >= 1
- `cost-center.schema.ts`:
  - `code`, `name`, `slug`, `agencyId` requerido (Guid)
- `open-period.schema.ts`:
  - `fiscalYear` requerido (>= 2000)
  - `month` 1..12
- `close-period.schema.ts`:
  - `notes` opcional (max len)

---

## 10) Rutas y menú

Agregar rutas siguiendo el patrón del proyecto:

- `/accounting/chart`
- `/accounting/cost-centers`
- `/accounting/periods`

Proteger con `RequireAdmin` o guard equivalente.

En el menú lateral:
- Agregar sección “Contabilidad”
  - “Plan de cuentas”
  - “Centros de costo”
  - “Períodos”

Solo visible para Admin.

---

## 11) Criterios de aceptación

1. Las 3 pantallas existen y funcionan con **paginación real del backend**.
2. Plan de cuentas: crear/editar (POST/PUT) y refresca listado al éxito.
3. Centros de costo: listado paginado y botón **Sync con agencias**.
4. Períodos: listar/filtrar; abrir; cerrar; validación UI para no cerrar si no está `open`.
5. Errores 400/404/409 se muestran de forma clara.
6. Código respeta Clean Architecture y usa los componentes compartidos de filtros/paginación. fileciteturn2file1
7. No se ejecutaron comandos.

---

## Entregable a generar

Genera todos los archivos y cambios necesarios en las rutas/carpetas indicadas, con imports correctos y tipado estricto TypeScript.
