# Prompt (Codex) — Frontend Módulo de Garantías (Collaterals) | PrestaNetCore-Frontend

> **Objetivo:** Implementar en el **frontend React + TypeScript** el módulo formal de **Garantías reutilizables por cliente**, sus **catálogos (Tipos/Estados)** y **Documentos adjuntos**, consumiendo el backend ya disponible.  
> **Fuente backend:** ver resumen de endpoints/DTOs/reglas en el overview.  

---

## 0) Reglas del proyecto (OBLIGATORIAS)

1. Respetar la arquitectura **presentation / core / infrastructure / router** (Clean-ish).
2. Usar **Yup** para validación (NO Zod).
3. Consumir API con el **Axios instance existente** `prestanetApi` (JWT + refresh interceptors).
4. DTOs **uno por archivo** en `src/infrastructure/intranet/{requests,responses}` (kebab-case).
5. `tsconfig` con `erasableSyntaxOnly`: **NO usar parameter properties** en constructors (evitar `constructor(private x: X) {}`); usar propiedades explícitas y asignación.
6. Mantener naming: archivos **kebab-case**, exports claros, una responsabilidad por archivo.
7. No instalar librerías nuevas. Reutilizar componentes/layouts existentes (TopBar/SideBar/MiddleWare, etc.).
8. Manejo de errores desde backend con **Problem Details**: 404/409/422/400. Mostrar mensajes claros en UI.

---

## 1) Endpoints a consumir (backend)

### Garantías
- `POST /api/collaterals`
- `PUT /api/collaterals/{id}`
- `GET /api/collaterals/{id}`
- `GET /api/collaterals` (query: `ownerClientId`, `typeId`, `statusId`, `active`, `search`, `skip`, `take`) → `PagedResult<CollateralResponse>`

### Catálogos
- Tipos:
  - `GET /api/collaterals/catalogs/types`
  - `GET /api/collaterals/catalogs/types/{id}`
  - `POST /api/collaterals/catalogs/types`
  - `PUT /api/collaterals/catalogs/types/{id}`
  - `PATCH /api/collaterals/catalogs/types/{id}/status`
- Estados:
  - `GET /api/collaterals/catalogs/statuses`
  - `GET /api/collaterals/catalogs/statuses/{id}`
  - `POST /api/collaterals/catalogs/statuses`
  - `PUT /api/collaterals/catalogs/statuses/{id}`
  - `PATCH /api/collaterals/catalogs/statuses/{id}/status`

### Documentos
- `POST /api/collaterals/{collateralId}/documents` (`multipart/form-data`: `file`, `documentType`)
- `GET /api/collaterals/{collateralId}/documents`
- `GET /api/collaterals/{collateralId}/documents/{documentId}/download`
- `DELETE /api/collaterals/{collateralId}/documents/{documentId}`

**Validaciones relevantes a reflejar en UI**
- `appraisedValue` >= 0.
- archivos permitidos: `application/pdf`, `image/jpeg`, `image/png`
- tamaño máx default backend: `10 MB` (si no hay config visible en frontend, validar 10MB en UI como guardrail).

---

## 2) Estructura de rutas / menú (propuesta alineada a negocio)

### Menú (SideBar)
- **Clientes**
  - **Garantías** (listado + creación/edición)
    - Ruta: `/clients/collaterals`
    - Icono lucide sugerido: `ShieldCheck` o `FileBadge`
- **Catálogos**
  - **Garantías**
    - **Tipos de Garantía**
      - Ruta: `/catalogs/collaterals/types`
      - Icono: `ListTree` o `Tags`
    - **Estados de Garantía**
      - Ruta: `/catalogs/collaterals/statuses`
      - Icono: `ToggleLeft` o `CheckCircle2`

> Si tu app ya tiene “Catálogos” como tercer nivel (como hiciste con productos), respeta ese patrón.

### Rutas adicionales internas
- Detalle de garantía: `/clients/collaterals/:id`
- Editar garantía: `/clients/collaterals/:id/edit`
- Crear garantía: `/clients/collaterals/new`

---

## 3) Entregables (qué debe quedar funcionando)

### A) Pantalla Listado de Garantías
**Ruta:** `/clients/collaterals`

**UI:**
- Filtros:
  - Cliente (ownerClientId) → selector/buscador de clientes (reutilizar componente existente si ya lo tenés; si no existe, usar input de GUID temporal + placeholder para integrar luego).
  - Tipo (typeId) → dropdown con catálogo de tipos activos.
  - Estado (statusId) → dropdown con catálogo de estados activos.
  - Activo (active) → switch/checkbox.
  - Texto (search) → busca por referencia/descripcion/propietario.
