# PrestaNet — Prompt Codex (Frontend)
## Integración de Ficha Financiera dentro del flujo de Solicitudes de Crédito

**Reglas:** NO ejecutar `npm/pnpm/yarn/vite/eslint`, NO usar `git`, SOLO crear/modificar archivos del **frontend**.

## Contexto

Ya existe en el backend la funcionalidad de **Ficha Financiera por solicitud**, integrada al flujo de solicitudes de crédito y no como módulo aparte.

La ficha financiera:
- cuelga de una solicitud existente
- solo puede crearse o editarse mientras la solicitud está en estado `DRAFT`
- se consume mediante endpoints específicos del backend
- devuelve campos base, totales calculados, indicadores y bandera de completitud
- sincroniza la colección de `otherLiabilities` en cada `PUT`

El frontend debe integrar esta funcionalidad **dentro del flujo actual de creación / edición / visualización de la solicitud**, respetando la arquitectura existente del proyecto y sin romper el resto del expediente.

---

## Fuente de verdad backend ya construida

Tomar como contrato lo que ya quedó implementado en backend:

### Endpoints disponibles
- `GET /api/loans/applications/{loanApplicationId}/financial-profile`
- `PUT /api/loans/applications/{loanApplicationId}/financial-profile`
- `GET /api/loans/applications/{loanApplicationId}/financial-profile/status`
- `GET /api/loan-applications/{id}`
- `GET /api/loan-applications`

### Seguridad
- permiso para leer ficha financiera: `loan_applications.read`
- permiso para guardar ficha financiera: `loan_applications.update_draft`

### Reglas clave
- solo editar en `DRAFT`
- `GET .../financial-profile` puede devolver `404` si aún no existe ficha
- el backend recalcula totales, indicadores e `isComplete`
- el frontend no debe enviar esos calculados como fuente de verdad
- `PUT` sincroniza toda la colección de `otherLiabilities`

---

## Objetivo del frontend

Implementar una sección o paso del flujo de solicitud llamada **Ficha Financiera**, integrada al detalle/edición de la solicitud existente.

Esta sección debe permitir:

1. capturar datos base de activos, pasivos, ingresos y gastos
2. administrar múltiples líneas de otros pasivos
3. mostrar totales calculados solo lectura
4. mostrar indicadores financieros solo lectura
5. mostrar estado de completitud
6. guardar mediante `PUT`
7. bloquear edición cuando la solicitud no esté en `DRAFT`
8. integrarse con badges/checklists del detalle y listado de solicitudes

---

## Alcance funcional requerido

## 1. Ubicación dentro del flujo
Integrar la ficha financiera como parte del flujo existente de solicitudes de crédito.

No crear un módulo independiente en el menú principal.

Debe vivir dentro de una de estas dos estrategias, según la estructura actual del frontend:

### Opción A
Como una pestaña dentro del detalle / edición de la solicitud:
- Resumen
- Cliente
- Garantías
- Documentos
- **Ficha Financiera**

### Opción B
Como un paso dentro del wizard de la solicitud:
- Datos generales
- Información crediticia
- **Ficha Financiera**
- Revisión final

Elegir la opción que mejor encaje con el frontend actual del proyecto, priorizando reutilizar la pantalla existente de detalle o edición de solicitud.

---

## 2. Comportamiento general de carga

Al abrir la sección de ficha financiera:

1. obtener el detalle de la solicitud existente
2. identificar:
   - `status`
   - `hasFinancialProfile`
   - `isFinancialProfileComplete`
   - `financialProfileUpdatedAt`
   - `financialDebtRatio`
   - `financialDebtToEquityRatio`

3. intentar cargar:
```http
GET /api/loans/applications/{loanApplicationId}/financial-profile
```

### Si responde `200`
- poblar formulario con valores base
- mostrar calculados e indicadores del backend
- guardar el `id` de la ficha si el frontend lo necesita a nivel visual
- mostrar última actualización si aplica

### Si responde `404`
- interpretar que la ficha aún no existe
- inicializar formulario vacío con valores base por defecto
- no mostrar error técnico al usuario
- mostrar que la ficha aún no ha sido creada

### Si responde `403`
- mostrar estado de acceso denegado / sin permisos

---

## 3. Regla de edición
La edición solo se permite cuando la solicitud está en estado `DRAFT`.

### Comportamiento UI
Si la solicitud está en `DRAFT`:
- inputs habilitados
- botón guardar habilitado según permisos
- se permite agregar/eliminar líneas en otros pasivos

