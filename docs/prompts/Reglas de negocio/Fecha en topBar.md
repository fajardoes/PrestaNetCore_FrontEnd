**Prompt para Codex (Frontend) - Indicador de Fecha Operativa en TopBar**

**Contexto:**  
Ya existe el módulo frontend de **Fecha Operativa (Business Date)** con:

- hook useBusinessDate
- actions + API
- DTOs
- página administrativa

Ahora se requiere **mostrar un indicador global en el TopBar**, **solo de lectura**, sin lógica duplicada.

**Objetivo funcional**

Mostrar en el **TopBar** un indicador compacto con:

- 📅 **Fecha Operativa**: YYYY-MM-DD
- 🔘 **Estado del día**:
  - Abierto → verde
  - Cerrado → rojo
- Tooltip o texto secundario:
  - Zona horaria
  - Hora servidor local

Este indicador:

- Se muestra **para todos los usuarios autenticados**
- **NO** permite editar nada
- Se actualiza automáticamente al refrescar la app o al cambiar la fecha desde la pantalla admin

**Reglas obligatorias**

- **NO** ejecutar npm / git / lint
- **NO** llamadas directas a axios en el TopBar
- **Reutilizar** useBusinessDate
- Mantener estilos existentes del TopBar
- Incluir dark: variants

**Implementación requerida**

**1) Componente indicador (presentation)**

Crear componente:

src/presentation/components/topbar/business-date-indicator.tsx

Responsabilidad:

- Consumir useBusinessDate
- Mostrar:
  - Fecha operativa
  - Badge de estado (Abierto / Cerrado)
- Estados:
  - loading → skeleton o texto tenue "Cargando fecha…"
  - error → "Fecha no disponible"

UI sugerida:

- Texto pequeño (text-xs / text-sm)
- Badge con colores:
  - Abierto → bg-green-100 text-green-700 dark:bg-green-900
  - Cerrado → bg-red-100 text-red-700 dark:bg-red-900
- Tooltip (si el proyecto ya usa uno):
  - Zona horaria
  - Hora servidor local

❗ No mostrar botones ni acciones.

**2) Integración en TopBar**

Modificar el componente existente del TopBar, por ejemplo:

src/presentation/components/layout/topbar.tsx

(o el path real del proyecto)

Agregar el componente:

&lt;BusinessDateIndicator /&gt;

Ubicación sugerida:

- Lado derecho del TopBar
- Antes del avatar / menú de usuario
- Visible solo cuando el usuario está autenticado (usar la lógica ya existente)

No cambiar la lógica actual del TopBar.

**3) Comportamiento del hook**

El useBusinessDate:

- **NO** debe modificarse para este requerimiento
- El indicador solo consume state, isLoading, error
- Si el admin cambia la fecha en la pantalla administrativa y vuelve al dashboard, el indicador debe reflejar el nuevo valor al refrescar

**Criterios de aceptación**

- El TopBar muestra siempre la **Fecha Operativa**.
- El color del estado refleja correctamente Abierto / Cerrado.
- No hay llamadas HTTP duplicadas fuera del hook.
- Funciona en modo claro y oscuro.
- No introduce dependencias nuevas.

**Resultado esperado (UX)**

Ejemplo visual:

📅 2026-02-05 \[ABIERTO\]

Hover / tooltip:

Hora servidor: 14:32

Zona: America/Tegucigalpa