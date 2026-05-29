# Prompt Frontend - Cuota Anticipada Pre-Desembolso - 2026-05-25

## Objetivo
Implementar en frontend el flujo de **cuota anticipada** para solicitudes de credito y prestamos desembolsados, de forma gradual y sin inventar contratos backend.

La cuota anticipada es un monto recibido o registrado antes del desembolso:
- se define en una solicitud antes de desembolsar
- al desembolsar, backend la contabiliza automaticamente contra una cuenta transitoria configurada
- una vez que el prestamo esta activo, puede aplicarse parcial o totalmente al cronograma
- cada aplicacion puede reversarse mediante el flujo formal backend

## Instruccion obligatoria para quien implemente
- Inspeccionar el stack, router, cliente HTTP, manejo de permisos, formularios, modales, tablas, formato monetario y patrones de cache existentes del repositorio frontend antes de agregar componentes.
- Mantener los patrones ya utilizados en frontend; no agregar dependencias si existe una solucion equivalente en el proyecto.
- Implementar solo las fases solicitadas en cada entrega. Cada fase debe quedar compilable y utilizable por separado.
- Consumir exclusivamente los endpoints documentados aqui. Si una interaccion futura requiere una ruta no enumerada, detener esa parte de la UI y reportar que falta contrato backend.
- No recalcular limites, saldos, distribuciones contables, aplicaciones a cuotas ni estados en cliente. Backend es la fuente de verdad.

## Alcance de UI
El modulo requiere tres areas, que pueden habilitarse progresivamente:

1. Detalle de solicitud de credito:
   - consultar cuota anticipada e historial
   - previsualizar limite permitido
   - crear o actualizar monto mientras corresponda
   - cancelar antes del desembolso

2. Detalle de prestamo:
   - mostrar cuota anticipada contabilizada, saldo aplicado y pendiente
   - aplicar saldo pendiente al cronograma
   - mostrar aplicaciones y distribuciones por cuota/componente
   - reversar una aplicacion existente

3. Administracion:
   - configurar reglas globales o por producto
   - consultar catalogos de estados y estrategias de limite
   - configurar la cuenta contable transitoria

## Contrato backend cerrado

### Endpoints de solicitud de credito
| Operacion | Metodo y ruta | Permiso requerido | Respuesta exitosa |
| --- | --- | --- | --- |
| Consultar cuota anticipada | `GET /api/loan-applications/{id}/anticipated-installment` | `loan_applications.anticipated_installment.read` | `AnticipatedInstallmentResponse` o `404` si no existe |
| Crear o actualizar cuota anticipada | `PUT /api/loan-applications/{id}/anticipated-installment` | `loan_applications.anticipated_installment.manage` | `AnticipatedInstallmentResponse` |
| Cancelar cuota anticipada | `POST /api/loan-applications/{id}/anticipated-installment/cancel` | `loan_applications.anticipated_installment.cancel` | `AnticipatedInstallmentResponse` |
| Consultar historial | `GET /api/loan-applications/{id}/anticipated-installment/history` | `loan_applications.anticipated_installment.read` | `AnticipatedInstallmentEventResponse[]` |
| Previsualizar limite | `POST /api/loan-applications/{id}/anticipated-installment/limit-preview` | `loan_applications.anticipated_installment.manage` | `AnticipatedInstallmentLimitPreviewResponse` |
| Consultar acciones existentes de la solicitud | `GET /api/loan-applications/{id}/actions` | contrato preexistente de solicitudes | `LoanApplicationAllowedActionsResponse` |

