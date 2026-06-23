# Prompt frontend: Pagos separados por flujo operativo

Usa este documento como contexto completo para implementar o refactorizar el frontend del modulo de pagos de PrestaNet. No asumas reglas fuera de este contrato. El backend ya separa claramente dos flujos: efectivo cobrado por cobradores y abonos bancarios registrados con comprobante/referencia.

Para la impresion de recibos usa ademas el documento especifico [payments_receipts_frontend_prompt_2026_06_21.md](./payments_receipts_frontend_prompt_2026_06_21.md).

## Objetivo funcional

Implementar una experiencia frontend con dos modulos separados:

1. **Pagos en efectivo de cobrador**
   - Ruta sugerida UI: `/cash-collections/payments`
   - Endpoint principal: `POST /api/cash-collections/payments`
   - Alias legacy durante desarrollo: `POST /api/payments`
   - Usa canal de recaudacion y asignacion activa del usuario autenticado.
   - Consume limite/exposicion de canal y usuario.
   - No requiere banco ni efectivizacion bancaria.
   - Se liquida por caja con `POST /api/cash-collections/payments/{id}/settle`.

2. **Abonos bancarios con comprobante**
   - Ruta sugerida UI: `/bank-payment-proofs`
   - Endpoint principal: `POST /api/bank-payment-proofs`
   - No usa canal de recaudacion.
   - No consume ni libera exposicion de canal o usuario.
   - Requiere referencia bancaria y fecha de deposito/transferencia.
   - Queda pendiente de revision; no genera recibo ni aplica al prestamo al registrarse.
   - Se aprueba/concilia contra banco con `POST /api/bank-payment-proofs/{id}/approve`.
   - Alias aceptado durante desarrollo: `POST /api/bank-payment-proofs/{id}/effectivize`.

## Conceptos obligatorios

`paymentFlowCode` controla las reglas operativas y contables. No uses `paymentTypeCode` para inferir si el pago consume canal o requiere banco.

Valores:

- `CASH_COLLECTION`: efectivo registrado por cobrador.
- `BANK_PROOF`: abono bancario registrado mediante comprobante o referencia.

`paymentTypeCode` solo identifica el medio especifico:

- Para `CASH_COLLECTION`, el backend fuerza o valida `CASH`.
- Para `BANK_PROOF`, valores permitidos:
  - `BANK_DEPOSIT_PROOF`
  - `BANK_TRANSFER_PROOF`
  - `MOBILE_PAYMENT_PROOF`

Combinaciones invalidas:

- `CASH_COLLECTION` con cualquier tipo distinto de `CASH`.
- `BANK_PROOF` con `CASH`.

## Permisos frontend

Usa los permisos efectivos de `GET /api/auth/me` para mostrar rutas, botones y acciones.

Pagos en efectivo:

- `cash_collections.payments.read`: listar/ver pagos en efectivo.
- `cash_collections.payments.register`: registrar pagos en efectivo.
- `cash_collections.payments.settle`: liquidar efectivo y liberar exposicion.
- `cash_collections.payments.reverse`: reversar pagos en efectivo.
- `collection_channels.operate`: requerido para registrar efectivo; el usuario debe estar asignado a un canal activo.

Abonos bancarios:

- `bank_payment_proofs.read`: listar/ver abonos bancarios.
- `bank_payment_proofs.register`: registrar comprobantes bancarios.
- `bank_payment_proofs.effectivize`: aprobar/conciliar abonos bancarios.
- `bank_payment_proofs.reject`: rechazar comprobantes bancarios pendientes.
- `bank_payment_proofs.reverse`: reversar abonos bancarios.

Configuracion:

- `system.settings.cash_collection_account.manage`: administrar cuenta contable de caja/cobrador.
- `system.settings.collection_transit_account.manage`: administrar cuenta transitoria bancaria.

Permisos compartidos:

- `payments.read`: lectura general de pagos si se usa el listado historico comun.
- `payments.component_priorities.read`
- `payments.component_priorities.manage`

