# Frontend Prompt - Reversa de Pagos 2026-06-22

## Objetivo

Implementar en frontend el flujo de reversa para pagos operativos de prestamos sin recalcular logica financiera localmente.

El backend ya resuelve:

- validacion de permisos
- validacion de estado del pago
- reversa de aplicaciones sobre cuotas/componentes
- reversa contable
- liberacion de exposicion cuando corresponde
- recalculo inmediato del estado del prestamo

Frontend solo debe:

- mostrar la accion cuando el backend la habilite
- pedir confirmacion con motivo
- enviar el request correcto
- recargar detalle de pago, reversa y prestamo relacionado

---

## Endpoints a usar

### Resolver acciones disponibles

```http
GET /api/payments/{id}/actions
```

Permiso base:

- `payments.read`

Respuesta:

```json
{
  "paymentId": "00000000-0000-0000-0000-000000000010",
  "statusCode": "REGISTERED",
  "allowedActions": [
    {
      "code": "effectivize",
      "label": "Efectivizar",
      "enabled": false,
      "reason": "Solo los abonos bancarios pueden efectivizarse."
    },
    {
      "code": "reject",
      "label": "Rechazar",
      "enabled": false,
      "reason": "Solo los comprobantes bancarios pueden rechazarse."
    },
    {
      "code": "reverse",
      "label": "Reversar",
      "enabled": true,
      "reason": null
    }
  ]
}
```

Regla UI:

- El boton `Reversar` debe depender de `allowedActions`.
- Si `reverse.enabled = false`, ocultar o deshabilitar el boton usando `reason` como tooltip o texto auxiliar.
- Si `reverse.enabled = false` porque existe un pago posterior activo del mismo préstamo, mostrar ese motivo sin intentar construir lógica local de orden.

### Ejecutar reversa comun

```http
POST /api/payments/{id}/reverse
```

El backend resuelve internamente si el pago pertenece a:

- `CASH_COLLECTION`
- `BANK_PROOF`

Tambien existen endpoints especificos por flujo:

```http
POST /api/cash-collections/payments/{id}/reverse
POST /api/bank-payment-proofs/{id}/reverse
```

Para una pantalla unificada de pagos se recomienda usar:

```http
POST /api/payments/{id}/reverse
```

Payload:

```json
{
  "reversalDate": "2026-06-22",
  "reason": "Pago registrado por error"
}
```

Reglas de entrada que frontend debe respetar:

- `reversalDate` debe enviarse igual a la `businessDate` vigente del sistema.
- `reversalDate` no debe ser editable por el usuario en el flujo estándar.
- Si frontend omite `reversalDate`, el backend usa igualmente la `businessDate`.
- `reason` es requerido.
- `reason` no debe enviarse vacio o con solo espacios.

Recomendacion UI:

- mostrar la fecha operativa como dato informativo o campo solo lectura
- no ofrecer selector de fecha para reversa en el flujo estándar

### Consultar reversa registrada

```http
GET /api/payments/{id}/reversal
```

Uso recomendado:

- despues de una reversa exitosa
- en detalle historico de un pago `REVERSED`
- al abrir drawer/modal de auditoria

---

## Respuesta de reversa

Contrato:

```json
{
  "paymentId": "00000000-0000-0000-0000-000000000010",
  "reversalId": "00000000-0000-0000-0000-000000000099",
  "originalStatusCode": "REGISTERED",
  "statusCode": "REVERSED",
  "amount": 1250.00,
  "reversalDate": "2026-06-22",
  "businessDate": "2026-06-22",
  "reason": "Pago registrado por error",
  "registrationReversalJournalEntryId": "00000000-0000-0000-0000-000000000201",
  "registrationReversalJournalEntryNumber": "REV-202606-000021",
  "effectivizationReversalJournalEntryId": null,
  "effectivizationReversalJournalEntryNumber": null,
  "channelOutstandingAmount": 3500.00,
  "userOutstandingAmount": 850.00
}
```