### Endpoints de prestamo desembolsado
| Operacion | Metodo y ruta | Permiso requerido | Respuesta exitosa |
| --- | --- | --- | --- |
| Consultar detalle consolidado | `GET /api/loans/{loanId}/anticipated-installment` | `loans.anticipated_installment.read` | `AnticipatedInstallmentLoanDetailResponse` o `404` |
| Aplicar cuota al cronograma | `POST /api/loans/{loanId}/anticipated-installment/apply` | `loans.anticipated_installment.apply` | `AnticipatedInstallmentApplicationResponse` |
| Consultar aplicaciones | `GET /api/loans/{loanId}/anticipated-installment/applications` | `loans.anticipated_installment.read` | `AnticipatedInstallmentApplicationResponse[]` |
| Reversar aplicacion | `POST /api/loans/{loanId}/anticipated-installment/applications/{applicationId}/reverse` | `loans.anticipated_installment.reverse` | `AnticipatedInstallmentApplicationResponse` |
| Consultar acciones existentes del prestamo | `GET /api/loans/{loanId}/actions` | contrato preexistente de prestamos | `LoanAllowedActionsResponse` |

### Endpoints administrativos
| Operacion | Metodo y ruta | Permiso requerido | Respuesta exitosa |
| --- | --- | --- | --- |
| Listar configuraciones | `GET /api/loans/anticipated-installment-settings` | `loans.anticipated_installment_settings.read` | `AnticipatedInstallmentSettingsResponse[]` |
| Crear configuracion | `POST /api/loans/anticipated-installment-settings` | `loans.anticipated_installment_settings.manage` | `AnticipatedInstallmentSettingsResponse` |
| Obtener configuracion | `GET /api/loans/anticipated-installment-settings/{id}` | `loans.anticipated_installment_settings.read` | `AnticipatedInstallmentSettingsResponse` |
| Actualizar configuracion | `PUT /api/loans/anticipated-installment-settings/{id}` | `loans.anticipated_installment_settings.manage` | `AnticipatedInstallmentSettingsResponse` |
| Desactivar configuracion | `PATCH /api/loans/anticipated-installment-settings/{id}/deactivate` | `loans.anticipated_installment_settings.manage` | `204 No Content` |
| Consultar estados | `GET /api/loans/catalogs/anticipated-installment-statuses` | `loans.anticipated_installment_settings.read` | `AnticipatedInstallmentCatalogItem[]` |
| Consultar estrategias de limite | `GET /api/loans/catalogs/anticipated-installment-limit-strategies` | `loans.anticipated_installment_settings.read` | `AnticipatedInstallmentCatalogItem[]` |
| Consultar cuenta transitoria | `GET /api/system/settings/anticipated-installment-transit-account` | `system.settings.anticipated_installment_transit_account.manage` | `AnticipatedInstallmentTransitAccountSettings` |
| Actualizar cuenta transitoria | `PUT /api/system/settings/anticipated-installment-transit-account` | `system.settings.anticipated_installment_transit_account.manage` | `AnticipatedInstallmentTransitAccountSettings` |

## Contratos JSON
Usar nombres de propiedades en `camelCase`. Los montos son numericos decimales y las fechas `DateOnly` llegan como `YYYY-MM-DD`.

