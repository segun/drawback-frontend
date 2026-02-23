# DrawkcaB (drawback)

Auth-first frontend aligned to backend APIs.

## Auth flow

1. User registers with `email`, `password`, and `displayName` (`@name`).
2. Backend sends confirmation email.
3. User cannot log in until email is confirmed.
4. User logs in with email and password.
5. Frontend stores `accessToken` and uses `Authorization: Bearer <accessToken>` for authenticated requests.

## Running

```bash
yarn install
yarn dev
yarn typecheck
```

## Backend integration

Set `VITE_BACKEND_URL` to your API base URL.

## Frontend modules

- `src/modules/auth/*`: auth UI, auth validations, and auth API calls.
- `src/common/components/*`: reusable shared UI components.
- `src/common/utils/*`: shared utility helpers.
- `src/common/api/*`: shared API-level primitives (for example, `ApiError`).

Implemented auth endpoints:

- `POST /auth/register` (no token)
- `POST /auth/login` (no token)

Token behavior:

- Access token is stored in `localStorage`.
- All authenticated gateway requests automatically send `Authorization: Bearer <accessToken>`.
