## IMPORTANTE (reglas de trabajo)
- NO ejecutes `npm`, `pnpm`, `yarn`, `vite`, `eslint`.
- NO uses `git`.
- Solo genera o modifica archivos de FRONTEND en este repo.

## Development Commands

- **Development server**: `npm run dev` â€“ Starts the Vite development server
- **Build**: `npm run build` â€“ Type-check (`tsc -b`) and bundle for production
- **Lint**: `npm run lint` â€“ Run ESLint across the project
- **Preview**: `npm run preview` â€“ Serve the production build locally

## Componentes compartidos de listas/tablas

- `src/presentation/share/components/list-filters-bar.tsx`: barra estÃ¡ndar de filtros con buscador y selector de estado (activos/inactivos/todos). Recibe `search`, `onSearchChange`, `status`, `onStatusChange`, `placeholder`, `children` para filtros adicionales (por ejemplo selects) y `actions` para botones (crear, limpiar filtros, etc.). Ãšsalo en pÃ¡ginas de listados para mantener consistencia.
- `src/presentation/share/components/table-pagination.tsx`: pie de paginaciÃ³n uniforme para tablas. Recibe `page`, `totalPages`, `onPageChange` y opcional `label`. Integrarlo en tablas para la navegaciÃ³n de pÃ¡ginas.

## Componentes compartidos de selects

- `src/presentation/share/components/async-select.tsx`: wrapper de `react-select/async` con estilos Tailwind (claro/oscuro). Usar este componente para selects asÃ­ncronos con bÃºsqueda remota. No usar `react-select` directamente en componentes de features.

## Componentes compartidos de fecha

- `src/presentation/share/components/date-picker.tsx`: componente global estÃ¡ndar para selecciÃ³n de fechas. Debe usarse en todos los mÃ³dulos para campos de fecha (por ejemplo fecha de nacimiento, emisiÃ³n, vencimiento, etc.) en lugar de `input type="date"` u otros date pickers.

## Architecture Overview

The frontend follows a Clean Architecture separation: core business logic, infrastructure concerns, and presentation/UI. Every new feature or component must respect this layering to keep responsibilities clean and evolvable.

### Directory Structure

```
src/
â”œâ”€ core/                         # Pure domain/business logic
â”‚  â”œâ”€ actions/                   # Application use-cases calling APIs
â”‚  â”œâ”€ api/                       # Low-level HTTP wrappers
â”‚  â””â”€ helpers/                   # Shared domain utilities (formatters, errors)
â”œâ”€ infrastructure/               # External contracts & adapters
â”‚  â”œâ”€ api/                       # Axios client & token utilities
â”‚  â”œâ”€ interfaces/                # Shared TypeScript interfaces/types
â”‚  â””â”€ validations/               # Yup/Zod schemas per feature
â”œâ”€ presentation/                 # UI composition
â”‚  â”œâ”€ features/                  # Feature slices (e.g. security)
â”‚  â”‚  â””â”€ <feature>/
â”‚  â”‚     â”œâ”€ components/          # Pure presentational components
â”‚  â”‚     â”œâ”€ hooks/               # Feature hooks that talk to actions
â”‚  â”‚     â””â”€ pages/               # Page-level orchestrators
â”‚  â”œâ”€ pages/                     # Legacy/high-level pages (migrate over time)
â”‚  â””â”€ share/                     # Reusable UI elements (modals, feedback, etc.)
â”œâ”€ providers/                    # React context providers
â”œâ”€ routes/                       # Routing definitions
â””â”€ types/                        # Cross-cutting type definitions
```

### Implementation Rules (aplican a cada nuevo componente/feature)

1. **Pages solo orquestan**: manejan estado de UI (modales, selecciÃ³n, feedback), invocan hooks y pasan props. Nada de llamadas HTTP directas ni lÃ³gica de dominio compleja.
2. **Components = UI pura**: reciben props, renderizan y emiten callbacks. Sin Axios, acciones ni efectos secundarios.
3. **Hooks = puente con acciones**: viven en `presentation/features/<feature>/hooks`, llaman a acciones, manejan estados `{ mutate, isLoading, error }` y exponen una API clara al UI.
4. **Actions = casos de uso**: residen en `core/actions`, invocan funciones del API, unifican manejo de errores y devuelven `ApiResult<T>`.
5. **API layer**: `core/api` hace las llamadas HTTP (Axios) y mapea respuestas a las interfaces del dominio. No contiene lÃ³gica de UI.
6. **Validations**: esquemas en `infrastructure/validations/<feature>/` usando Yup (o Zod si aplica). Exportar `type` derivados (`InferType`) para reutilizarlo en el UI.
7. **Helpers**: colocarlos en `core/helpers` y mantenerlos reutilizables (formatters, manejo de errores, etc.).
8. **Nomenclatura consistente**: archivos en snake-kebab (`users-table.tsx`, `use-users.ts`) y agrupar por feature para que los imports sean predecibles.
9. **Tema claro/oscuro obligatorio**: todo nuevo componente visual debe incluir variantes `dark:` de Tailwind.

### Technology Stack

- **React 18** con TypeScript
- **Vite 5** como bundler
- **Tailwind CSS 3** para estilos (dark mode incluido)
- **React Router 6** para navegaciÃ³n
- **Axios** envuelto en `infrastructure/api/httpClient`
- **React Hook Form** + `@hookform/resolvers`
- **Yup** y **Zod** para validaciones segÃºn lo requiera el feature
- **jwt-decode** para parsing de tokens

### Path Aliases

Configurados en `tsconfig.app.json` y `vite.config.ts`:

- `@/*` â†’ `src/*`
- `@/core/*` â†’ `src/core/*`
- `@/infrastructure/*` â†’ `src/infrastructure/*`
- `@/presentation/*` â†’ `src/presentation/*`
- `@/routes/*` â†’ `src/routes/*`
- `@/providers/*` â†’ `src/providers/*`
- `@/hooks/*` â†’ `src/hooks/*` (solo legado; preferir hooks por feature)
- `@/types/*` â†’ `src/types/*`

### TypeScript & Code Quality

- Target **ES2022**, modo estricto, sin locales/parÃ¡metros sin usar
- JSX runtime: `react-jsx`
- ESLint con plugins de TypeScript, React Hooks y React Refresh
- Mantener la lÃ³gica de negocio testeable limitando dependencias de UI al layer de presentaciÃ³n

### Notas de UI

- Siempre ofrecer soporte para tema claro/oscuro mediante utilidades Tailwind.
- Formularios nuevos deben integrarse con `react-hook-form` y un esquema Yup/Zod correspondiente.
- Centralizar feedback (Ã©xito/error) usando componentes compartidos dentro de `presentation/share/components`.
- En listas tipo tarjetas con estado (ej. referencias, actividades, comisiones, seguros, garantÃ­as): usar tarjeta con etiqueta Activo/Inactivo, botÃ³n Agregar que abre modal con toggle Activo, y fondo tenue rojo para items inactivos (`bg-red-50` y variante `dark:bg-red-500/10`).
- No hagas pruebas de eslint ni intentes correr la aplicacion
- No hagas pruebas con git ni intentes ejecutarlo

Cuando agregues nuevas funcionalidades replica esta arquitectura: define contratos en infraestructura, casos de uso en core, hooks y componentes dentro de `presentation/features/<feature>` y deja que las pÃ¡ginas se encarguen Ãºnicamente de coordinar esas piezas.
