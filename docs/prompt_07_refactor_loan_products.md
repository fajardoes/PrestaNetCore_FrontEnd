# Prompt Codex – Frontend: Catálogos Administrables de Préstamos (3er nivel) + Ajuste de Productos (solo HNL)

## IMPORTANTE (reglas de trabajo)
- NO ejecutes `npm`, `pnpm`, `yarn`, `vite`, `eslint`.
- NO uses `git`.
- Solo genera o modifica archivos de FRONTEND en este repo.
- Respeta al 100% `agents.md`:
  - React + TypeScript
  - Clean Architecture: `presentation` / `core` / `infrastructure` / `router`
  - Cliente HTTP central (Axios) ya existente: REUTILIZAR.
  - Validación con Yup.
  - DTOs uno por archivo.
  - Nombres de archivos en kebab-case.
  - `tsconfig` con `erasableSyntaxOnly`: evitar parameter properties en constructores.

---

## 0) Contexto Backend (ya listo)
- Moneda: SOLO HNL (Lempiras). El producto no debe pedir moneda (o debe ir fija).
- Los demás “tipos” son catálogos administrables vía endpoints:

Base: `/api/loans/catalogs`

Cada catálogo expone (JWT requerido):
- GET `/api/loans/catalogs/<catalog>` con query params opcionales: `isActive`, `search`
- POST `/api/loans/catalogs/<catalog>`
- PUT `/api/loans/catalogs/<catalog>/{id}`
- PATCH `/api/loans/catalogs/<catalog>/{id}/status` body `{ "isActive": true|false }`

Catálogos:
- `term-units`
- `interest-rate-types`
- `rate-bases`
- `amortization-methods`
- `payment-frequencies`
- `portfolio-types`
- `fee-types`
- `fee-charge-bases`
- `fee-value-types`
- `fee-charge-timings`
- `insurance-types`
- `insurance-calculation-bases`
- `insurance-coverage-periods`
- `insurance-charge-timings`
- `collateral-types`

Productos:
- `/api/loans/products`
Ahora recibe IDs de catálogos:
- `termUnitId`, `interestRateTypeId`, `rateBaseId`, `amortizationMethodId`, `paymentFrequencyId`, `portfolioTypeId`
- fees: `feeTypeId`, `chargeBaseId`, `valueTypeId`, `chargeTimingId`
- insurances: `insuranceTypeId`, `calculationBaseId`, `coveragePeriodId`, `chargeTimingId`
- collateral rules: `collateralTypeId`
Moneda: debe quedar fija “HNL”.

No hay productos existentes aún, así que no necesitas migración UI ni compatibilidad con datos antiguos.

---

## 1) Objetivo Frontend
1) Agregar un **sub-módulo de Catálogos** para Préstamos con CRUD básico:
   - Listar
   - Crear
   - Editar
   - Activar/Desactivar
2) Ubicarlo como **tercer nivel de menú**:
   - Menú principal: “Préstamos”
   - Segundo nivel: “Productos”
   - Tercer nivel: “Catálogos”
   - Dentro de “Catálogos”: items para cada catálogo (Term Units, Amortization Methods, etc.)

3) Ajustar el formulario de **Productos** existente para:
   - Quitar “Moneda” (o dejar fijo en HNL).
   - Reemplazar campos libres por **Select** alimentados por catálogos:
     - unidad de plazo, tipo tasa, base tasa, método amortización, frecuencia pago, tipo cartera
     - fees/insurances/collateral rules: selects para tipos/bases/timings/etc.
   - Mejorar selector de cuentas GL:
     - mostrar “código - nombre”
     - no mostrar UUID en input
     - buscador con dropdown + resultados
     - valor mostrado debe ser label, pero guardar el `id`.

---

## 2) Infraestructura (DTOs + API Clients)

### 2.1 DTOs Catálogo (uno por archivo)
Crear en `src/infrastructure/loans/dtos/catalogs/`:

- `loan-catalog-item.dto.ts`
- `loan-catalog-create.dto.ts`
- `loan-catalog-update.dto.ts`
- `loan-catalog-status-update.dto.ts`
- `loan-catalog-list-query.dto.ts`

Ejemplo:

```ts
// loan-catalog-item.dto.ts
export interface LoanCatalogItemDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
}

// loan-catalog-create.dto.ts
export interface LoanCatalogCreateDto {
  code: string;
  name: string;
  description?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

// loan-catalog-update.dto.ts
export interface LoanCatalogUpdateDto {
  code: string;
  name: string;
  description?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

// loan-catalog-status-update.dto.ts
export interface LoanCatalogStatusUpdateDto {
  isActive: boolean;
}

// loan-catalog-list-query.dto.ts
export interface LoanCatalogListQueryDto {
  search?: string;
  isActive?: boolean;
}
```

2.2 API client genérico para catálogos

Crear en src/infrastructure/loans/api/loan-catalogs-api.ts usando Axios central existente.

Debe exponer funciones genéricas:

```ts
export type LoanCatalogKey =
  | 'term-units'
  | 'interest-rate-types'
  | 'rate-bases'
  | 'amortization-methods'
  | 'payment-frequencies'
  | 'portfolio-types'
  | 'fee-types'
  | 'fee-charge-bases'
  | 'fee-value-types'
  | 'fee-charge-timings'
  | 'insurance-types'
  | 'insurance-calculation-bases'
  | 'insurance-coverage-periods'
  | 'insurance-charge-timings'
  | 'collateral-types';

export async function getLoanCatalogItems(catalog: LoanCatalogKey, query: LoanCatalogListQueryDto): Promise<LoanCatalogItemDto[]>;

export async function createLoanCatalogItem(catalog: LoanCatalogKey, dto: LoanCatalogCreateDto): Promise<LoanCatalogItemDto>;

export async function updateLoanCatalogItem(catalog: LoanCatalogKey, id: string, dto: LoanCatalogUpdateDto): Promise<LoanCatalogItemDto>;

export async function updateLoanCatalogItemStatus(catalog: LoanCatalogKey, id: string, dto: LoanCatalogStatusUpdateDto): Promise<void>;

```

Asegurar:

Serialización de query params correcta.

Propagar errores para que UI muestre toasts.

3) Core (hooks / state)

En src/core/loans/catalogs/ crear:

catalog-definitions.ts

use-loan-catalog.ts

use-loan-catalogs-cache.ts

3.1 catalog-definitions.ts

Definir metadata del catálogo para UI:
```ts
export interface LoanCatalogDefinition {
  key: LoanCatalogKey;
  title: string;
  description?: string;
}

export const LOAN_CATALOG_DEFINITIONS: LoanCatalogDefinition[] = [
  { key: 'term-units', title: 'Unidades de plazo' },
  { key: 'interest-rate-types', title: 'Tipos de tasa' },
  ...
];
```
3.2 Hook CRUD por catálogo

use-loan-catalog.ts:

Params: catalogKey

State:

items, isLoading, error

saving flags

Methods:

load(query)

create(dto)

update(id, dto)

toggleStatus(id, isActive)

3.3 Cache para selects de productos

use-loan-catalogs-cache.ts:

Carga y cachea catálogos “más usados” para el formulario de productos.

Exponer:

termUnits, interestRateTypes, rateBases, etc.

refresh() o loadAll().

Regla:

Para selects, traer por defecto solo isActive=true y ordenar por sortOrder, name.

4) Presentation: Catálogos (UI CRUD)

Crear en src/presentation/features/loans/catalogs/:

pages/loan-catalogs-home-page.tsx

pages/loan-catalog-page.tsx

components/loan-catalogs-grid.tsx

components/loan-catalog-table.tsx

components/loan-catalog-form-dialog.tsx

components/loan-catalog-filters.tsx

components/loan-catalog.schema.ts (Yup)

4.1 Home (listado de catálogos)

loan-catalogs-home-page.tsx:

Mostrar cards o lista con todos los catálogos (LOAN_CATALOG_DEFINITIONS)

Cada card navega a /loans/products/catalogs/:catalogKey

4.2 Página por catálogo

loan-catalog-page.tsx:

Leer catalogKey de la ruta.

Mostrar:

título del catálogo + descripción

filtros: search, isActive (Todos/Activos/Inactivos)

tabla: code, name, sortOrder, status

botones:

“Nuevo”

editar por fila

activar/desactivar por fila con confirm modal

4.3 Form modal

loan-catalog-form-dialog.tsx:

Reutilizable para crear/editar

Campos:

code (requerido, uppercase, trim)

name (requerido)

description (opcional)

sortOrder (número, default 0)

isActive (checkbox)

Validación Yup:

code requerido, max length 50

name requerido, max length 150

sortOrder >= 0

5) Router + Menú (tercer nivel)
5.1 Rutas

Agregar rutas:

/loans/products (ya existe)

/loans/products/new

/loans/products/:id

/loans/products/catalogs → LoanCatalogsHomePage

/loans/products/catalogs/:catalogKey → LoanCatalogPage

5.2 Menú (3 niveles)

Modificar el menú lateral (según estructura actual) para quedar:

Préstamos

Productos

Productos (listado) → /loans/products

Catálogos → /loans/products/catalogs

Nota: si el sistema de menú actual no soporta 3er nivel, implementa la alternativa:

“Productos” como item que abre submenú con:

“Gestión de Productos”

“Catálogos”
y dentro de “Catálogos” se navega al home con cards. (Esto mantiene navegación “tercer nivel” aunque el sidebar solo soporte 2 niveles.)

6) Ajustes al Formulario de Productos (muy importante)

En el módulo existente de productos, cambiar:

6.1 Moneda

Eliminar input de moneda del formulario.

Mostrar un texto fijo “Moneda: HNL” o un select deshabilitado con “HNL”.

En create/update DTO:

No enviar currencyCode si el backend lo fuerza, o enviar siempre "HNL".

6.2 Reemplazar inputs libres por selects de catálogos

Usar use-loan-catalogs-cache.ts para cargar listas activas:

Condiciones:

Unidad de plazo: select termUnitId usando catálogo term-units

Plazo min/max: mantener números, pero mostrar helper “Unidad: {termUnit.name}”

Interés y amortización:

Tipo tasa: select interestRateTypeId (interest-rate-types)

Base tasa: select rateBaseId (rate-bases)

Método amortización: select amortizationMethodId (amortization-methods)

Frecuencia pago: select paymentFrequencyId (payment-frequencies)

Tipo cartera: select portfolioTypeId (portfolio-types)

Fees editor:

feeTypeId (fee-types)

chargeBaseId (fee-charge-bases)

valueTypeId (fee-value-types)

chargeTimingId (fee-charge-timings)

Insurances editor:

insuranceTypeId (insurance-types)

calculationBaseId (insurance-calculation-bases)

coveragePeriodId (insurance-coverage-periods)

chargeTimingId (insurance-charge-timings)

Collateral rules:

collateralTypeId (collateral-types)

ratios min/ max (si el backend usa ambos; si solo usa min, respeta el DTO real)

maxItems (si aplica)

6.3 Labels y ayudas

Agregar descripciones claras en UI:

“Plazo mínimo (en {unidad})”

“Tasa nominal (% anual)”

“Gracia a capital (número de cuotas)”

“Gracia a interés (número de cuotas)”

“Ratio mínimo de garantía (ej. 1.20 = 120%)”

6.4 Selector GL (mejora UX)

Crear/reemplazar componente gl-accounts-selector.tsx:

Debe mostrar un input de búsqueda y un dropdown con resultados.

Cada resultado: code - name

Al seleccionar:

guardar el accountId

mostrar el label seleccionado, NO el uuid

Mostrar “top cuentas” al abrir (primeras N o recientes) si el endpoint contable lo permite.

Usar el endpoint contable existente para buscar cuentas (chart accounts). No crear endpoints nuevos.

7) Manejo de errores y UX

Mostrar toasts / alertas usando el sistema existente.

Catálogos:

si code duplicado (409) mostrar “El código ya existe”.

En producto:

si falta un catálogo (null/empty), marcar como requerido en Yup.

8) Criterios de aceptación

Existe un módulo UI de catálogos de préstamos accesible por:

Préstamos → Productos → Catálogos (tercer nivel)

Se puede:

listar, buscar, filtrar por estado,

crear, editar,

activar/desactivar
en cualquier catálogo.

El formulario de productos:

ya NO usa inputs libres para estos campos,

usa selects alimentados por catálogos,

moneda fija HNL,

mejora selector GL (no muestra uuid).

Se respeta la arquitectura presentation/core/infrastructure/router y las convenciones.

No se instalan librerías ni se ejecutan comandos.

