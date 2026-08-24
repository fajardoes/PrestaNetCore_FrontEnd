# Sesión segura del cliente web

El frontend no almacena JWT ni refresh tokens en `localStorage` o
`sessionStorage`. El access token vive únicamente en memoria dentro de
`tokenStorage` y se envía como `Authorization: Bearer` mediante el cliente
HTTP centralizado.

El backend entrega el refresh token exclusivamente como cookie HttpOnly. El
cliente debe conservar `withCredentials: true` y nunca incluir un refresh token
en JSON, headers propios o estado React.

## Flujo

- `POST /api/auth/login`: devuelve el access token y establece la cookie de refresh.
- `POST /api/auth/refresh`: rota la cookie y devuelve un nuevo access token.
- `POST /api/auth/logout`: revoca la sesión server-side, elimina la cookie y devuelve `204`.
- Ante `401`, `httpClient` intenta un refresh único y reintenta la solicitud original.
- Al cargar la aplicación, `AuthProvider` intenta recuperar la sesión mediante `/auth/refresh`.

El access token tiene duración fija de 60 minutos. `rememberMe` controla la
persistencia de la cookie de refresh, no el almacenamiento del JWT en el
navegador.