- Grid/tabla:
  - Columnas: `Referencia`, `Tipo`, `Estado`, `Propietario`, `Identidad`, `Valor Avalúo`, `Fecha Avalúo`, `Activa`, `Creada`.
  - Acciones por fila: **Ver**, **Editar**.
- Paginación:
  - usar `skip/take`. Defaults: `take=20`.
  - Controles: anterior/siguiente + tamaño de página (20/50/100).
- Botón primario: **Nueva Garantía**.

**Data:**
- Consumir `GET /api/collaterals` con los filtros.

### B) Formulario Crear/Editar Garantía
**Rutas:**  
- Crear: `/clients/collaterals/new`  
- Editar: `/clients/collaterals/:id/edit`

**Campos (Create)**
- `ownerClientId` (requerido)
- `collateralTypeId` (requerido)
- `statusId` (opcional; si no se envía, backend usa `AVAILABLE`)
- `referenceNo` (max 60)
- `description` (max 500)
- `appraisedValue` (>= 0)
- `appraisedDate` (DateOnly → input date)

**Campos (Update)**
- todo lo anterior pero `statusId` requerido
- `isActive` (switch)

**Validación con Yup**
- strings con max.
- `appraisedValue` `min(0)`.
- `ownerClientId` y `collateralTypeId` obligatorios (Guid shape: regex simple).
- `appraisedDate` opcional.

**UX**
- Guardar → spinner + success toast/Swal.
- Manejo de ProblemDetails:
  - 422 → mostrar lista de errores (por campo si vienen).
  - 409 → mensaje de conflicto.
  - 404 → “No encontrado”.

### C) Detalle de Garantía + pestaña Documentos
**Ruta:** `/clients/collaterals/:id`

**UI:**
- Header con info clave (Referencia, Tipo, Estado, Propietario, Avalúo).
- Tabs:
  - **Datos**
  - **Documentos**

**Documentos**
- Listado (`GET /api/collaterals/{collateralId}/documents`):
  - columnas: `Tipo Documento`, `Nombre`, `Tipo MIME`, `Tamaño`, `Fecha subida (operativa)`, `Acciones`.
- Acciones:
  - **Descargar** usando `downloadUrl` (abrir en nueva pestaña o descarga directa).
  - **Eliminar** con confirmación.
- Upload:
  - input file + select `documentType` (string) + botón “Subir”.
  - Validar tipo MIME y tamaño antes de enviar.
  - Enviar `multipart/form-data` con `file` + `documentType` a `POST /documents`.
  - Re-cargar lista al subir.

> `documentType` por ahora manejarlo como: dropdown simple con opciones comunes (ej: `TITLE_DEED`, `APPRAISAL`, `PHOTO`, `OTHER`) **pero** implementarlo de forma extensible (const array local). Si luego lo convertís en catálogo, solo cambias data source.

### D) Administración de Catálogos (Tipos / Estados)

**Rutas:**
- `/catalogs/collaterals/types`
- `/catalogs/collaterals/statuses`

**UI común (reutilizable)**
- Grid con columnas: `Code`, `Name`, `SortOrder`, `Activa`, `Sistema`.
- Acciones:
  - Crear (modal o página aparte)
  - Editar
  - Activar/Desactivar (PATCH status)
- Validación:
  - `code` max 30, `name` max 80, `sortOrder` >= 0
- Respetar `isSystem`:
  - Si `isSystem == true`, **bloquear edición de code** y opcionalmente bloquear desactivación (si el backend lo permite desactivar, igual pedir confirmación extra).

---

## 4) Implementación técnica — Carpetas y archivos

> Ajusta nombres a tu estructura exacta, pero respeta la separación por capas.

### 4.1 Infrastructure — HTTP + DTOs

**A) DTOs (uno por archivo, kebab-case)**  
Ubicación: `src/infrastructure/intranet/requests/` y `src/infrastructure/intranet/responses/`

Crear:
- `create-collateral-request.ts`
- `update-collateral-request.ts`
- `collateral-response.ts`
- `collateral-document-response.ts`
- `collateral-catalog-item-dto.ts`
- `collateral-catalog-item-create-request.ts`
- `collateral-catalog-item-update-request.ts`
- `paged-result.ts` (si ya existe, reusar)

**B) API client**
- `src/infrastructure/intranet/collaterals/collaterals-api.ts`
  - funciones:
    - `getCollaterals(query)`
    - `getCollateralById(id)`
    - `createCollateral(payload)`
    - `updateCollateral(id, payload)`
    - `getCollateralTypes()`, `createCollateralType()`, `updateCollateralType()`, `patchCollateralTypeStatus()`
    - `getCollateralStatuses()`, etc
    - `getCollateralDocuments(collateralId)`
    - `uploadCollateralDocument(collateralId, { file, documentType })`
    - `deleteCollateralDocument(collateralId, documentId)`