Campos clave para UI:

- `originalStatusCode`: indica desde que estado se reverso.
- `statusCode`: debe quedar `REVERSED`.
- `reason`: mostrarlo siempre en auditoria.
- `registrationReversalJournalEntryNumber`: referencia contable principal.
- `effectivizationReversalJournalEntryNumber`: solo aplica cuando el pago ya habia sido efectivizado.
- `channelOutstandingAmount` y `userOutstandingAmount`: utiles si la pantalla muestra exposicion de recaudacion.

---

## Reglas de negocio por flujo

### Efectivo

Estados reversables:

- `REGISTERED`
- `SETTLED`

Comportamiento:

- Si estaba `REGISTERED`, el backend revierte cronograma, asiento de registro y libera exposicion.
- Si estaba `SETTLED`, el backend revierte cronograma y asiento de registro; no libera exposicion porque ya fue liberada en la liquidacion.
- Solo puede reversarse si no existen pagos posteriores activos del mismo préstamo.

### Abono bancario

Estados reversables:

- `REGISTERED`
- `EFFECTIVIZED`

Comportamiento:

- Si estaba `REGISTERED`, revierte el asiento de registro y las aplicaciones del pago.
- Si estaba `EFFECTIVIZED`, revierte las aplicaciones, el asiento de registro y tambien el asiento de efectivizacion.
- Nunca toca exposicion de canal/usuario.
- Solo puede reversarse si no existen pagos posteriores activos del mismo préstamo.

Estados no reversables:

- `PENDING_REVIEW`
- `REJECTED`
- `REVERSED`
- `CANCELLED`

Para `PENDING_REVIEW` se debe usar rechazo, no reversa.

## Regla de orden de reversa

La reversa operativa ahora sigue una regla de orden estricto por préstamo:

- no se puede reversar un pago si existe otro pago posterior activo del mismo préstamo
- primero deben reversarse los pagos más recientes
- el backend no reaplica ni redistribuye automáticamente pagos posteriores
- si dos pagos del mismo préstamo comparten la misma `paymentDate`, el backend resuelve el orden por `createdAt`; si aun así empatan, usa `id` como desempate determinístico

Ejemplo:

1. pago A el 2026-06-05
2. pago B el 2026-06-06 sobre el mismo préstamo
3. si B sigue activo, A no puede reversarse todavía

Ejemplo mismo día:

1. pago A el 2026-06-05 a las 09:10
2. pago B el 2026-06-05 a las 09:25
3. si B sigue activo, A no puede reversarse todavía

Mensajes esperados:

- en `GET /api/payments/{id}/actions`, `reverse` debe venir deshabilitado con motivo
- en `POST /api/payments/{id}/reverse`, el backend responde conflicto si se intenta saltar el orden

---

## Impacto en el prestamo

Este punto es importante para frontend:

- al registrar un pago, el backend puede cambiar inmediatamente el estado del prestamo
- al reversar un pago, el backend tambien puede cambiar inmediatamente el estado del prestamo

Ejemplos:

- `DELINQUENT -> ACTIVE` si el pago deja el prestamo al dia
- `ACTIVE -> DELINQUENT` si una reversa vuelve a dejar cuotas vencidas con saldo
- `ACTIVE/DELINQUENT/MATURED -> CLOSED` si el saldo queda en cero

Por lo tanto, despues de una reversa exitosa, frontend debe refrescar:

1. detalle del pago
2. detalle o listado del prestamo relacionado
3. cuotas del prestamo si estan visibles
4. acciones disponibles del pago

No asumir que solo cambia el estado del pago.

---

## Secuencia recomendada en frontend

### Desde listado o detalle de pagos