## Estados

Estados relevantes por flujo:

`CASH_COLLECTION`:

- `REGISTERED`: efectivo registrado, cronograma aplicado, asiento creado y exposicion pendiente aumentada.
- `SETTLED`: efectivo liquidado por caja/responsable; exposicion liberada.
- `REVERSED`: pago reversado historicamente.

`BANK_PROOF`:

- `PENDING_REVIEW`: comprobante reportado por cobrador, sin recibo interno, sin aplicacion al cronograma y sin asientos contables.
- `EFFECTIVIZED`: comprobante aprobado/conciliado; se genera recibo interno, se aplica al cronograma y se contabiliza transitoria bancaria + banco.
- `REJECTED`: comprobante rechazado por revisor, sin impacto financiero.
- `REVERSED`: abono reversado historicamente.

No muestres accion de efectivizar para `CASH_COLLECTION`.

No muestres accion de liquidar para `BANK_PROOF`.

## Endpoints de consulta comunes

### Lookup de prestamos pagables

```http
GET /api/payments/lookup?clientIdentityNo={dni}
GET /api/payments/lookup?loanNo={loanNo}
```

Reglas:

- Envia solo uno: `clientIdentityNo` o `loanNo`.
- Si envias ambos, backend responde error de validacion.
- Si el cliente existe pero no tiene prestamos operables, puede devolver `loans: []`.
- El resultado incluye el saldo y la proxima cuota pagable.

Respuesta:

```json
{
  "client": {
    "id": "00000000-0000-0000-0000-000000000000",
    "fullName": "Nombre del cliente",
    "identityNo": "0801199012345"
  },
  "loans": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "loanNo": "PRE-2026-000001",
      "loanProductId": "00000000-0000-0000-0000-000000000002",
      "loanProductName": "Producto",
      "statusCode": "ACTIVE",
      "statusName": "Activo",
      "principal": 10000.00,
      "currencyCode": "HNL",
      "firstDueDate": "2026-05-15",
      "maturityDate": "2027-04-15",
      "totalOutstanding": 9250.00,
      "nextPayableInstallment": {
        "id": "00000000-0000-0000-0000-000000000003",
        "installmentNo": 3,
        "dueDateOriginal": "2026-07-15",
        "dueDateAdjusted": "2026-07-15",
        "totalProjected": 950.00,
        "totalPaid": 100.00,
        "outstandingAmount": 850.00,
        "statusCode": "PENDING",
        "statusName": "Pendiente",
        "components": [
          {
            "id": "00000000-0000-0000-0000-000000000004",
            "financialComponentId": "00000000-0000-0000-0000-000000000005",
            "financialComponentCode": "PRINCIPAL",
            "financialComponentName": "Capital",
            "amountProjected": 700.00,
            "amountPaid": 0.00,
            "outstandingAmount": 700.00
          }
        ]
      }
    }
  ]
}
```

### Detalle comun de pago

```http
GET /api/payments/{id}
```

Usalo para una pantalla de detalle comun si conviene. Para detalle especifico de abono bancario, usa `GET /api/bank-payment-proofs/{id}`, que devuelve `404` si el pago no es `BANK_PROOF`.

Campos importantes de respuesta:

```json
{
  "id": "00000000-0000-0000-0000-000000000010",
  "loanId": "00000000-0000-0000-0000-000000000001",
  "loanNo": "PRE-2026-000001",
  "clientId": "00000000-0000-0000-0000-000000000000",
  "clientFullName": "Nombre del cliente",
  "collectionChannelId": "00000000-0000-0000-0000-000000000020",
  "collectionChannelName": "Canal centro",
  "registeredByUserId": "00000000-0000-0000-0000-000000000030",
  "registeredByUserName": "usuario",
  "paymentDate": "2026-06-21",
  "businessDate": "2026-06-21",
  "paymentFlowCode": "CASH_COLLECTION",
  "paymentFlowName": "CASH_COLLECTION",
  "paymentTypeCode": "CASH",
  "paymentTypeName": "CASH",
  "amount": 1000.00,
  "currencyCode": "HNL",
  "referenceNumber": "REF-001",
  "externalReceiptNumber": "RECIBO-CLIENTE-001",
  "internalReceiptNumber": "REC-2026-000001",
  "statusCode": "REGISTERED",
  "statusName": "REGISTERED",
  "applicationStatusCode": "PARTIALLY_APPLIED",
  "journalEntryId": "00000000-0000-0000-0000-000000000040",
  "journalEntryNumber": "AST-2026-000001",
  "effectivizationJournalEntryId": null,
  "effectivizationJournalEntryNumber": null,
  "effectivizedByUserId": null,
  "reversalJournalEntryId": null,
  "effectivizationDate": null,
  "effectivizationBusinessDate": null,
  "bankGlAccountId": null,
  "bankGlAccountCode": null,
  "bankGlAccountName": null,
  "reportedBankReferenceNumber": null,
  "bankReferenceNumber": null,
  "reportedBankDepositDate": null,
  "bankDepositDate": null,
  "bankDepositProofUrl": null,
  "effectivizationNotes": null,
  "notes": "Observacion",
  "allocations": [
    {
      "id": "00000000-0000-0000-0000-000000000050",
      "installmentNo": 1,
      "componentCode": "PRINCIPAL",
      "componentName": "Capital",
      "amount": 700.00,
      "allocationOrder": 10
    }
  ]
}
```

Para `BANK_PROOF`, `collectionChannelId` y `collectionChannelName` vendran `null` o vacios. No los muestres como obligatorios.

## Modulo A: Pagos en efectivo

### Listar pagos en efectivo

```http
GET /api/cash-collections/payments?loanId=&clientId=&collectionChannelId=&registeredByUserId=&statusCode=&from=&to=&page=1&pageSize=25
```

Este endpoint ya filtra `paymentFlowCode = CASH_COLLECTION`.

### Registrar pago en efectivo

```http
POST /api/cash-collections/payments
```

Permisos requeridos:

- `cash_collections.payments.register`
- `collection_channels.operate`

Payload:

```json
{
  "loanId": "00000000-0000-0000-0000-000000000001",
  "amount": 1000.00,
  "referenceNumber": "REF-CAJA-001",
  "externalReceiptNumber": "RECIBO-FISICO-001",
  "notes": "Pago recibido por cobrador"
}
```

No enviar:

- `paymentFlowCode`
- `paymentTypeCode`
- `collectionChannelId`
- `collectionChannelUserId`
- `bankGlAccountId`
- `bankReferenceNumber`
- `bankDepositDate`

El backend:

- resuelve el canal activo del usuario autenticado.
- valida limite del usuario asignado.
- valida limite del canal.
- fija `paymentTypeCode = CASH`.
- fija `paymentFlowCode = CASH_COLLECTION`.
- fija `paymentDate = businessDate`.
- incrementa exposicion.
- aplica el pago al cronograma.
- contabiliza Dr caja de recaudacion / Cr componentes del prestamo.

Errores esperados:

- 400 si `amount <= 0`.
- 409 si el usuario no tiene canal activo.
- 409 si el canal esta inactivo.
- 409 si excede limite del usuario o canal.
- 400 si no esta configurada la cuenta de caja de recaudacion.

### Liquidar efectivo

```http
POST /api/cash-collections/payments/{id}/settle
```

Permiso requerido:

- `cash_collections.payments.settle`

Reglas:

- Solo aplica a `paymentFlowCode = CASH_COLLECTION`.
- Solo aplica si `statusCode = REGISTERED`.
- Cambia estado a `SETTLED`.
- Libera exposicion de canal y usuario.
- No usa banco.
- No crea asiento de efectivizacion bancaria.

### Reversar efectivo

```http
POST /api/cash-collections/payments/{id}/reverse
```

Permiso requerido:

- `cash_collections.payments.reverse`

Payload:

```json
{
  "reversalDate": "2026-06-21",
  "reason": "Pago registrado por error"
}
```