### Tipos para solicitud y prestamo
```ts
export interface AnticipatedInstallmentResponse {
  id: string;
  loanApplicationId: string;
  statusCode: AnticipatedInstallmentStatusCode;
  statusName: string;
  originalAmount: number;
  currentAmount: number;
  appliedAmount: number;
  pendingAmount: number;
  maxAllowedAmountSnapshot: number | null;
  limitSource: string | null;
  limitStrategyCode: string | null;
  disbursementJournalEntryId: string | null;
  disbursementJournalEntryNumber: string | null;
  accountingRegisteredAt: string | null;
  accountingRegisteredBusinessDate: string | null;
  canModify: boolean;
  canCancel: boolean;
  createdBusinessDate: string;
  updatedBusinessDate: string | null;
  notes: string | null;
}

export type AnticipatedInstallmentStatusCode =
  | "PENDING"
  | "ACCOUNTED"
  | "PARTIALLY_APPLIED"
  | "FULLY_APPLIED"
  | "CANCELLED"
  | "REVERSED";

export interface UpsertAnticipatedInstallmentRequest {
  amount: number;
  reason?: string | null;
  notes?: string | null;
  idempotencyKey?: string | null;
}

export interface CancelAnticipatedInstallmentRequest {
  reason: string;
}

export interface AnticipatedInstallmentEventResponse {
  id: string;
  eventCode: string;
  previousAmount: number | null;
  newAmount: number | null;
  previousStatusCode: string | null;
  newStatusCode: string | null;
  reason: string | null;
  journalEntryId: string | null;
  businessDate: string;
  createdAt: string;
}

export interface AnticipatedInstallmentLimitPreviewRequest {
  amount: number | null;
}

export interface AnticipatedInstallmentLimitPreviewResponse {
  isAllowed: boolean;
  requestedAmount: number | null;
  maxAllowedAmount: number;
  limitSource: string;
  limitStrategyCode: string;
  message: string;
}

export interface ApplyAnticipatedInstallmentRequest {
  amount?: number | null;
  applyFullPending: boolean;
  reason?: string | null;
  idempotencyKey?: string | null;
}

export interface ReverseAnticipatedInstallmentApplicationRequest {
  reason: string;
}

export interface AnticipatedInstallmentApplicationAllocationResponse {
  loanInstallmentId: string;
  loanInstallmentComponentId: string;
  componentCode: string;
  installmentNo: number;
  allocationOrder: number;
  amount: number;
}

export interface AnticipatedInstallmentApplicationResponse {
  id: string;
  loanId: string;
  amount: number;
  applicationStatusCode: "APPLIED" | "REVERSED";
  businessDate: string;
  appliedAt: string;
  reason: string | null;
  journalEntryId: string | null;
  reversalJournalEntryId: string | null;
  allocations: AnticipatedInstallmentApplicationAllocationResponse[];
}

export interface AnticipatedInstallmentLoanDetailResponse {
  anticipatedInstallment: AnticipatedInstallmentResponse;
  history: AnticipatedInstallmentEventResponse[];
  applications: AnticipatedInstallmentApplicationResponse[];
}
```

### Acciones existentes que gobiernan visibilidad
```ts
export interface LoanApplicationAllowedActionsResponse {
  loanApplicationId: string;
  statusCode: string;
  allowedActions: string[];
}

export interface LoanAllowedActionsResponse {
  loanId: string;
  loanNumber: string;
  statusCode: string;
  allowedActions: string[];
}
```

Valores nuevos de `allowedActions`:

| Contexto | Accion | Uso frontend |
| --- | --- | --- |
| Solicitud | `view_anticipated_installment` | Mostrar bloque/tab y ejecutar `GET` de consulta/historial |
| Solicitud | `manage_anticipated_installment` | Habilitar crear/editar y `limit-preview` |
| Solicitud | `cancel_anticipated_installment` | Habilitar cancelacion con motivo |
| Prestamo | `view_anticipated_installment` | Mostrar bloque/tab de cuota contabilizada |
| Prestamo | `apply_anticipated_installment` | Habilitar modal de aplicacion |
| Prestamo | `reverse_anticipated_installment_application` | Habilitar reversa sobre aplicaciones no reversadas |

### Configuracion administrativa
```ts
export interface AnticipatedInstallmentSettingsResponse {
  id: string;
  loanProductId: string | null;
  isGlobal: boolean;
  isEnabled: boolean;
  maxAmount: number | null;
  maxPercentageOfApprovedAmount: number | null;
  limitStrategyCode: string;
  requiresAuthorizationAboveLimit: boolean;
  authorizationThresholdAmount: number | null;
  authorizationThresholdPercentage: number | null;
  autoApplyRemainingAnticipatedInstallmentOnClosure: boolean;
  blockClosureWhenAnticipatedInstallmentPending: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  isActive: boolean;
}

export interface UpsertAnticipatedInstallmentSettingsRequest {
  loanProductId: string | null;
  isGlobal: boolean;
  isEnabled: boolean;
  maxAmount: number | null;
  maxPercentageOfApprovedAmount: number | null;
  limitStrategyCode: string;
  requiresAuthorizationAboveLimit: boolean;
  authorizationThresholdAmount: number | null;
  authorizationThresholdPercentage: number | null;
  autoApplyRemainingAnticipatedInstallmentOnClosure: boolean;
  blockClosureWhenAnticipatedInstallmentPending: boolean;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  isActive: boolean;
}

export interface AnticipatedInstallmentCatalogItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface AnticipatedInstallmentTransitAccountSettings {
  anticipatedInstallmentTransitGlAccountId: string | null;
  anticipatedInstallmentTransitGlAccountCode: string | null;
  anticipatedInstallmentTransitGlAccountName: string | null;
  isConfigured: boolean;
  isValid: boolean;
  validationMessage: string | null;
}

export interface UpdateAnticipatedInstallmentTransitAccountRequest {
  anticipatedInstallmentTransitGlAccountId: string | null;
}
```