**Notas**
- Para upload: usar `FormData` y setear `Content-Type: multipart/form-data` (o dejar que Axios lo infiera).
- Para descargar: usar `downloadUrl` directamente (no necesitas axios si el backend ya entrega URL completa o relativa; si es relativa, prefijar con baseURL).

### 4.2 Core — Actions (use-cases)
Ubicación sugerida: `src/core/actions/collaterals/` (o `src/core/actions/intranet-collaterals/` si prefieres mantener “intranet” en nombre)

Acciones (una clase por acción):
- `list-collaterals-action.ts`
- `get-collateral-action.ts`
- `create-collateral-action.ts`
- `update-collateral-action.ts`
- `list-collateral-types-action.ts`
- `create-collateral-type-action.ts`
- `update-collateral-type-action.ts`
- `patch-collateral-type-status-action.ts`
- lo mismo para statuses
- `list-collateral-documents-action.ts`
- `upload-collateral-document-action.ts`
- `delete-collateral-document-action.ts`

**Reglas**
- Cada action llama al API client y **normaliza errores** a una forma consistente para UI (ej: `{ message, status, errorsByField? }`).
- No usar parameter properties en constructors.

### 4.3 Presentation — Pages/Components

**Pages**
- `src/presentation/pages/collaterals/collaterals-list-page.tsx`
- `src/presentation/pages/collaterals/collateral-form-page.tsx`
- `src/presentation/pages/collaterals/collateral-detail-page.tsx`
- `src/presentation/pages/collaterals/components/collateral-documents-panel.tsx`
- `src/presentation/pages/catalogs/collaterals/collateral-types-page.tsx`
- `src/presentation/pages/catalogs/collaterals/collateral-statuses-page.tsx`
- Reutilizable:
  - `src/presentation/pages/catalogs/collaterals/components/collateral-catalog-editor-modal.tsx` (o inline)

**Componentes UI**
- Reusar tabla/paginación existentes si ya tenés.
- Si no hay, crear componentes simples y consistentes con el proyecto.

### 4.4 Router / Menu integration
- Agregar rutas al router central (según tu proyecto):
  - `/clients/collaterals`
  - `/clients/collaterals/new`
  - `/clients/collaterals/:id`
  - `/clients/collaterals/:id/edit`
  - `/catalogs/collaterals/types`
  - `/catalogs/collaterals/statuses`
- Proteger con tu `MiddleWare` / `VerifyUser` / `RequireAdmin`:
  - Catálogos deben requerir rol admin (si así lo manejas en tu app).
  - Listado/crear/editar garantías: al menos usuario autenticado.

---

## 5) Comportamientos y detalles finos (calidad)

1. **Caché simple de catálogos**: al entrar a garantías, cargar types/statuses una vez y mantener en estado local (o contexto si ya lo tienes) para evitar refetch excesivo.
2. **Fechas**:
   - `appraisedDate` viene como `YYYY-MM-DD` (DateOnly). Mantener en ese formato.
   - `createdAt` y `uploadedOperationalDate` mostrar como `dd/MM/yyyy` (HN).
3. **Decimal**:
   - `appraisedValue` mostrar con separador de miles y 2 decimales (pero enviar como number).
4. **Accesibilidad**:
   - mensajes de validación cerca del campo.
5. **Empty states**:
   - “No hay garantías con los filtros actuales”.
6. **Seguridad**:
   - No mostrar `storagePath` ni `storedFileName` en UI (solo `fileName`).
7. **DocumentType**:
   - Guardar como string; mostrar label friendly (map local).

---

## 6) Pruebas rápidas manuales (checklist)

- [ ] Listado carga con paginación (skip/take).
- [ ] Filtros aplican (cliente/tipo/estado/activo/search).
- [ ] Crear garantía sin statusId → backend asigna AVAILABLE.
- [ ] Editar garantía (cambia status, isActive).
- [ ] Detalle muestra datos correctos.
- [ ] Documentos: subir PDF/JPG/PNG <=10MB OK.
- [ ] Documentos: rechaza >10MB o tipo inválido antes de enviar.
- [ ] Documentos: descargar usando `downloadUrl`.
- [ ] Documentos: eliminar con confirmación.
- [ ] Catálogos: listar/crear/editar/activar/desactivar.
- [ ] `isSystem` respeta bloqueo UI.

---

## 7) Nota final para Codex

- Implementa todo lo anterior **sin romper** módulos existentes.
- Mantén consistencia con estilos y componentes actuales.
- Si detectas componentes ya existentes (table, pagination, modal, toast), **reutilízalos** en lugar de crear nuevos.
- Dame un resumen de los nuevos menus que debo crear en mi app con las rutas y con los iconos de lucide recomendados para cada menu