Si la solicitud NO está en `DRAFT`:
- inputs deshabilitados o vista read-only
- no permitir guardar
- no permitir agregar/eliminar líneas
- mostrar mensaje claro tipo:
  - “La ficha financiera solo puede editarse mientras la solicitud está en borrador.”

---

## 4. Estructura visual sugerida

La pantalla debe organizarse en bloques claros y legibles.

### Bloque 1. Encabezado de sección
Mostrar:
- título: **Ficha financiera**
- estado de la solicitud
- badge de completitud:
  - Completa
  - Incompleta
- fecha de última actualización si existe

### Bloque 2. Metadatos de análisis
Campos:
- `analysisPeriodType`
- `notes`
- `analysisComments`

Reglas:
- `analysisPeriodType` requerido
- por ahora solo opción `monthly`

### Bloque 3. Composición de activos
Campos editables:
- Cajas y bancos
- Cuentas por cobrar
- Valor inventario
- Casas / terrenos
- Vehículos
- Menajes

Campo calculado solo lectura:
- Total activos

### Bloque 4. Pasivos
Campos editables:
- Cuentas por pagar proveedores
- Préstamos por pagar

Subsección editable:
- Otros pasivos (tabla o lista dinámica)

Campos calculados solo lectura:
- Total otros pasivos
- Total pasivos
- Patrimonio
- Total pasivo + patrimonio

### Bloque 5. Ingresos del periodo
Campos editables:
- Ingresos del negocio
- Ingreso por salario
- Cónyuge / hijos
- Remesas
- Otros ingresos

Campo calculado solo lectura:
- Total ingresos

### Bloque 6. Gastos del periodo
Campos editables:
- Costo de venta del negocio
- Alimentación
- Salud / educación
- Servicios públicos
- Pago de cuotas de préstamos

Campo calculado solo lectura:
- Total gastos

### Bloque 7. Indicadores y resumen
Campos solo lectura:
- Utilidad del periodo
- Ratio de endeudamiento sobre activos
- Ratio de endeudamiento sobre patrimonio
- Estado de completitud

### Bloque 8. Acciones
- Guardar ficha financiera
- Cancelar / volver si el flujo ya lo maneja
- Opcional: botón refrescar desde backend si la pantalla lo necesita

---

## 5. UX recomendada

### Inputs monetarios
Todos los montos deben manejarse como inputs monetarios/decimales amigables.

Recomendaciones:
- permitir escribir números naturales y decimales
- evitar valores negativos desde UI
- normalizar vacío a `0` o `null` temporal según convenga internamente, pero antes del submit enviar valor válido al backend
- mostrar formato visual consistente para moneda

### Campos calculados
Los totales e indicadores deben verse claramente como:
- calculados
- solo lectura
- provenientes del backend

Se pueden presentar como cards, summary rows o inputs readonly.

### Completitud
Mostrar visualmente si la ficha está:
- completa
- incompleta

Idealmente con badge o alerta suave.

### Estado sin ficha existente
Si la ficha aún no existe:
- mostrar formulario limpio
- no usar modales de error
- permitir guardado normal si la solicitud está en `DRAFT`

---

## 6. Manejo de `otherLiabilities`

Implementar una sección dinámica para múltiples líneas.

Cada fila debe permitir:
- descripción
- monto
- orden visual opcional

### Interacciones requeridas
- agregar fila
- editar fila
- eliminar fila de la UI
- reordenar si el frontend ya usa ese patrón; si no, basta con `sortOrder` por posición

### Regla crítica de sincronización
El backend sincroniza la colección completa en cada `PUT`.

Implicación frontend:
- siempre enviar la lista completa visible en pantalla
- si el usuario elimina una fila, simplemente quitarla del estado local y no enviarla
- las líneas nuevas van sin `id`
- las líneas existentes deben conservar `id`

---

## 7. Contrato de request a usar

### `PUT /api/loans/applications/{loanApplicationId}/financial-profile`

Enviar únicamente campos base y metadatos.

```json
{
  "analysisPeriodType": "monthly",
  "notes": "Cliente con actividad comercial estable.",
  "analysisComments": "Parte de los ingresos dependen del negocio familiar.",
  "cashAndBanks": 15000,
  "accountsReceivable": 5000,
  "inventoryValue": 12000,
  "housesAndLand": 250000,
  "vehicles": 85000,
  "householdGoods": 20000,
  "accountsPayableSuppliers": 8000,
  "loansPayable": 35000,
  "otherLiabilities": [
    {
      "description": "Prestamo familiar",
      "amount": 5000,
      "sortOrder": 1
    },
    {
      "description": "Compra de mercaderia pendiente",
      "amount": 2500,
      "sortOrder": 2
    }
  ],
  "businessIncome": 30000,
  "salaryIncome": 0,
  "spouseChildrenIncome": 4000,
  "remittancesIncome": 2000,
  "otherIncome": 1000,
  "businessCostOfSales": 12000,
  "foodExpense": 5000,
  "healthEducationExpense": 2000,
  "utilitiesExpense": 1800,
  "loanInstallmentExpense": 3500
}
```

