# Implementacion frontend: ficha financiera en solicitudes de credito

## Ubicacion en el flujo

- La ficha financiera se integra como subpantalla del expediente:
  - ruta: `src/routes/loans-routes.tsx`
  - pagina: `src/presentation/features/loans/applications/pages/loan-application-financial-profile-page.tsx`
- El acceso se realiza desde detalle y edicion de solicitud mediante navegacion contextual.
- No existe modulo independiente en el menu principal.

## Capas agregadas

- API:
  - `src/core/api/loans/loan-application-financial-profile-api.ts`
- Actions:
  - `src/core/actions/loan-applications/get-loan-application-financial-profile.action.ts`
  - `src/core/actions/loan-applications/save-loan-application-financial-profile.action.ts`
- DTOs:
  - `src/infrastructure/loans/requests/loan-application-financial-profile-upsert-request.ts`
  - `src/infrastructure/loans/responses/loan-application-financial-profile-response.ts`
- Validacion:
  - `src/infrastructure/validations/loans/loan-application-financial-profile.schema.ts`

## Presentacion

- Hook de orquestacion:
  - `src/presentation/features/loans/applications/hooks/use-loan-application-financial-profile.ts`
- Componentes:
  - `src/presentation/features/loans/applications/components/loan-application-financial-profile-section.tsx`
  - `src/presentation/features/loans/applications/components/loan-application-financial-profile-form.tsx`
  - `src/presentation/features/loans/applications/components/loan-application-financial-other-liabilities-table.tsx`

## Reglas UI implementadas

- `GET /financial-profile` con `404` se interpreta como ficha no creada.
- La edicion solo se habilita cuando la solicitud esta en `DRAFT` y el usuario tiene `loan_applications.update_draft`.
- Los totales, ratios e `isComplete` se muestran solo lectura usando la respuesta backend.
- `otherLiabilities` se envia completa en cada `PUT`, preservando `id` para filas existentes y recalculando `sortOrder` por posicion visible.
- El listado y el resumen del detalle consumen:
  - `hasFinancialProfile`
  - `isFinancialProfileComplete`
  - `financialProfileUpdatedAt`
  - `financialDebtRatio`
  - `financialDebtToEquityRatio`