## Requests exactos

### Crear o modificar antes del desembolso
```http
PUT /api/loan-applications/{id}/anticipated-installment
Content-Type: application/json
```
```json
{
  "amount": 1500.00,
  "reason": "Cliente entrega cuota inicial antes del desembolso.",
  "notes": "Recibido en agencia.",
  "idempotencyKey": "frontend-generated-key"
}
```

Reglas de UI:
- Capturar un monto mayor que `0`.
- Antes de confirmar, consultar `limit-preview` con el monto actual.
- Si `isAllowed` es `false`, bloquear submit y mostrar `message`.
- Despues de guardar, mostrar los valores devueltos por backend, especialmente `maxAllowedAmountSnapshot`, `statusCode` y `pendingAmount`.
- Aunque el request acepta `idempotencyKey`, no asumir que permite recrear una cuota cancelada.

### Previsualizar limite
```http
POST /api/loan-applications/{id}/anticipated-installment/limit-preview
Content-Type: application/json
```
```json
{
  "amount": 1500.00
}
```

El frontend solo muestra `maxAllowedAmount`, `limitSource`, `limitStrategyCode` y `message`. No debe reproducir el calculo.

### Cancelar antes del desembolso
```http
POST /api/loan-applications/{id}/anticipated-installment/cancel
Content-Type: application/json
```
```json
{
  "reason": "Cliente solicita retirar el anticipo antes de desembolsar."
}
```

La cancelacion requiere confirmacion y motivo no vacio. Tras exito, el registro permanece visible con estado `CANCELLED`.

### Aplicar en un prestamo activo
Aplicar todo el saldo pendiente:
```http
POST /api/loans/{loanId}/anticipated-installment/apply
Content-Type: application/json
```
```json
{
  "amount": null,
  "applyFullPending": true,
  "reason": "Aplicacion completa solicitada por cliente.",
  "idempotencyKey": "frontend-generated-key"
}
```

Aplicar parcialmente:
```json
{
  "amount": 500.00,
  "applyFullPending": false,
  "reason": "Aplicacion parcial solicitada por cliente.",
  "idempotencyKey": "frontend-generated-key"
}
```

Reglas de UI:
- Solo abrir el modal si `allowedActions` contiene `apply_anticipated_installment`.
- Ofrecer seleccion excluyente: `Aplicar todo el saldo pendiente` o `Aplicar monto parcial`.
- Para aplicacion parcial, validar localmente formato y monto mayor que cero; backend valida saldos reales.
- Mostrar en la respuesta las asignaciones `allocations` ordenadas por `installmentNo` y `allocationOrder`.
- No permitir que el usuario elija manualmente cuotas o componentes: backend determina la distribucion.

### Reversar una aplicacion
```http
POST /api/loans/{loanId}/anticipated-installment/applications/{applicationId}/reverse
Content-Type: application/json
```
```json
{
  "reason": "Aplicacion registrada por error."
}
```

La UI debe solicitar confirmacion y motivo obligatorio. Una aplicacion reversada se conserva en historial con `applicationStatusCode: "REVERSED"` y puede incluir `reversalJournalEntryId`.

### Guardar regla administrativa
Crear:
```http
POST /api/loans/anticipated-installment-settings
Content-Type: application/json
```

Actualizar:
```http
PUT /api/loans/anticipated-installment-settings/{id}
Content-Type: application/json
```

