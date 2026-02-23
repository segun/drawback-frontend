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

Implemented authenticated user/chat endpoints:

- `GET /users/me`
- `PATCH /users/me`
- `PATCH /users/me/mode`
- `DELETE /users/me`
- `GET /users/public`
- `GET /users/search?q=`
- `GET /users/me/blocked`
- `POST /users/:id/block`
- `DELETE /users/:id/block`
- `POST /chat/requests`
- `GET /chat/requests/sent`
- `GET /chat/requests/received`
- `POST /chat/requests/:requestId/respond`
- `DELETE /chat/requests/:requestId`
- `POST /chat/requests/:requestId/save`
- `GET /chat/saved`
- `DELETE /chat/saved/:savedChatId`

Implemented authenticated UX:

- View own account details after login.
- Update own display name and visibility mode (`PRIVATE` default, or `PUBLIC`).
- Delete own account.
- View public users and send chat requests.
- View all chat requests (sent and received).
- Accept or reject received chat requests.
- Save accepted chats and list/delete saved chats.
- Block and unblock users.

Token behavior:

- Access token is stored in `localStorage`.
- All authenticated gateway requests automatically send `Authorization: Bearer <accessToken>`.
