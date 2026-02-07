## Contexto obligatorio (seguir reglas del repo)
1. NO ejecutar npm/pnpm/yarn/vite/eslint y NO usar git. 
2. Respetar capas:
   * infrastructure: contratos/interfaces + validaciones
   * core/api: llamadas HTTP
   * core/actions: casos de uso y manejo de errores con ApiResult<T>
   * presentation/features/...: hooks + components + pages
   * providers: context si aplica 
3. Estilos con Tailwind (soportar dark:).

 **Objetivo:**  
 Integrar el módulo de Promotores en el frontend de PrestaNet respetando la arquitectura existente, agregando navegación y vistas base.

 **Instrucciones clave:**
 
 -   Agregar el menú **Promotores** bajo el módulo **Creditos**
 -   Ruta base: `/sales/promoters`
 -   Icono de menú: `UserCheck` (lucide-react)
 -   Implementar vistas de:
     -   Listado   
     -   Crear 
     -   Editar    
 -   Consumir API `/api/sales/promoters`
 -   No permitir eliminación física, solo activación/desactivación

# Overview del backend:

## Endpoints (JWT requerido)
- `POST /api/sales/promoters` -> body `CreatePromoterRequest`, retorna `PromoterResponse`
- `PUT /api/sales/promoters/{id}` -> body `UpdatePromoterRequest`, retorna `PromoterResponse`
- `GET /api/sales/promoters/{id}` -> retorna `PromoterResponse`
- `GET /api/sales/promoters` -> query `active`, `search`, `skip`, `take`, retorna `PagedResult<PromoterResponse>`

Errores con Problem Details: 404 no existe, 409 duplicados, 422 validacion.

## DTOs (Data)
- `CreatePromoterRequest`
  - `clientId` (Guid, requerido)
  - `code` (string?, opcional, max 30, unico si existe)
  - `notes` (string?, opcional, max 250)

- `UpdatePromoterRequest`
  - `code` (string?, opcional, max 30, unico si existe)
  - `isActive` (bool)
  - `notes` (string?, opcional, max 250)

- `PromotersSearchRequest`
  - `isActive` (bool?)
  - `search` (string?)
  - `skip` (int, >= 0)
  - `take` (int, 1..200)

- `PromoterResponse`
  - `id` (Guid)
  - `clientId` (Guid)
  - `code` (string?)
  - `isActive` (bool)
  - `notes` (string?)
  - `createdAt` (DateTime)
  - `clientFullName` (string?)
  - `clientIdentityNo` (string?)
  - `clientEmail` (string?) -> actualmente no se persiste en clientes, puede ser null

## Reglas clave
- Un promotor referencia a `clients.clients` por `client_id`.
- El cliente debe existir y ser empleado (`is_employee = true`).
- Un cliente no puede ser promotor mas de una vez.
- `code` es opcional y unico si se proporciona.
- No se elimina el promotor; se inactiva con `isActive = false`.

## Integracion Frontend (minimos)
- Para crear promotor, solicitar `clientId` de un cliente empleado y opcionalmente `code` y `notes`.
- Listado usa `GET /api/sales/promoters` y muestra `clientFullName`, `clientIdentityNo`, `code`, `isActive`.
- Para desactivar/activar, usar `PUT /api/sales/promoters/{id}` con `isActive`.