```json
{
  "loanProductId": null,
  "isGlobal": true,
  "isEnabled": true,
  "maxAmount": 5000.00,
  "maxPercentageOfApprovedAmount": 10.00,
  "limitStrategyCode": "LOWEST_OF_AMOUNT_OR_PERCENTAGE",
  "requiresAuthorizationAboveLimit": false,
  "authorizationThresholdAmount": null,
  "authorizationThresholdPercentage": null,
  "autoApplyRemainingAnticipatedInstallmentOnClosure": true,
  "blockClosureWhenAnticipatedInstallmentPending": true,
  "effectiveFrom": "2026-05-25",
  "effectiveTo": null,
  "isActive": true
}
```

Reglas de UI:
- `limitStrategyCode` debe seleccionarse desde `GET /api/loans/catalogs/anticipated-installment-limit-strategies`; nunca capturarse como texto libre.
- `loanProductId: null` se usa para alcance global cuando `isGlobal: true`.
- Una regla por producto utiliza `loanProductId` y `isGlobal: false`.
- Mostrar errores de vigencia solapada entregados por backend; no intentar resolver superposiciones en cliente.

### Guardar cuenta contable transitoria
```http
PUT /api/system/settings/anticipated-installment-transit-account
Content-Type: application/json
```
```json
{
  "anticipatedInstallmentTransitGlAccountId": "guid"
}
```

La UI debe mostrar `isConfigured`, `isValid` y `validationMessage` retornados. Para seleccionar una cuenta, reutilizar el selector/consulta de plan de cuentas que ya exista en el frontend; este modulo no agrega un endpoint nuevo para buscar cuentas.

## Estados y eventos

### Estados de cuota anticipada
| Codigo | Significado de UI |
| --- | --- |
| `PENDING` | Registrada en solicitud y aun editable/cancelable si backend lo habilita |
| `ACCOUNTED` | Contabilizada al desembolsar, disponible para aplicacion |
| `PARTIALLY_APPLIED` | Tiene aplicaciones pero aun conserva saldo pendiente |
| `FULLY_APPLIED` | El saldo fue aplicado totalmente |
| `CANCELLED` | Cancelada antes del desembolso; solo lectura |
| `REVERSED` | La contabilizacion fue reversada por reversa de desembolso; solo lectura |

### Eventos actualmente emitidos por backend
Mostrar el historial sin construir eventos artificiales:
- `CREATED`
- `UPDATED`
- `CANCELLED`
- `ACCOUNTED_ON_DISBURSEMENT`
- `PARTIALLY_APPLIED`
- `FULLY_APPLIED`
- `APPLICATION_REVERSED`
- `DISBURSEMENT_REVERSED`

El frontend puede traducir etiquetas visuales, pero debe conservar `eventCode` como valor fuente.

## Permisos y reglas de visibilidad
Permisos de frontend que pueden llegar desde `GET /api/auth/me`:
- `loan_applications.anticipated_installment.read`
- `loan_applications.anticipated_installment.manage`
- `loan_applications.anticipated_installment.cancel`
- `loans.anticipated_installment.read`
- `loans.anticipated_installment.apply`
- `loans.anticipated_installment.reverse`
- `loans.anticipated_installment_settings.read`
- `loans.anticipated_installment_settings.manage`
- `system.settings.anticipated_installment_transit_account.manage`

Reglas obligatorias:
- Usar permisos para proteger rutas o menus globales.
- En el detalle de una solicitud o prestamo, usar tambien `allowedActions` para botones de operacion contextual.
- Ocultar o deshabilitar acciones que no esten presentes; no confiar solo en estado mostrado en pantalla.
- Si una accion visible recibe `403`, refrescar permisos/acciones y mostrar el error de autorizacion.

## Manejo de respuestas y errores
- `404` al consultar cuota anticipada de solicitud o prestamo significa que aun no existe registro; mostrar estado vacio, no error fatal de pantalla.
- `GET .../history` y `GET .../applications` pueden responder `[]`.
- Para `400`, `404` operativo o `409`, mostrar el `detail` del Problem Details retornado por backend.
- Un `409` puede indicar estado no compatible, configuracion inexistente, cuenta transitoria pendiente o una operacion duplicada.
- Despues de cada mutacion, invalidar/refrescar detalle de cuota anticipada, historial/aplicaciones y `actions` del contexto correspondiente.

