# Prompt Codex – Frontend: Catálogo de Productos de Préstamo (Loan Products) en PrestaNet

## IMPORTANTE (reglas de trabajo)
- NO ejecutes `npm`, `pnpm`, `yarn`, `vite`, `eslint`.
- NO uses `git`.
- Solo genera o modifica archivos de FRONTEND en este repo.
- Respeta 100% `agents.md`:
  - React + TypeScript
  - Clean Architecture: `presentation` / `core` / `infrastructure` / `router`
  - Cliente HTTP central (Axios) ya existente: REUTILIZAR.
  - Validación con Yup.
  - DTOs uno por archivo.
  - Nombres de archivos en kebab-case.
  - tsconfig `erasableSyntaxOnly`: evitar parameter properties en constructores.

---

## 0) Contexto (backend ya implementado)
Existe un catálogo de productos de préstamo con comisiones, seguros, reglas de garantías y activar/desactivar.

Base API (JWT requerido): `/api/loans/products`

Endpoints:
- GET `/api/loans/products` con query params:
  - `search`, `isActive`, `portfolioType`, `currencyCode`
  - retorna `LoanProductListItemDto[]`
- GET `/api/loans/products/{id}` retorna `LoanProductDetailDto`
- POST `/api/loans/products` body `LoanProductCreateDto` retorna `201` con detalle
- PUT `/api/loans/products/{id}` body `LoanProductUpdateDto` retorna `200` con detalle (reemplaza colecciones completas)
- PATCH `/api/loans/products/{id}/status` body `{ "isActive": true }` retorna `204`

Campos clave en el detalle:
- Identificación: `code`, `name`, `description`, `isActive`
- Producto: `currencyCode`, montos `minAmount/maxAmount`, plazos `minTerm/maxTerm/termUnit`
- Interés y amortización: `interestRateType`, `nominalRate`, `rateBase`, `amortizationMethod`, `paymentFrequency`
- Gracia: `gracePrincipal`, `graceInterest`
- Garantías: `requiresCollateral`, `minCollateralRatio`
- Seguros: `hasInsurance`
- Regulación: `portfolioType`
- GL mapping:
  - `glLoanPortfolioAccountId`
  - `glInterestIncomeAccountId`
  - `glInterestSuspenseAccountId` (opcional)
  - `glFeeIncomeAccountId` (opcional)
  - `glInsurancePayableAccountId` (opcional)
- Colecciones embebidas:
  - `fees: LoanProductFeeDto[]`
  - `insurances: LoanProductInsuranceDto[]`
  - `collateralRules: LoanProductCollateralRuleDto[]`

Errores:
- 400 (validación) ProblemDetails
- 409 (code duplicado)
- 404

---

## 1) Objetivo en el frontend
Crear el módulo UI completo para administrar productos de préstamo:

1) Página Listado:
- tabla con filtros server-side: `search`, `isActive`, `portfolioType`, `currencyCode`
- acciones: ver/editar, activar/desactivar

2) Página Crear/Editar:
- formulario completo con secciones:
  - Datos generales
  - Condiciones (montos, plazos, moneda)
  - Interés y amortización
  - Garantías
  - Seguros
  - Mapeo contable (GL)
  - Colecciones:
    - Comisiones/Cargos (fees)
    - Seguros (insurances)
    - Reglas de garantías (collateralRules)
- En PUT: reemplazar colecciones completas (enviar arrays completos).

3) Integración de rutas y menú bajo el módulo de préstamos:
- Rutas sugeridas:
  - `/loans/products`
  - `/loans/products/new`
  - `/loans/products/:id`

---

## 2) Infraestructura (DTOs + API client)

### 2.1 DTOs TypeScript (UNO por archivo)
Crear en `src/infrastructure/loans/dtos/loan-products/`:

- `loan-product-list-item.dto.ts`
- `loan-product-fee.dto.ts`
- `loan-product-insurance.dto.ts`
- `loan-product-collateral-rule.dto.ts`
- `loan-product-detail.dto.ts`
- `loan-product-create.dto.ts`
- `loan-product-update.dto.ts`
- `loan-product-status-update.dto.ts`
- `loan-product-list-query.dto.ts`

Usa interfaces TS (y tipos para enums si lo deseas). Ejemplo:

```ts
// loan-product-list-query.dto.ts
export interface LoanProductListQueryDto {
  search?: string;
  isActive?: boolean;
  portfolioType?: string;
  currencyCode?: string;
}
```

```ts
// loan-product-list-item.dto.ts
export interface LoanProductListItemDto {
  id: string;
  code: string;
  name: string;
  currencyCode: string;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  termUnit: string;
  portfolioType: string;
  isActive: boolean;
}
```

```ts
// loan-product-fee.dto.ts
export interface LoanProductFeeDto {
  feeType: string;
  chargeBase: string;
  valueType: string;
  value: number;
  chargeTiming: string;
  isActive: boolean;
}
```