### Regla crítica
No enviar como verdad:
- `totalAssets`
- `totalOtherLiabilities`
- `totalLiabilities`
- `equity`
- `totalLiabilitiesEquity`
- `totalIncome`
- `totalExpenses`
- `periodProfit`
- `debtRatio`
- `debtToEquityRatio`
- `isComplete`

Todos esos valores los recalcula el backend.

---

## 8. Contrato de response a reflejar en UI

El response de ficha financiera devuelve:
- metadatos
- valores base
- `otherLiabilities`
- totales calculados
- indicadores
- `isComplete`
- auditoría básica

Usar la respuesta del backend como fuente de verdad para:
- resúmenes
- totales
- indicadores
- bandera de completitud

Después de guardar exitosamente:
- reemplazar el estado local con la respuesta backend
- no recalcular manualmente la fuente principal en frontend

---

## 9. Validaciones frontend

Implementar validación amigable en cliente antes de enviar.

### Campos obligatorios
- `analysisPeriodType`

### Restricciones
- por ahora solo permitir `monthly`
- todos los montos deben ser `>= 0`
- `notes` máximo 2000
- `analysisComments` máximo 2000
- `otherLiabilities[].description` requerido, máximo 250
- `otherLiabilities[].amount >= 0`

### Recomendación técnica
Usar el patrón de validación vigente del frontend.  
Si el proyecto ya usa un esquema tipo Yup, reutilizarlo.

---

## 10. Arquitectura frontend esperada

Seguir la arquitectura ya usada en el proyecto frontend.

Reutilizar la separación actual por capas.  
Si el frontend usa una estructura tipo:
- `presentation`
- `core`
- `infrastructure`
- `router`

mantener esa convención.

### Recomendación de piezas a crear

## Presentation
- página o sección de ficha financiera dentro del detalle de solicitud
- componentes visuales por bloque
- tabla/lista dinámica de otros pasivos
- cards o paneles de resumen

## Core
- modelos de dominio o contracts internos
- acciones/casos de uso:
  - obtener ficha financiera
  - guardar ficha financiera
  - obtener estado resumido si realmente se usa

## Infrastructure
- DTOs request/response
- adapter o mapper si el proyecto ya lo usa
- llamada HTTP al backend

## Router
- no crear ruta aislada si el flujo ya vive dentro del detalle de solicitud
- integrarlo a la navegación existente

---

## 11. Componentes sugeridos

### Componente contenedor principal
`loan-application-financial-profile-section`

Responsabilidades:
- cargar ficha
- manejar estado de loading/saving
- decidir readonly/editable
- coordinar submit
- mostrar resumen backend

### Subcomponentes sugeridos
- `financial-profile-metadata-form`
- `financial-assets-form`
- `financial-liabilities-form`
- `financial-other-liabilities-table`
- `financial-income-form`
- `financial-expenses-form`
- `financial-summary-panel`
- `financial-indicators-panel`

No es obligatorio usar exactamente esos nombres, pero sí separar responsabilidades para no dejar un componente gigante.

---

## 12. Estado y estrategia de datos

El estado visual debe distinguir:

### Estado base editable
Campos que el usuario modifica:
- analysisPeriodType
- notes
- analysisComments
- activos
- pasivos
- otherLiabilities
- ingresos
- gastos

### Estado calculado proveniente de backend
- totalAssets
- totalOtherLiabilities
- totalLiabilities
- equity
- totalLiabilitiesEquity
- totalIncome
- totalExpenses
- periodProfit
- debtRatio
- debtToEquityRatio
- isComplete

Recomendación:
- mantener un estado para el formulario
- y otro para el snapshot devuelto por backend, o un solo estado bien normalizado con distinción clara entre base y calculado

---

## 13. Carga inicial sugerida

### Secuencia ideal
1. cargar detalle de solicitud
2. resolver permisos y estado `DRAFT`
3. cargar ficha financiera
4. mostrar formulario
5. mostrar resumen derivado backend