Mensajes backend relevantes que no se deben reemplazar por logica del cliente:
- `No existe configuracion activa para cuota anticipada.`
- `Monto solicitado: L {monto}. Maximo permitido: L {maximo}.`
- `Despues del desembolso no se permite modificar la cuota anticipada; unicamente puede aplicarse o reversarse una aplicacion.`
- `Solo se puede aplicar cuota anticipada a prestamos activos.`
- `La cuota anticipada no tiene saldo disponible para aplicar.`
- `No se puede aplicar mas del saldo pendiente de la cuota anticipada.`
- `La aplicacion con la misma clave de idempotencia ya fue registrada.`
- `El motivo de cancelacion es requerido.`
- `El motivo de reversa es requerido.`

## No inventar endpoints ni comportamientos
Estas reglas son de cumplimiento obligatorio:

- No crear una llamada frontend para contabilizar la cuota al desembolso. El backend lo realiza dentro del flujo de desembolso existente `POST /api/loan-applications/{id}/disburse`.
- No asumir un endpoint de cierre/liquidacion que autoaplique saldo pendiente. Backend tiene la regla interna preparada, pero este contrato no publica una ruta nueva de cierre para frontend.
- No crear `DELETE` para cuota anticipada. La unica cancelacion expuesta es `POST /api/loan-applications/{id}/anticipated-installment/cancel`.
- No crear endpoint para aprobar excepciones por umbral; los campos de autorizacion existen en configuracion, pero no hay flujo HTTP de autorizaciones en este alcance.
- No crear endpoints CRUD de estados o estrategias. Ambos catalogos son de lectura mediante los dos `GET` documentados.
- No pedir al usuario una cuenta contable durante desembolso ni aplicacion. Se usa la cuenta transitoria de configuracion del sistema.
- No enviar seleccion manual de cuotas/componentes para aplicar; `allocations` es respuesta, no request.
- No asumir que una cuota `CANCELLED` puede reactivarse o recrearse desde la misma solicitud; el contrato actual solo garantiza lectura del registro cancelado.
- No navegar a un asiento contable desde `journalEntryId` salvo que el frontend ya tenga una ruta real y verificada para asientos.

## Implementacion gradual

### Fase 0 - Base tecnica y contratos
Objetivo: incorporar modelos y cliente API sin cambiar todavia el flujo operativo.

Implementar:
- tipos TypeScript equivalentes a los contratos de este documento
- funciones de cliente HTTP para cada endpoint que corresponda a las fases futuras
- constantes de permisos y `allowedActions`
- normalizacion del manejo `404` como ausencia de cuota para consultas de detalle

Validar:
- no hay URLs construidas fuera de la tabla de endpoints
- requests y responses usan `camelCase`
- tratamiento de Problem Details reutiliza el patron existente del frontend

### Fase 1 - Lectura en solicitud de credito
Objetivo: exponer informacion sin permitir operaciones monetarias.

Implementar:
- bloque o tab `Cuota anticipada` en detalle de solicitud
- consulta de `GET /api/loan-applications/{id}/actions`
- si existe `view_anticipated_installment`, consultar cuota e historial
- estado vacio cuando el `GET` de detalle responda `404`
- resumen de monto original, actual, aplicado, pendiente, estado, limite snapshot y notas
- linea de tiempo basada en los eventos del backend

No implementar aun:
- formulario de captura
- cancelacion
- acciones sobre prestamos

### Fase 2 - Captura, actualizacion y cancelacion en solicitud
Objetivo: completar el manejo pre-desembolso.

Implementar:
- formulario/modal visible solo con `manage_anticipated_installment`
- preview de limite antes de enviar `PUT`
- boton de edicion condicionado adicionalmente a `canModify`
- modal de cancelacion solo con `cancel_anticipated_installment` y `canCancel`
- generacion de `idempotencyKey` conforme al mecanismo ya utilizado por frontend, si existe; de lo contrario permitir `null` sin inventar persistencia cliente
- refresco de cuota, historial y acciones despues de guardar/cancelar

