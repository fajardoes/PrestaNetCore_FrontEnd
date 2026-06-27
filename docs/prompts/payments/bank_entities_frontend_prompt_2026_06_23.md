# Prompt frontend: Entidades bancarias para abonos bancarios

Usa este documento como contexto puntual para ajustar el frontend del flujo de abonos bancarios (`BANK_PROOF`) en PrestaNet. Este prompt cubre exclusivamente la incorporación del catálogo de entidades bancarias y el cambio de contrato para registro y aprobación de comprobantes bancarios.

No asumas reglas fuera de este contrato.

## Objetivo

Eliminar la selección directa de cuenta contable bancaria desde UI y reemplazarla por una selección de entidad bancaria administrable.

El backend ahora:

- permite administrar entidades bancarias en un catálogo separado;
- permite que el usuario que registra un comprobante sugiera la entidad bancaria;
- obliga al aprobador/revisor a confirmar la entidad bancaria al aprobar;
- resuelve automáticamente la cuenta contable bancaria desde la entidad bancaria seleccionada.

## Concepto funcional

Una entidad bancaria representa un banco visible para operación, ligado internamente a una sola cuenta contable bancaria.

Ejemplo:

- `BAC`
- `Banco Atlántida`
- `Ficohsa`

Cada entidad bancaria tiene:

- `id`
- `code`
- `name`
- `description`
- `isActive`
- `bankGlAccountId`
- `bankGlAccountCode`
- `bankGlAccountName`

El frontend nunca debe pedir al usuario operativo que seleccione `bankGlAccountId` para registrar o aprobar un abono bancario. Esa cuenta se resuelve en backend.

## Permisos

Para catálogo de entidades bancarias:

- `bank_entities.read`
- `bank_entities.manage`

Para flujo de abonos bancarios:

- `bank_payment_proofs.read`
- `bank_payment_proofs.read_all`
- `bank_payment_proofs.register`
- `bank_payment_proofs.effectivize`
- `bank_payment_proofs.reject`
- `bank_payment_proofs.reverse`
- `bank_payment_proofs.manage_all`

## Endpoints nuevos del catálogo

### Listar entidades bancarias

```http
GET /api/bank-payment-proofs/catalogs/bank-entities?search={text}&isActive={true|false}
```

Permiso:

- `bank_entities.read`

Respuesta esperada:

```json
[
  {
    "id": "00000000-0000-0000-0000-000000000050",
    "code": "BAC",
    "name": "BAC Credomatic",
    "description": "Cuenta recaudadora BAC",
    "isActive": true,
    "bankGlAccountId": "00000000-0000-0000-0000-000000000090",
    "bankGlAccountCode": "1.01.02.001",
    "bankGlAccountName": "Banco BAC recaudación"
  }
]
```

Uso UI:

- poblar el selector de banco en registro de comprobante;
- poblar el selector de banco en aprobación;
- mostrar nombre del banco en detalles y listados.

### Obtener una entidad bancaria por id

```http
GET /api/bank-payment-proofs/catalogs/bank-entities/{id}
```

Permiso:

- `bank_entities.read`

### Crear entidad bancaria

```http
POST /api/bank-payment-proofs/catalogs/bank-entities
```

Permiso:

- `bank_entities.manage`

Payload:

```json
{
  "code": "BAC",
  "name": "BAC Credomatic",
  "description": "Cuenta recaudadora BAC",
  "bankGlAccountId": "00000000-0000-0000-0000-000000000090"
}
```

### Actualizar entidad bancaria

```http
PUT /api/bank-payment-proofs/catalogs/bank-entities/{id}
```

Permiso:

- `bank_entities.manage`

Payload:

```json
{
  "code": "BAC",
  "name": "BAC Credomatic",
  "description": "Cuenta principal BAC",
  "bankGlAccountId": "00000000-0000-0000-0000-000000000090",
  "isActive": true
}
```

### Activar o desactivar entidad bancaria

```http
PATCH /api/bank-payment-proofs/catalogs/bank-entities/{id}/status
```

Permiso:

- `bank_entities.manage`

Payload:

```json
{
  "isActive": false
}
```

## Cambio en registro de comprobante bancario

### Endpoint

```http
POST /api/bank-payment-proofs
```

### Cambio importante

Ya no se envía `paymentTypeCode`.

Ya no se envía `bankGlAccountId`.

Ahora se puede enviar `bankEntityId` como sugerencia del banco reportado por el usuario que registra.

### Payload actualizado

```json
{
  "loanId": "00000000-0000-0000-0000-000000000001",
  "bankEntityId": "00000000-0000-0000-0000-000000000050",
  "amount": 1000.00,
  "bankReferenceNumber": "TRX-123456",
  "bankDepositDate": "2026-06-23",
  "bankDepositProofUrl": "metadata-or-url-placeholder",
  "externalReceiptNumber": "COMPROBANTE-CLIENTE-001",
  "notes": "Depósito reportado por cliente"
}
```

### Reglas UI

- `bankEntityId` debe mostrarse como selector opcional.
- Si el usuario conoce el banco destino, debe seleccionarlo.
- Si no lo conoce con certeza, la UI puede permitir dejarlo vacío si negocio lo aprueba.
- No mostrar cuentas contables al capturista.
- No mostrar `paymentTypeCode`.

### Qué guarda backend

El backend:

- fija `paymentFlowCode = BANK_PROOF`;
- fija `paymentTypeCode = BANK_DEPOSIT_PROOF`;
- fija `statusCode = PENDING_REVIEW`;
- fija `applicationStatusCode = PENDING_REVIEW`;
- guarda `reportedBankEntityId` si se envió;
- guarda referencia y fecha reportadas;
- no genera asientos;
- no aplica cronograma;
- no genera recibo interno.

## Cambio en aprobación / efectivización

### Endpoint principal

```http
POST /api/bank-payment-proofs/{id}/approve
```

Alias compatible:

```http
POST /api/bank-payment-proofs/{id}/effectivize
```

### Cambio importante

Ya no se envía `bankGlAccountId`.

Ahora se debe enviar `bankEntityId`.

### Payload actualizado

```json
{
  "bankEntityId": "00000000-0000-0000-0000-000000000050",
  "effectivizationDate": "2026-06-23",
  "verifiedBankDepositDate": "2026-06-23",
  "verifiedBankReferenceNumber": "TRX-123456-CONCILIADA",
  "reviewNotes": "Conciliado contra estado de cuenta"
}
```

### Reglas UI

- `bankEntityId` es obligatorio.
- Precargar por defecto la entidad bancaria sugerida en registro (`reportedBankEntityId`) si existe.
- Permitir que el aprobador cambie la entidad bancaria antes de confirmar.
- No mostrar ni pedir `bankGlAccountId`.
- Mostrar claramente:
  - banco reportado;
  - banco confirmado;
  - referencia reportada;
  - referencia verificada;
  - fecha reportada;
  - fecha verificada.

### Qué hace backend al aprobar

El backend:

- valida que la entidad bancaria exista y esté activa;
- resuelve la cuenta contable bancaria asociada a esa entidad;
- guarda `approvedBankEntityId`;
- guarda `bankGlAccountId` como snapshot histórico de la cuenta realmente usada;
- aplica el pago al cronograma;
- genera recibo interno;
- contabiliza:
  - Dr cuenta transitoria de recaudo / Cr componentes del préstamo;
  - Dr banco / Cr cuenta transitoria de recaudo.

## Ajustes requeridos en pantallas

### Pantalla de registro de abono bancario

Debe cambiar así:

- quitar selector de tipo de abono;
- quitar selector de cuenta contable bancaria;
- agregar selector de entidad bancaria;
- mantener referencia bancaria, fecha de depósito, monto, comprobante y notas.

### Pantalla de aprobación de abono bancario

Debe cambiar así:

- quitar selector de cuenta contable bancaria;
- agregar selector obligatorio de entidad bancaria;
- si existe `reportedBankEntityId`, mostrarlo preseleccionado;
- permitir corrección por parte del aprobador;
- mostrar el banco confirmado antes de enviar.

### Pantalla de detalle/listado

Mostrar, cuando existan:

- `reportedBankEntityName`
- `approvedBankEntityName`
- `bankGlAccountCode`
- `bankGlAccountName`

## Ajustes de modelos frontend

### Modelo sugerido para registro

```ts
type RegisterBankPaymentProofRequest = {
  loanId: string;
  bankEntityId?: string | null;
  amount: number;
  bankReferenceNumber: string;
  bankDepositDate: string;
  bankDepositProofUrl?: string | null;
  externalReceiptNumber?: string | null;
  notes?: string | null;
};
```

### Modelo sugerido para aprobación

```ts
type ApproveBankPaymentProofRequest = {
  bankEntityId: string;
  effectivizationDate: string;
  verifiedBankDepositDate?: string | null;
  verifiedBankReferenceNumber?: string | null;
  reviewNotes?: string | null;
  notes?: string | null;
  bankDepositDate?: string | null;
  bankReferenceNumber?: string | null;
};
```

### Campos esperados en respuesta de pago

La respuesta del pago ahora puede incluir:

```ts
type PaymentBankFields = {
  reportedBankEntityId?: string | null;
  reportedBankEntityCode?: string | null;
  reportedBankEntityName?: string | null;
  approvedBankEntityId?: string | null;
  approvedBankEntityCode?: string | null;
  approvedBankEntityName?: string | null;
  bankGlAccountId?: string | null;
  bankGlAccountCode?: string | null;
  bankGlAccountName?: string | null;
};
```

## Reglas de UX recomendadas

- En registro, si el usuario no selecciona banco, mostrar texto: `Banco no especificado por capturista`.
- En aprobación, si hay banco reportado, mostrar badge: `Banco sugerido por registro`.
- Si el aprobador cambia el banco, mostrar confirmación visual antes de aprobar.
- No exponer IDs técnicos al usuario.
- Mostrar nombre del banco, no nombre de cuenta contable, en la experiencia operativa principal.
- Reservar la cuenta contable solo para vistas administrativas o de auditoría.

## No hacer

- No enviar `paymentTypeCode`.
- No enviar `bankGlAccountId` en registro.
- No enviar `bankGlAccountId` en aprobación.
- No inferir la cuenta bancaria en frontend.
- No hardcodear bancos en frontend; siempre consumir el catálogo.

## Resumen operativo

- Registro: usuario captura comprobante y opcionalmente sugiere banco con `bankEntityId`.
- Aprobación: revisor confirma o corrige `bankEntityId`.
- Contabilidad: backend toma la cuenta contable desde la entidad bancaria confirmada.