1. Cargar `GET /api/payments/{id}/actions`.
2. Si `reverse.enabled = true`, mostrar boton `Reversar`.
3. Al hacer click, abrir modal de confirmacion.
4. En el modal pedir:
   - motivo obligatorio
   - mostrar `businessDate` como fecha operativa de reversa en modo solo lectura
5. Enviar `POST /api/payments/{id}/reverse`.
6. Si responde `200`, mostrar mensaje de exito.
7. Recargar:
   - `GET /api/payments/{id}`
   - `GET /api/payments/{id}/reversal`
   - vista del prestamo asociado si esta montada
   - listado actual si el usuario sigue en tabla

### Modal sugerido

Campos:

- `reason`

Dato informativo:

- `businessDate` o `reversalDate` solo lectura, igual a la fecha operativa del sistema

Texto de confirmacion sugerido:

`Esta accion reversara las aplicaciones del pago y su impacto contable. El pago quedara en estado REVERSED y no sera eliminado.`

Si `paymentFlowCode = BANK_PROOF` y `statusCode = EFFECTIVIZED`, agregar nota:

`Tambien se reversara el asiento de efectivizacion bancaria.`

---

## Errores esperados

Mostrar `ProblemDetails.detail` o `ProblemDetails.title`.

Casos frecuentes:

- `403` si el usuario no tiene permiso para reversar ese flujo.
- `404` si el pago no existe o no esta en su alcance.
- `409` si el estado del pago no permite reversa.
- `409` si el pago ya tiene una reversa activa.
- `409` si existe un pago posterior activo del mismo préstamo.
- `400` si falta `reason`.
- `400` si frontend intenta enviar una `reversalDate` distinta a la fecha operativa.

Mensajes reales del backend que pueden llegar:

- `Solo se pueden reversar pagos registrados, pagos en efectivo liquidados o abonos bancarios efectivizados.`
- `El pago ya tiene una reversa activa.`
- `No se puede reversar este pago porque existe un pago posterior activo del mismo préstamo. Revierta primero los pagos más recientes.`
- `La fecha de reversa debe coincidir con la fecha operativa del sistema.`

---

## Reglas de render

En tarjeta o detalle del pago reversado mostrar:

- badge `REVERSED`
- fecha de reversa
- motivo
- numero de asiento de reversa de registro
- numero de asiento de reversa de efectivizacion si existe

Si se muestra timeline o auditoria, incluir evento:

- `PAYMENT_REVERSED`

Si existe impresion de recibos:

- no reemplazar el recibo historico existente
- marcar visualmente que el pago fue reversado

---

## Tipos sugeridos para frontend

```ts
export interface ReversePaymentRequest {
  reversalDate: string;
  reason: string;
}

export interface PaymentAction {
  code: "effectivize" | "reject" | "reverse";
  label: string;
  enabled: boolean;
  reason: string | null;
}

export interface PaymentActionsResponse {
  paymentId: string;
  statusCode: string;
  allowedActions: PaymentAction[];
}

export interface PaymentReversalResponse {
  paymentId: string;
  reversalId: string;
  originalStatusCode: string;
  statusCode: string;
  amount: number;
  reversalDate: string;
  businessDate: string;
  reason: string;
  registrationReversalJournalEntryId: string | null;
  registrationReversalJournalEntryNumber: string | null;
  effectivizationReversalJournalEntryId: string | null;
  effectivizationReversalJournalEntryNumber: string | null;
  channelOutstandingAmount: number;
  userOutstandingAmount: number;
}
```

---

## Recomendacion final

Si ya existe una pantalla de detalle de pago, no crear un modulo separado. Agregar:

- boton `Reversar`
- modal de confirmacion
- bloque `Datos de reversa` cuando el pago quede `REVERSED`

La fecha de reversa debe mostrarse como la fecha operativa del sistema y no como un campo editable.

Si no existe detalle de pago, crear al menos:

- tabla de pagos
- drawer o modal de detalle
- modal de reversa
- consulta posterior a `/api/payments/{id}/reversal`
