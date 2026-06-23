# Prompt frontend: recibos de pagos

Usa este documento como contrato único para implementar la visualizacion e impresion de recibos de pagos en PrestaNet. No asumas formato, reglas de habilitacion ni contenido fuera de este documento.

## Objetivo

Permitir que el frontend muestre y descargue el recibo imprimible de un pago ya registrado. El frontend no debe construir el PDF por su cuenta ni recomponer el contenido desde otras respuestas.

El backend expone un reporte jsreport dedicado:

```http
GET /api/reports/payments/{paymentId}/receipt
```

La respuesta es un PDF (`application/pdf`).

## Regla principal

Solo se puede imprimir un recibo cuando el pago ya es imprimible:

- `CASH_COLLECTION` en estado `REGISTERED` o `SETTLED`.
- `BANK_PROOF` en estado `EFFECTIVIZED`.

No mostrar boton de imprimir si el backend ya no considera imprimible el pago.

## Lo que el frontend debe hacer

1. Mostrar un boton de `Imprimir recibo` en el detalle del pago y, si aplica, en el listado.
2. Consultar la accion disponible del pago antes de mostrar el boton si ya usa `GET /api/payments/{id}/actions`.
3. Si el pago es imprimible, abrir o descargar el PDF desde `GET /api/reports/payments/{paymentId}/receipt`.
4. Si el backend responde conflicto, mostrar el mensaje tal como viene y no inventar estado alterno.

## Lo que el frontend no debe hacer

- No generar PDFs en frontend.
- No usar `jsreports` directamente desde el navegador.
- No calcular por su cuenta si un pago ya quedo listo para imprimir.
- No asumir que `internalReceiptNumber` existe para todo pago.
- No mostrar el boton de imprimir para `BANK_PROOF` mientras siga en `PENDING_REVIEW` o `REJECTED`.
- No mostrar el boton de imprimir para `CASH_COLLECTION` si el pago no esta `REGISTERED` o `SETTLED`.

## Estados relevantes

### `CASH_COLLECTION`

- `REGISTERED`: recibo imprimible disponible.
- `SETTLED`: recibo imprimible disponible.
- `REVERSED`: no imprimir.

### `BANK_PROOF`

- `PENDING_REVIEW`: no imprimir.
- `EFFECTIVIZED`: recibo imprimible disponible.
- `REJECTED`: no imprimir.
- `REVERSED`: no imprimir.

## Endpoint de recibo

```http
GET /api/reports/payments/{paymentId}/receipt
```

Respuesta:

- `200`: PDF del recibo.
- `404`: el pago no existe.
- `409`: el pago existe pero aun no tiene recibo imprimible.
- `502`: falla de jsreport o del motor de renderizado.

El frontend debe manejar la respuesta como archivo binario.

## Nombre del archivo

El backend ya devuelve un nombre de archivo PDF. El frontend puede respetarlo al descargar, pero no debe depender de ese valor para la logica de negocio.

## Contenido funcional del recibo

El reporte incluye, como minimo:

- identificador interno del recibo
- flujo operativo del pago
- tipo de pago
- estado del pago
- monto
- fecha operativa
- datos del prestamo
- datos del cliente
- referencias operativas
- distribucion del pago por cuota y componente

Si el pago es bancario, el recibo ademas puede mostrar:

- referencia bancaria reportada y verificada
- fecha de deposito reportada y verificada
- cuenta bancaria real usada en la conciliacion
- notas de revision
- usuario que aprobo/concilo

## Contrato visual recomendado

En la pantalla de detalle del pago:

- Mostrar un boton principal `Imprimir recibo`.
- Mostrar el boton solo cuando `statusCode` y `paymentFlowCode` permitan imprimir.
- Si el recibo es bancario, dejar claro que corresponde al comprobante aprobado, no al registro pendiente.
- Si el pago es efectivo, el recibo corresponde al cobro registrado por el cobrador.

## Datos que el frontend ya puede usar

Del detalle del pago (`GET /api/payments/{id}`) o del flujo especifico:

- `paymentFlowCode`
- `statusCode`
- `internalReceiptNumber`
- `paymentDate`
- `businessDate`
- `loanNo`
- `clientFullName`
- `collectionChannelName`
- `reportedBankReferenceNumber`
- `bankReferenceNumber`
- `reportedBankDepositDate`
- `bankDepositDate`
- `effectivizedByUserId`
- `effectivizationNotes`
- `allocations`

## Reglas por flujo

### Efectivo

- El recibo se puede imprimir desde que el pago queda registrado.
- Si el pago fue liquidado, el recibo sigue siendo imprimible.
- El recibo debe mostrar el canal y el cobrador cuando existan.

### Abono bancario

- El recibo no existe mientras el comprobante esta `PENDING_REVIEW`.
- El recibo se genera cuando el revisor aprueba/concilía el comprobante.
- El frontend debe mostrar la fecha verificada del deposito como la fecha efectiva del pago.
- Si el cliente deposito en fecha de vencimiento y el revisor revisa despues, el recibo sigue mostrando la fecha real del deposito, no la fecha tardia de revision.

## UX sugerida

En detalle de pago:

1. Mostrar resumen.
2. Mostrar boton `Imprimir recibo` solo si aplica.
3. Al hacer click, abrir el PDF en nueva pestaña o descargarlo.
4. Si el backend responde `409`, ocultar o deshabilitar el boton segun el estado refrescado.

## Errores a manejar

Usar `ProblemDetails.detail` o `ProblemDetails.title` si existen.

Casos frecuentes:

- El pago no existe.
- El pago existe pero aun no es imprimible.
- Falla temporal del motor de reportes.
- El usuario no tiene permiso para ver el detalle o imprimir el recibo.

## Integracion con permisos

El frontend debe respetar el permiso de lectura del modulo de pagos para ver el detalle y el permiso del flujo correspondiente para imprimir, si la UI separa por rol:

- efectivo: `cash_collections.payments.read`
- bancario: `bank_payment_proofs.read`

Si el backend expone un permiso especifico de reporte en el futuro, ese sera el unico lugar donde el frontend debera ajustar la visibilidad.

