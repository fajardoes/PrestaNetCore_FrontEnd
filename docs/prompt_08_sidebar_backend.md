## Contexto obligatorio (seguir reglas del repo)
1. NO ejecutar npm/pnpm/yarn/vite/eslint y NO usar git. 
2. Respetar capas:
   * infrastructure: contratos/interfaces + validaciones
   * core/api: llamadas HTTP
   * core/actions: casos de uso y manejo de errores con ApiResult<T>
   * presentation/features/...: hooks + components + pages
   * providers: context si aplica 
3. Estilos con Tailwind (soportar dark:).

## Objetivo
Reemplazar el sidebar “hardcoded” por un sidebar que se construye con el árbol devuelto por el backend:
  * Endpoint: GET /api/menus/my 
  * Respuesta: árbol con children[], route puede ser null (contenedor), icon string nullable. 
  * Reglas de visibilidad ya las aplica backend, frontend solo renderiza.

## Contratos / tipos (infrastructure)
Crear/ubicar interfaces en:
```text
src/infrastructure/interfaces/security/menu.ts
```

Definir:
* MenuItemTreeDto:
  * id: string
  * title: string
  * slug: string
  * route: string | null
  * icon: string | null
  * order: number
  * children: MenuItemTreeDto[]
```text
Mantener nombres consistentes con la respuesta del backend (children, route, etc.).
```

## API layer (core/api)
Agregar en src/core/api/security/menus-api.ts (o carpeta equivalente dentro de core/api):
  * Función getMyMenus(): Promise<MenuItemTreeDto[]>
  * Debe usar el Axios client existente (ej: el wrapper en infrastructure/api/httpClient o el cliente que ya usa el proyecto).
  * La ruta debe ser exactamente: /api/menus/my

## Action (core/actions)
Crear acción en:
src/core/actions/security-menus/get-my-menus-action.ts

 * Clase (una responsabilidad por clase) que exponga:
    * execute(): Promise<ApiResult<MenuItemTreeDto[]>>
 * Manejar errores de manera uniforme con el helper de errores existente.
 * No meter lógica UI aquí.

## Hook (presentation/features/security/menus/hooks)

 ### Crear hook:
   src/presentation/features/security/menus/hooks/use-my-menus.ts

 ### Responsabilidades:

 * Llama a la acción GetMyMenusAction.
 * Expone:
    * menus: MenuItemTreeDto[]
    * isLoading: boolean
    * error: string | null
    * refetch(): Promise<void>
 * Debe evitar refetch infinito; usar useEffect una sola vez. 
 * Cache simple en memoria opcional:
    * si ya cargó y no hay necesidad, no volver a pegarle al API en cada render.

## Utilidad para íconos (presentation/share o feature)
Como icon viene como string (ej: "List", "Package"), implementar un mapper:

### Archivo sugerido:
src/presentation/share/helpers/menu-icon.tsx

* Importar íconos de lucide-react (solo si ya existe en el proyecto; si no existe, usar fallback sin agregar dependencia).
* Implementar:
   * getMenuIcon(iconName: string | null): ReactNode
* Fallback:
   * si iconName es null o no existe en el map, retornar un ícono default (o un span/placeholder).
* Mantener el map con algunos comunes: Home, Settings, Users, List, Package, Shield, FileText, Layers (y permitir agregar más después).
```text
Importante: no guardar ReactElement en data, solo mapear aquí.
```
## Componente Sidebar dinámico (presentation)
Identificar el componente actual del sidebar (por ejemplo presentation/share/components/sidebar.tsx o donde viva hoy). Reemplazar su fuente de datos por useMyMenus.

### Implementar:
 * Render recursivo del árbol:
    * Menú raíz → item → children
 * Reglas de UI:
    * Si route es null: renderizar como grupo/colapsable (sin navegación).
    * Si route existe: renderizar como NavLink de React Router.
 * Estado de colapso:
    * Mantener expanded: Record<string, boolean> por id o slug.
    * Por defecto: expandir automáticamente si alguna ruta hija está activa (basado en useLocation()).
 * Active state:
    * NavLink con estilos para activo/inactivo.
    * Para grupo (route null), marcarlo “activo” si cualquier descendiente está activo.
 * Loading/Error:
    * Mientras carga: skeleton/placeholder simple.
    * Si error: mostrar mensaje corto y botón “Reintentar” que llame refetch.

## Integración con tu MiddleWare/guards
Tu app ya protege rutas con un MiddleWare (layout autenticado). Ajustar para que:

 * El sidebar se renderice en el layout autenticado
 * La carga de menús ocurra solo cuando hay sesión
 * Si no hay token/sesión, no llamar /api/menus/my

## Routing (React Router)
No crear rutas automáticamente desde backend (por ahora).
 * El backend define route, pero React Router debe seguir teniendo rutas definidas.
 * Solo usar route como “link” para navegación.
```text
En el futuro, se podría validar que el usuario tenga acceso a la ruta con un guard, pero por ahora backend ya filtra menús.
```
## Archivos a crear/modificar (lista exacta)
Crear:
1. src/infrastructure/interfaces/security/menu.ts
2. src/core/api/security/menus-api.ts
3. src/core/actions/security-menus/get-my-menus-action.ts
4. src/presentation/features/security/menus/hooks/use-my-menus.ts
5. src/presentation/share/helpers/menu-icon.tsx

Modificar:
6. El componente real del sidebar existente (ubicarlo y adaptarlo).
7. Si es necesario, el layout autenticado donde se monta sidebar (para que cargue menús solo con sesión).

## Criterios de aceptación
* El sidebar se renderiza basado en /api/menus/my.
* Soporta niveles: padre/hijo/nieto (recursivo).
* Contenedores (route null) se muestran como grupos colapsables.
* Si una ruta hija está activa, el padre se expande automáticamente.
* Íconos se resuelven desde string (con fallback si no existe).
* No hay llamadas HTTP directas desde components/pages (solo hooks → actions → api).
* Compatible con dark mode.

## Notas
La respuesta del backend viene como árbol así (ejemplo): 
### Tree response example
```json
[
  {
    "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    "title": "Catalogos",
    "slug": "catalogos",
    "route": null,
    "icon": "List",
    "order": 10,
    "children": [
      {
        "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        "title": "Productos",
        "slug": "productos",
        "route": "/catalogos/productos",
        "icon": "Package",
        "order": 1,
        "children": []
      }
    ]
  }
]
```
* children siempre existe como array
* route puede ser null
* icon puede ser null
* slug es único (puede servir como key alternativa, pero usar id idealmente)
* el Sidebar actual vive en src/presentation/components/layout/Sidebar