### Loading states
Implementar:
- loading inicial
- saving al enviar
- empty state si aún no existe ficha
- forbidden state si no hay permisos

---

## 14. Manejo de errores HTTP

Contemplar explícitamente:

### `400`
Mostrar errores de validación del request.  
Mapear Problem Details a mensajes de formulario o mensaje general.

### `403`
Mostrar que el usuario no tiene permisos para ver o guardar la ficha.

### `404`
Casos:
- solicitud inexistente
- ficha aún no creada

Para `GET .../financial-profile`, si el detalle de solicitud sí existe, interpretar `404` como ficha no creada y mostrar formulario vacío.  
Si la solicitud tampoco existe, manejar como error de pantalla.

### `409`
Mostrar mensaje claro:
- “La solicitud ya no está en borrador. No se puede modificar la ficha financiera.”

### `422`
Mostrar mensaje genérico de inconsistencia financiera interna devuelto por backend.

---

## 15. Integración con detalle y listado de solicitudes

El backend ya enriqueció los responses de solicitudes con:
- `hasFinancialProfile`
- `isFinancialProfileComplete`
- `financialProfileUpdatedAt`
- `financialDebtRatio`
- `financialDebtToEquityRatio`

Aprovechar eso en frontend para:

### En listado de solicitudes
- mostrar badge si la ficha existe
- mostrar badge o semáforo de completitud
- opcional mostrar ratios en tooltip, columna o panel lateral según diseño

### En detalle de solicitud
- checklist de expediente
- resumen rápido sin necesitar llamada extra
- fecha de última actualización
- acceso visual a la sección de ficha financiera

Evitar llamadas redundantes al endpoint `/status` si ya se tiene la data enriquecida en el response de solicitud.

---

## 16. Recomendaciones de UI para resumen e indicadores

Mostrar estos calculados en un panel claro:

### Resumen patrimonial
- Total activos
- Total otros pasivos
- Total pasivos
- Patrimonio
- Total pasivo + patrimonio

### Resumen financiero
- Total ingresos
- Total gastos
- Utilidad del periodo

### Indicadores
- Ratio pasivos / activos
- Ratio pasivos / patrimonio

Presentarlos con:
- formato numérico consistente
- `—` cuando el backend devuelva `null` en ratios
- etiquetas comprensibles para negocio

---

## 17. Permisos frontend

Si el frontend maneja guards o helpers de autorización:

### Lectura
usar permiso:
- `loan_applications.read`

### Edición / guardado
usar permiso:
- `loan_applications.update_draft`

Si el usuario no tiene permiso de edición pero sí de lectura:
- dejar vista solo lectura

Si no tiene permiso de lectura:
- ocultar sección o mostrar acceso denegado según patrón actual del proyecto

---

## 18. Criterios de implementación

La implementación se considera correcta si:

- la ficha financiera aparece dentro del flujo de solicitud, no como módulo aparte
- al abrir una solicitud existente se puede cargar la ficha si ya existe
- si la ficha no existe, el formulario se inicializa sin error técnico
- el formulario permite capturar activos, pasivos, ingresos y gastos
- se pueden administrar múltiples `otherLiabilities`
- los totales e indicadores se muestran solo lectura usando respuesta backend
- el guardado usa `PUT`
- el formulario queda bloqueado fuera de `DRAFT`
- se contemplan correctamente `400`, `403`, `404`, `409`, `422`
- el listado y detalle aprovechan `hasFinancialProfile` e `isFinancialProfileComplete`
- la implementación respeta la arquitectura vigente del frontend

---

## 19. Entregables esperados

Implementar y dejar listos:

1. integración visual dentro del flujo de solicitudes
2. formulario de ficha financiera
3. tabla/lista dinámica de otros pasivos
4. validación cliente
5. servicios / actions para `GET` y `PUT`
6. DTOs request/response
7. manejo de loading, empty, readonly y saving states
8. badges o indicadores de completitud en detalle/listado
9. render de totales e indicadores backend
10. manejo coherente de errores HTTP
11. actualización de documentación técnica del frontend si el proyecto la usa

---

## 20. Instrucción final para implementación

Antes de escribir código:
1. revisar cómo está construida actualmente la pantalla de detalle/edición de solicitud
2. reutilizar layout, guards, permisos, componentes y estilos ya existentes
3. insertar esta ficha como una sección del flujo actual
4. no inventar un módulo paralelo
5. tratar al backend ya construido como contrato fuente de verdad

La implementación debe verse y sentirse como parte nativa de PrestaNet, no como una pantalla pegada aparte.
