**Prompt para Codex (Frontend) - Módulo Fecha Operativa (Business Date)**

## Contexto obligatorio (seguir reglas del repo)
1. NO ejecutar npm/pnpm/yarn/vite/eslint y NO usar git. 
2. Respetar capas:
   * infrastructure: contratos/interfaces + validaciones
   * core/api: llamadas HTTP
   * core/actions: casos de uso y manejo de errores con ApiResult<T>
   * presentation/features/...: hooks + components + pages
   * providers: context si aplica 
3. Estilos con Tailwind (soportar dark:).

Ya existe en backend el módulo de Fecha Operativa (Business Date) con endpoints JWT y reglas descritas. Implementar integración en frontend **siguiendo estrictamente** la arquitectura del repo (core/infrastructure/presentation), y las reglas del agents.md (**NO ejecutar npm/git/vite/lint**).

**Objetivo funcional (frontend)**

- Mostrar al usuario la **fecha operativa** actual, el estado de **día abierto/cerrado**, y el **reloj del servidor** (utc/local + timeZone).
- Permitir a usuarios con rol **admin**:
  - Cambiar la fecha operativa (PUT /api/system/business-date).
  - Abrir/cerrar el día (PATCH /api/system/business-day/status).
- Manejar errores del backend usando Problem Details (400/404/409) y mostrar feedback uniforme.

**Reglas obligatorias**

- **NO** ejecutes npm, pnpm, yarn, vite, eslint.
- **NO** uses git.
- Modificar/crear solo archivos en el repo frontend.
- Respetar Clean Architecture:
  - Contratos/DTOs en infrastructure
  - Casos de uso en core/actions
  - Hooks + UI en presentation/features/&lt;feature&gt;
  - Pages solo orquestan (sin axios directo).
- Incluir dark: en estilos nuevos.

**Endpoints backend (ya existentes)**

- GET /api/system/business-date → BusinessDateStateDto
- PUT /api/system/business-date (admin) body: SetBusinessDateRequestDto
- PATCH /api/system/business-day/status (admin) body: SetDayOpenRequestDto

DTOs esperados:

- BusinessDateStateDto:
  - businessDate (string date)
  - isDayOpen (boolean)
  - serverUtcNow (string datetime)
  - serverLocalNow (string datetime)
  - timeZone (string)
- SetBusinessDateRequestDto: businessDate (string date)
- SetDayOpenRequestDto: isDayOpen (boolean)

**Implementación requerida (paso a paso)**

**1) Infraestructura: contratos y API**

Crear una carpeta feature para system/business-date:

**A. DTOs**

- src/infrastructure/interfaces/system/business-date-state.dto.ts
- src/infrastructure/interfaces/system/set-business-date-request.dto.ts
- src/infrastructure/interfaces/system/set-day-open-request.dto.ts

Usar interfaces TypeScript, un archivo por DTO.

**B. API client (core/api)**  
Crear wrapper de llamadas HTTP (sin lógica UI):

- src/core/api/system/business-date-api.ts

Exportar funciones:

- getBusinessDate(): Promise&lt;BusinessDateStateDto&gt;
- setBusinessDate(payload: SetBusinessDateRequestDto): Promise&lt;BusinessDateStateDto&gt; (o void si backend no devuelve, pero intentar mapear al estado si viene)
- setBusinessDayStatus(payload: SetDayOpenRequestDto): Promise&lt;BusinessDateStateDto&gt; (mismo criterio)

Usar el axios client existente en infrastructure/api/httpClient (no inventar otro).

**2) Core: Actions (casos de uso)**

Crear acciones en:

- src/core/actions/system/get-business-date-action.ts
- src/core/actions/system/set-business-date-action.ts
- src/core/actions/system/set-business-day-status-action.ts

Cada action debe:

- Llamar a business-date-api
- Envolver respuesta en el patrón existente de ApiResult&lt;T&gt; (si ya existe en el proyecto).
- Normalizar errores de Problem Details:
  - 400: validación → mostrar mensaje entendible
  - 404: configuración inexistente → mensaje "Configuración de fecha operativa no inicializada"
  - 409: conflicto/concurrencia → "Conflicto: el registro cambió, refresca e intenta de nuevo"

Importante: NO usar parameter properties en clases si el TS del proyecto lo restringe; usar fields + asignación en constructor si aplica.

**3) Presentation: hooks**

Crear hook:

- src/presentation/features/system-business-date/hooks/use-business-date.ts

Debe exponer:

- state: BusinessDateStateDto | null
- isLoading: boolean
- error: string | null
- refresh(): Promise&lt;void&gt;
- updateBusinessDate(date: string): Promise&lt;boolean&gt; (true si ok)
- setDayOpen(isOpen: boolean): Promise&lt;boolean&gt;

Comportamiento:

- Al montar, hacer refresh().
- Si falla, setear error con mensaje amigable.
- Tras cambiar fecha o estado, refrescar estado.

**4) Presentation: UI (componentes + página)**

Crear feature folder:  
src/presentation/features/system-business-date/

**A. Componentes (UI pura)**

- components/business-date-summary-card.tsx
  - Muestra:
    - Fecha operativa (businessDate)
    - Estado del día (badge "Abierto" / "Cerrado")
    - serverLocalNow, serverUtcNow, timeZone
  - Estilos con Tailwind + dark:
- components/set-business-date-modal.tsx
  - Modal con react-hook-form + yup
  - Input tipo date (HTML) para businessDate
  - Validación:
    - requerido
    - formato date válido
  - Al submit llama callback onSubmit(date)
  - Mostrar loading/errores
- components/set-day-open-toggle.tsx
  - Toggle/checkbox o botones "Abrir día / Cerrar día"
  - Recibe isDayOpen, onChange(boolean), isLoading
  - UI accesible

**B. Página (orquestación)**

- pages/system-business-date-page.tsx
  - Usa useBusinessDate
  - Renderiza summary card
  - Si usuario es admin: muestra
    - botón "Cambiar fecha operativa" → abre modal
    - control abrir/cerrar día
  - Si NO es admin: ocultar controles y mostrar nota "Solo administradores pueden cambiar…"

Para el chequeo de rol, reutilizar el mecanismo existente del proyecto (contexto de usuario, helpers o guards). No inventar auth nueva.

**5) Ruteo y navegación**

Agregar una ruta protegida (solo admin preferible) hacia la pantalla:

- Archivo de rutas donde se definan rutas (ej. src/routes/...)
  - Ruta sugerida: /admin/system/business-date
  - Título: "Fecha Operativa"

Si el proyecto ya tiene RequireAdmin o un guard similar, envolver la ruta.

**6) Detalles UX mínimos (pero importantes)**

- Mostrar feedback de éxito/error con los componentes compartidos existentes (si hay toast/Swal/snackbar, reutilizar).
- En error 409: sugerir al usuario refrescar.
- Mantener consistencia de estilos (cards, botones).
- No introducir dependencias nuevas.

**Criterios de aceptación**

- Al entrar a la página, se consulta GET /api/system/business-date y se muestra el estado.
- Usuario no-admin:
  - ve la info
  - no ve (o no puede usar) botones de cambio
- Usuario admin:
  - puede cambiar fecha → se refleja tras guardar
  - puede abrir/cerrar día → se refleja tras guardar
- Errores 400/404/409 se muestran con mensaje claro.

**Entregable**

- Crear/editar archivos exactamente en las rutas indicadas.
- Código TypeScript/React limpio, con dark: variants.
- Sin ejecutar comandos.