Reglas:

- `REGISTERED`: revierte cronograma, asiento de registro y libera exposicion.
- `SETTLED`: revierte cronograma y asiento de registro; no libera exposicion porque ya fue liberada al liquidar.
- No se borra el pago.
- Estado final: `REVERSED`.

## Modulo B: Abonos bancarios con comprobante

### Listar abonos bancarios

```http
GET /api/bank-payment-proofs?loanId=&clientId=&registeredByUserId=&statusCode=&paymentTypeCode=&from=&to=&page=1&pageSize=25
```

Este endpoint ya filtra `paymentFlowCode = BANK_PROOF`.

### Obtener detalle de abono bancario

```http
GET /api/bank-payment-proofs/{id}
```

Devuelve `404` si el id existe pero pertenece a `CASH_COLLECTION`.

### Registrar abono bancario

```http
POST /api/bank-payment-proofs
```

Permiso requerido:

- `bank_payment_proofs.register`

Payload:

```json
{
  "loanId": "00000000-0000-0000-0000-000000000001",
  "paymentTypeCode": "BANK_TRANSFER_PROOF",
  "amount": 1000.00,
  "bankReferenceNumber": "TRX-123456",
  "bankDepositDate": "2026-06-21",
  "bankGlAccountId": "00000000-0000-0000-0000-000000000090",
  "bankDepositProofUrl": "metadata-or-url-placeholder",
  "externalReceiptNumber": "COMPROBANTE-CLIENTE-001",
  "notes": "Transferencia enviada por cliente"
}
```

Campos:

- `loanId`: requerido.
- `paymentTypeCode`: requerido; no puede ser `CASH`.
- `amount`: requerido y mayor que cero.
- `bankReferenceNumber`: requerido, maximo 100 caracteres.
- `bankDepositDate`: requerido; no puede ser posterior a la fecha operativa.
- `bankGlAccountId`: opcional en registro; si se envia, backend valida que exista, este activa y sea imputable. Se guarda como metadata de cuenta destino sugerida.
- `bankDepositProofUrl`: opcional; metadata inicial del comprobante o adjunto. No hay storage formal en este contrato.
- `externalReceiptNumber`: opcional.
- `notes`: opcional.

No enviar:

- `paymentFlowCode`
- `collectionChannelId`
- `collectionChannelUserId`

El backend:

- fija `paymentFlowCode = BANK_PROOF`.
- fija `statusCode = PENDING_REVIEW`.
- fija `applicationStatusCode = PENDING_REVIEW`.
- guarda `reportedBankReferenceNumber` y `reportedBankDepositDate` con lo reportado por el cobrador.
- puede guardar `bankGlAccountId` como cuenta destino sugerida si se envia.
- no busca canal del usuario.
- no incrementa exposicion de canal.
- no incrementa exposicion de usuario.
- no aplica el pago al cronograma.
- no genera recibo interno.
- no genera asientos contables.

### Aprobar o conciliar abono bancario

```http
POST /api/bank-payment-proofs/{id}/approve
```

Alias compatible:

```http
POST /api/bank-payment-proofs/{id}/effectivize
```

Permiso requerido:

- `bank_payment_proofs.effectivize`

Payload:

```json
{
  "bankGlAccountId": "00000000-0000-0000-0000-000000000090",
  "effectivizationDate": "2026-06-21",
  "verifiedBankDepositDate": "2026-06-21",
  "verifiedBankReferenceNumber": "TRX-123456-CONCILIADA",
  "reviewNotes": "Conciliado contra estado de cuenta"
}
```

Campos:

- `bankGlAccountId`: requerido; cuenta bancaria real donde se confirmo el deposito/transferencia.
- `effectivizationDate`: requerido; fecha operativa de conciliacion/aprobacion. No puede ser futura.
- `verifiedBankDepositDate`: opcional recomendado; fecha real del deposito/transferencia validada por el revisor. Si se omite, el backend usa la fecha reportada por el cobrador. En UI conviene precargar la fecha reportada y permitir correccion.
- `verifiedBankReferenceNumber`: opcional; referencia bancaria corregida/confirmada por el revisor.
- `reviewNotes`: opcional; notas de revision.