Criterios:
- en estados no editables, la vista permanece en solo lectura
- un monto rechazado por preview no se envia
- conflictos backend se presentan al usuario sin reinterpretarlos

### Fase 3 - Visualizacion posterior al desembolso
Objetivo: mostrar la transicion automatica a contabilizado.

Implementar:
- en detalle de prestamo, consultar `GET /api/loans/{loanId}/actions`
- si incluye `view_anticipated_installment`, cargar `GET /api/loans/{loanId}/anticipated-installment`
- mostrar estado, montos, fecha operativa de contabilizacion y numero de asiento si viene informado
- mostrar historial y aplicaciones entregadas en el detalle consolidado

Regla:
- el desembolso no llama ningun endpoint adicional de cuota anticipada desde frontend; tras un desembolso exitoso solo se refrescan datos.

### Fase 4 - Aplicacion y reversa en prestamo
Objetivo: operar saldo contabilizado sobre el cronograma.

Implementar:
- modal `Aplicar cuota anticipada` visible solo con `apply_anticipated_installment`
- opciones de aplicacion total o parcial usando exactamente los payloads documentados
- tabla expandible de aplicaciones con sus `allocations`
- accion `Reversar aplicacion` solo para registros `APPLIED` cuando `allowedActions` contiene `reverse_anticipated_installment_application`
- modal de reversa con motivo obligatorio
- refresco de detalle, aplicaciones y acciones despues de aplicar o reversar

No implementar:
- redistribucion manual
- edicion de aplicaciones
- eliminacion de eventos o asientos

### Fase 5 - Administracion de reglas y cuenta transitoria
Objetivo: permitir configuracion operativa solo a usuarios autorizados.

Implementar:
- pagina de configuraciones con listado, crear, editar y desactivar
- catalogo de estrategias consumido por dropdown
- opcionalmente catalogo de estados solo para etiquetas/leyenda administrativa
- pagina o seccion de cuenta transitoria con consulta y actualizacion
- señal visible cuando `isConfigured` o `isValid` sea `false`

Reglas:
- los catalogos no son editables desde este alcance
- para producto, reutilizar el selector real de productos que ya exista; no agregar una ruta inventada
- para cuenta contable, reutilizar integracion existente de plan de cuentas

### Fase 6 - Calidad y endurecimiento de UX
Objetivo: cubrir estados limite, permisos y consistencia despues de mutaciones.

Validar:
- carga, estado vacio, error y reintento en cada panel
- `403` tras cambio de permisos
- `404` sin cuota en solicitud y prestamo
- `409` al intentar operar en estado incompatible
- doble submit e idempotencia en aplicar/guardar
- formato HNL y fechas operativas
- invalidacion de caches tras guardar, cancelar, aplicar, reversar y desembolsar

## Casos de aceptacion funcional
1. Una solicitud sin cuota muestra estado vacio sin fallar cuando backend responde `404`.
2. Un usuario con `manage_anticipated_installment` puede consultar limite y guardar monto permitido.
3. Un usuario sin accion `manage_anticipated_installment` nunca ve el formulario operativo aunque conozca la ruta.
4. Una cuota pendiente puede cancelarse con motivo y queda visible como `CANCELLED`.
5. Al desembolsar una solicitud con cuota, el detalle del prestamo muestra el registro `ACCOUNTED` despues del refresco, sin llamada de contabilizacion desde UI.
6. Un prestamo activo con saldo pendiente permite aplicar todo o parte del monto solo si backend expone `apply_anticipated_installment`.
7. La UI muestra las asignaciones retornadas por backend y no permite editar su distribucion.
8. Una aplicacion `APPLIED` puede reversarse con motivo cuando la accion contextual existe y luego aparece como `REVERSED`.
9. Administracion usa catalogo real de estrategias y cuenta transitoria real; no mantiene valores hardcodeados.
10. Ninguna pantalla intenta llamar endpoints no enumerados en este documento.

## Resultado esperado
Entregar una integracion frontend incremental, con cada fase deployable independientemente, respetando permisos y acciones backend, y dejando al servidor como unica fuente de reglas financieras, limites, contabilidad y distribucion de pagos.
