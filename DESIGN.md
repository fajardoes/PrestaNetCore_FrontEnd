---
version: "alpha"
name: "PrestaNet"
description: "Sistema financiero administrativo para operar solicitudes, préstamos, pagos y reportes."
reference: "Pilarh Connect DESIGN.md"
colors:
  primary: "#0284c7"
  primary-hover: "#0369a1"
  primary-soft: "#f0f9ff"
  primary-soft-dark: "rgb(14 165 233 / 0.10)"
  danger: "#dc2626"
  warning: "#fef3c7"
  surface: "#ffffff"
  surface-muted: "#f8fafc"
  surface-dark: "#020617"
  surface-panel-dark: "#0f172a"
  border: "#e2e8f0"
  border-dark: "#1e293b"
  text: "#0f172a"
  text-muted: "#64748b"
  text-dark: "#f8fafc"
  text-muted-dark: "#94a3b8"
typography:
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
  page-title:
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: "2rem"
  section-title:
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: "1.5rem"
  body:
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  label:
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  numeric:
    fontVariantNumeric: "tabular-nums"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
---

## Propósito

PrestaNet es una aplicación financiera operativa. La interfaz debe sentirse sobria, densa,
confiable y fácil de escanear en pantallas pequeñas. Las vistas autenticadas priorizan datos,
acciones claras, estados visibles y formularios eficientes sobre elementos decorativos.

## Tipografía

La fuente global es **Inter**, con fallback del sistema. Está definida en `src/index.css` y
replicada en `tailwind.config.js` para que `font-sans` conserve la misma familia.

Los números se muestran con `tabular-nums` globalmente para alinear montos, cuotas, saldos,
porcentajes y contadores. Los datos técnicos como UUID, códigos o contraseñas pueden usar
`font-mono` de manera puntual.

Jerarquía recomendada:

- Títulos principales: `text-2xl font-semibold` solo para el encabezado de una vista.
- Títulos dentro de tarjetas: `text-base font-semibold`.
- Labels y botones: `text-sm font-medium` o `font-semibold` para estados.
- Texto auxiliar: `text-sm text-slate-500 dark:text-slate-400`.
- Etiquetas contextuales pequeñas: `text-[11px] uppercase tracking-wide`.

No usar letter spacing negativo ni escalar tipografía con el ancho de la ventana.

## Colores

La estructura utiliza `slate` para fondos, superficies, bordes y textos. El azul `sky` es el
acento primario actual de PrestaNet para acciones, foco e interacción.

- Claro: `bg-slate-50`, `bg-white`, `text-slate-900`, `border-slate-200`.
- Oscuro: `bg-slate-950`, `bg-slate-900`, `text-slate-100`, `border-slate-800`.
- Acción primaria: `primary`, `sky-600` o `sky-700` según el componente existente.
- Error o acción destructiva: `red`.
- Advertencia no bloqueante: `amber`.

No introducir paletas nuevas por módulo. Todo componente visual debe incluir su variante
`dark:` correspondiente.

## Layout y densidad

Las páginas deben usar espacios verticales moderados, tarjetas con `rounded-xl`, `border` y
`shadow-sm`, y padding compacto (`p-3` cuando el bloque contenga información densa). Los
formularios, métricas y encabezados deben priorizar una lectura rápida en monitores pequeños.

Las tablas deben conservar scroll horizontal cuando sea necesario y usar filas compactas,
bordes visibles y acciones de fila mediante componentes o clases compartidas.

## Componentes

Antes de crear controles nuevos, reutilizar los componentes compartidos de
`src/presentation/share/components`, incluyendo selectores, fechas, tablas, confirmaciones y
vista previa de archivos. Las acciones deben respetar los permisos y endpoints `/actions` del
backend; el diseño no debe duplicar reglas de negocio.

## Movimiento y accesibilidad

Mantener focos visibles, etiquetas legibles, nombres accesibles para acciones iconográficas y
estados de carga/error/vacío cerca del área afectada. Las transiciones deben ser sutiles y
respetar `prefers-reduced-motion` cuando se agreguen animaciones nuevas.