Compatibilidad de nombres:

- El backend tambien acepta `bankDepositDate` como fallback de `verifiedBankDepositDate`.
- El backend tambien acepta `bankReferenceNumber` como fallback de `verifiedBankReferenceNumber`.
- El backend tambien acepta `notes` como fallback de `reviewNotes`.

Reglas:

- Solo aplica a `paymentFlowCode = BANK_PROOF`.
- Solo aplica si `statusCode = PENDING_REVIEW`.
- Requiere `bankGlAccountId`.
- `effectivizationDate` no puede ser posterior a la fecha operativa.
- `verifiedBankDepositDate` no puede ser posterior a la fecha operativa.
- El backend genera `internalReceiptNumber` en este momento, no en el registro del comprobante.
- Aplica el pago al cronograma usando `verifiedBankDepositDate` como fecha efectiva del pago.
- Si se genero mora despues de la fecha real de deposito, esa mora no debe cobrarse: el backend excluye/cancela mora no vencida a la fecha efectiva antes de asignar el pago.
- Crea `payment_allocations`.
- No toca exposicion de canal ni usuario.
- Contabiliza registro del pago con `eventDate = verifiedBankDepositDate` y `businessDate = fecha operativa`: Dr cuenta transitoria bancaria / Cr componentes del prestamo.
- Contabiliza conciliacion con `eventDate = verifiedBankDepositDate` y `businessDate = fecha operativa`: Dr banco / Cr transitoria bancaria.
- Estado final: `EFFECTIVIZED`.

### Rechazar comprobante bancario

```http
POST /api/bank-payment-proofs/{id}/reject
```

Permiso requerido:

- `bank_payment_proofs.reject`

Payload:

```json
{
  "reason": "No se encontro la transferencia en el estado de cuenta"
}
```

Reglas:

- Solo aplica a `paymentFlowCode = BANK_PROOF`.
- Solo aplica si `statusCode = PENDING_REVIEW`.
- Cambia el estado a `REJECTED`.
- Guarda el motivo en `effectivizationNotes`.
- No genera recibo interno.
- No toca cronograma ni `payment_allocations`.
- No crea asientos contables.
- No toca exposicion de canal ni usuario.

### Reversar abono bancario

```http
POST /api/bank-payment-proofs/{id}/reverse
```

Permiso requerido:

- `bank_payment_proofs.reverse`

Payload:

```json
{
  "reversalDate": "2026-06-21",
  "reason": "Comprobante rechazado por conciliacion"
}
```

Reglas:

- `EFFECTIVIZED`: revierte cronograma, asiento de efectivizacion y asiento de registro.
- `PENDING_REVIEW` y `REJECTED`: no se reversan; usa rechazo para un comprobante pendiente.
- Nunca modifica exposicion de canal/usuario.
- Estado final: `REVERSED`.

## Acciones disponibles

```http
GET /api/payments/{id}/actions
```

Respuesta:

```json
{
  "paymentId": "00000000-0000-0000-0000-000000000010",
  "statusCode": "PENDING_REVIEW",
  "allowedActions": [
    {
      "code": "effectivize",
      "label": "Aprobar",
      "enabled": true,
      "reason": null
    },
    {
      "code": "reject",
      "label": "Rechazar",
      "enabled": true,
      "reason": null
    },
    {
      "code": "reverse",
      "label": "Reversar",
      "enabled": false,
      "reason": "El estado del pago no permite reversa."
    }
  ]
}
```

Notas:

- El backend calcula acciones segun estado, flujo y permisos.
- Para efectivo, `effectivize` siempre debe venir deshabilitada.
- Para abono bancario, `effectivize` puede venir habilitada solo en `PENDING_REVIEW`; en UI mostrarla como aprobacion/conciliacion.
- Para abono bancario, `reject` puede venir habilitada solo en `PENDING_REVIEW`.
- Para abono bancario, `reverse` solo aplica despues de `EFFECTIVIZED`.
- Para efectivo liquidado `SETTLED`, `reverse` puede venir habilitada si el usuario tiene permiso.

## Recibos y fechas para abonos bancarios

- No muestres ni imprimas recibo interno para `BANK_PROOF` en `PENDING_REVIEW`; `internalReceiptNumber` sera `null`.
- El recibo se genera al aprobar el comprobante y el pago pasa a `EFFECTIVIZED`.
- Muestra separadas la fecha reportada por cobrador (`reportedBankDepositDate`) y la fecha verificada por revisor (`bankDepositDate` despues de aprobacion).
- Muestra separadas la referencia reportada (`reportedBankReferenceNumber`) y la referencia verificada (`bankReferenceNumber` despues de aprobacion).
- Para calculo de mora, el backend usa la fecha verificada del deposito (`verifiedBankDepositDate`/`bankDepositDate`), no la fecha en que el revisor aprobo.
- Para contabilidad, el backend usa la fecha operativa del dia de aprobacion como `businessDate` y la fecha verificada del deposito como `eventDate`.

## Configuracion contable

### Cuenta caja de recaudacion

```http
GET /api/system/settings/cash-collection-account
PUT /api/system/settings/cash-collection-account
```

Permiso:

- `system.settings.cash_collection_account.manage`

Payload `PUT`:

```json
{
  "cashCollectionGlAccountId": "00000000-0000-0000-0000-000000000100"
}
```

Respuesta:

```json
{
  "cashCollectionGlAccountId": "00000000-0000-0000-0000-000000000100",
  "cashCollectionGlAccountCode": "1.01.01.004",
  "cashCollectionGlAccountName": "Caja de recaudacion cobradores",
  "isConfigured": true,
  "isValid": true,
  "validationMessage": null
}
```

### Cuenta transitoria bancaria

```http
GET /api/system/settings/collection-transit-account
PUT /api/system/settings/collection-transit-account
```

Permiso:

- `system.settings.collection_transit_account.manage`

Payload `PUT`:

```json
{
  "collectionTransitGlAccountId": "00000000-0000-0000-0000-000000000101"
}
```

Esta cuenta es para `BANK_PROOF`, no para efectivo.

## Component priorities

El motor aplica pagos por cuota antigua y componentes segun prioridad configurada.

Endpoints:

```http
GET /api/payments/component-priorities
POST /api/payments/component-priorities
PUT /api/payments/component-priorities/{id}
PATCH /api/payments/component-priorities/{id}/deactivate
PUT /api/payments/component-priorities/reorder
```

Permisos:

- lectura: `payments.component_priorities.read`
- administracion: `payments.component_priorities.manage`

El frontend no debe calcular distribucion de pago manualmente. En efectivo, `allocations` aparecen despues de registrar; en abonos bancarios, aparecen despues de aprobar el comprobante.

## Reglas UI recomendadas

Separar pantallas:

- "Pagos en efectivo" para cobradores/caja.
- "Abonos bancarios" para comprobantes y conciliacion.

Formulario efectivo:

- Buscar prestamo por DNI o numero.
- Seleccionar prestamo.
- Capturar monto, referencia opcional, recibo externo opcional y notas.
- No mostrar campos de banco.
- Mostrar errores de limite de canal/usuario como conflictos operativos.

Formulario abono bancario:

- Buscar prestamo por DNI o numero.
- Seleccionar prestamo.
- Capturar monto.
- Capturar `paymentTypeCode` con opciones: deposito, transferencia, pago movil.
- Capturar referencia bancaria obligatoria.
- Capturar fecha de deposito/transferencia obligatoria.
- Capturar cuenta bancaria destino opcional si el UI ya tiene selector de cuentas contables/banco.
- Capturar metadata de comprobante opcional.
- No mostrar canal ni limite.

Listados:

- En efectivo, mostrar canal, cobrador, estado, monto, recibo interno, fecha operativa y exposicion implicita por estado.
- En abonos bancarios pendientes, mostrar referencia/fecha reportada, cobrador registrador, monto, estado y cuenta destino sugerida si existe; no mostrar recibo interno como disponible.
- En abonos bancarios aprobados, mostrar referencia/fecha verificada, revisor, cuenta bancaria confirmada, recibo interno, fecha de aprobacion y fecha efectiva del deposito.
- Mostrar boton "Imprimir recibo" solo cuando exista un recibo imprimible: `CASH_COLLECTION` en `REGISTERED/SETTLED` y `BANK_PROOF` en `EFFECTIVIZED`.

Botones:

- Para `CASH_COLLECTION/REGISTERED`: mostrar "Liquidar" y "Reversar" si permisos.
- Para `CASH_COLLECTION/SETTLED`: mostrar "Reversar" si permisos.
- Para `BANK_PROOF/PENDING_REVIEW`: mostrar "Aprobar" y "Rechazar" si permisos.
- Para `BANK_PROOF/EFFECTIVIZED`: mostrar "Reversar" si permisos.
- Para `BANK_PROOF/REJECTED`: no mostrar acciones de aprobacion/rechazo/reversa.
- Para `REVERSED`: no mostrar acciones destructivas.

## Errores a manejar

Usar mensajes de `ProblemDetails.detail` o `ProblemDetails.title` si existen.

Casos frecuentes:

- Usuario sin canal activo al registrar efectivo.
- Canal inactivo.
- Limite de usuario/canal excedido.
- Cuenta caja no configurada para efectivo.
- Cuenta transitoria no configurada para abonos bancarios.
- Cuenta banco invalida/inactiva/no imputable.
- Fecha reportada, fecha verificada o fecha de aprobacion posterior a fecha operativa.
- Monto excede saldo pendiente del prestamo.
- Intentar efectivizar un efectivo.
- Intentar liquidar un abono bancario.
- Intentar aprobar o rechazar un comprobante que no esta en `PENDING_REVIEW`.

## Invariantes que el frontend debe respetar

- Nunca enviar `paymentFlowCode`; el backend lo define segun endpoint.
- Nunca enviar `collectionChannelId` en registro de efectivo; el backend resuelve la asignacion del usuario.
- Nunca enviar campos de banco para efectivo.
- Nunca llamar `effectivize` para `CASH_COLLECTION`.
- Nunca llamar `settle` para `BANK_PROOF`.
- Nunca asumir que `collectionChannelId` existe en un pago; para `BANK_PROOF` sera null.
- No recalcular `allocations`; leerlas desde respuesta.
- No imprimir recibo de `BANK_PROOF` hasta que el estado sea `EFFECTIVIZED` y exista `internalReceiptNumber`.
- No actualizar exposicion en frontend como fuente de verdad; recargar datos del canal si la UI muestra saldos.

## Endpoints legacy/comunes

Estos endpoints existen y pueden usarse en pantallas historicas o administrativas:

```http
GET /api/payments
GET /api/payments/{id}
POST /api/payments
POST /api/payments/{id}/effectivize
POST /api/payments/{id}/reverse
POST /api/bank-payment-proofs/{id}/approve
POST /api/bank-payment-proofs/{id}/reject
GET /api/reports/payments/{paymentId}/receipt
GET /api/payments/{id}/actions
GET /api/payments/{id}/reversal
```

Recomendacion:

- Para nuevas pantallas usa endpoints especificos por flujo.
- `POST /api/payments` debe tratarse como alias de efectivo, no como endpoint generico de cualquier pago.
- `POST /api/payments/{id}/effectivize` internamente rechaza pagos que no sean `BANK_PROOF`, pero el frontend debe preferir `/api/bank-payment-proofs/{id}/approve`.
- `GET /api/reports/payments/{paymentId}/receipt` es el endpoint de impresion de recibo; el frontend no debe construir PDFs por su cuenta.
