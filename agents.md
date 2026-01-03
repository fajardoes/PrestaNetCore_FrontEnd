## IMPORTANTE (reglas de trabajo)
- NO ejecutes `npm`, `pnpm`, `yarn`, `vite`, `eslint`.
- NO uses `git`.
- Solo genera o modifica archivos de FRONTEND en este repo.

## Development Commands

- **Development server**: `npm run dev` – Starts the Vite development server
- **Build**: `npm run build` – Type-check (`tsc -b`) and bundle for production
- **Lint**: `npm run lint` – Run ESLint across the project
- **Preview**: `npm run preview` – Serve the production build locally

## Componentes compartidos de listas/tablas

- `src/presentation/share/components/list-filters-bar.tsx`: barra estándar de filtros con buscador y selector de estado (activos/inactivos/todos). Recibe `search`, `onSearchChange`, `status`, `onStatusChange`, `placeholder`, `children` para filtros adicionales (por ejemplo selects) y `actions` para botones (crear, limpiar filtros, etc.). Úsalo en páginas de listados para mantener consistencia.
- `src/presentation/share/components/table-pagination.tsx`: pie de paginación uniforme para tablas. Recibe `page`, `totalPages`, `onPageChange` y opcional `label`. Integrarlo en tablas para la navegación de páginas.

## Architecture Overview

The frontend follows a Clean Architecture separation: core business logic, infrastructure concerns, and presentation/UI. Every new feature or component must respect this layering to keep responsibilities clean and evolvable.

### Directory Structure

```
src/
├─ core/                         # Pure domain/business logic
│  ├─ actions/                   # Application use-cases calling APIs
│  ├─ api/                       # Low-level HTTP wrappers
│  └─ helpers/                   # Shared domain utilities (formatters, errors)
├─ infrastructure/               # External contracts & adapters
│  ├─ api/                       # Axios client & token utilities
│  ├─ interfaces/                # Shared TypeScript interfaces/types
│  └─ validations/               # Yup/Zod schemas per feature
├─ presentation/                 # UI composition
│  ├─ features/                  # Feature slices (e.g. security)
│  │  └─ <feature>/
│  │     ├─ components/          # Pure presentational components
│  │     ├─ hooks/               # Feature hooks that talk to actions
│  │     └─ pages/               # Page-level orchestrators
│  ├─ pages/                     # Legacy/high-level pages (migrate over time)
│  └─ share/                     # Reusable UI elements (modals, feedback, etc.)
├─ providers/                    # React context providers
├─ routes/                       # Routing definitions
└─ types/                        # Cross-cutting type definitions
```

### Implementation Rules (aplican a cada nuevo componente/feature)

1. **Pages solo orquestan**: manejan estado de UI (modales, selección, feedback), invocan hooks y pasan props. Nada de llamadas HTTP directas ni lógica de dominio compleja.
2. **Components = UI pura**: reciben props, renderizan y emiten callbacks. Sin Axios, acciones ni efectos secundarios.
3. **Hooks = puente con acciones**: viven en `presentation/features/<feature>/hooks`, llaman a acciones, manejan estados `{ mutate, isLoading, error }` y exponen una API clara al UI.
4. **Actions = casos de uso**: residen en `core/actions`, invocan funciones del API, unifican manejo de errores y devuelven `ApiResult<T>`.
5. **API layer**: `core/api` hace las llamadas HTTP (Axios) y mapea respuestas a las interfaces del dominio. No contiene lógica de UI.
6. **Validations**: esquemas en `infrastructure/validations/<feature>/` usando Yup (o Zod si aplica). Exportar `type` derivados (`InferType`) para reutilizarlo en el UI.
7. **Helpers**: colocarlos en `core/helpers` y mantenerlos reutilizables (formatters, manejo de errores, etc.).
8. **Nomenclatura consistente**: archivos en snake-kebab (`users-table.tsx`, `use-users.ts`) y agrupar por feature para que los imports sean predecibles.
9. **Tema claro/oscuro obligatorio**: todo nuevo componente visual debe incluir variantes `dark:` de Tailwind.

### Technology Stack

- **React 18** con TypeScript
- **Vite 5** como bundler
- **Tailwind CSS 3** para estilos (dark mode incluido)
- **React Router 6** para navegación
- **Axios** envuelto en `infrastructure/api/httpClient`
- **React Hook Form** + `@hookform/resolvers`
- **Yup** y **Zod** para validaciones según lo requiera el feature
- **jwt-decode** para parsing de tokens

### Path Aliases

Configurados en `tsconfig.app.json` y `vite.config.ts`:

- `@/*` → `src/*`
- `@/core/*` → `src/core/*`
- `@/infrastructure/*` → `src/infrastructure/*`
- `@/presentation/*` → `src/presentation/*`
- `@/routes/*` → `src/routes/*`
- `@/providers/*` → `src/providers/*`
- `@/hooks/*` → `src/hooks/*` (solo legado; preferir hooks por feature)
- `@/types/*` → `src/types/*`

### TypeScript & Code Quality

- Target **ES2022**, modo estricto, sin locales/parámetros sin usar
- JSX runtime: `react-jsx`
- ESLint con plugins de TypeScript, React Hooks y React Refresh
- Mantener la lógica de negocio testeable limitando dependencias de UI al layer de presentación

### Notas de UI

- Siempre ofrecer soporte para tema claro/oscuro mediante utilidades Tailwind.
- Formularios nuevos deben integrarse con `react-hook-form` y un esquema Yup/Zod correspondiente.
- Centralizar feedback (éxito/error) usando componentes compartidos dentro de `presentation/share/components`.
- No hagas pruebas de eslint ni intentes correr la aplicacion
- No hagas pruebas con git ni intentes ejecutarlo

Cuando agregues nuevas funcionalidades replica esta arquitectura: define contratos en infraestructura, casos de uso en core, hooks y componentes dentro de `presentation/features/<feature>` y deja que las páginas se encarguen únicamente de coordinar esas piezas.
