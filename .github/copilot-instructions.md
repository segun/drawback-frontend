# GitHub Copilot Instructions — DrawkcaB Frontend

## Project Overview

DrawkcaB is a real-time collaborative drawing chat app. Users register, confirm their email, log in, find other users, send chat requests, and draw together on a shared canvas over a Socket.IO connection.

The frontend is a single-page React 19 app built with Vite, TypeScript, and Tailwind CSS v4. There is no routing library — routing is handled by reading `window.location.pathname` directly.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Language | TypeScript (strict) |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Real-time | Socket.IO client v4 |
| Package manager | Yarn 1 |

---

## Project Structure

```
src/
  App.tsx                        # Root — renders <AuthModule />
  main.tsx                       # Entry point
  index.css                      # Global styles + Tailwind import
  common/
    api/
      apiError.ts                # ApiError class (status + message)
    components/
      NoticeBanner.tsx           # Toast-style notice banner
    realtime/
      drawbackSocket.ts          # Socket.IO singleton + typed event helpers
    utils/
      tokenStorage.ts            # JWT access-token helpers
  modules/
    auth/
      constants.ts               # Shared constants (e.g. PRESET_COLORS)
      api/
        authApi.ts               # Auth REST calls (register, login, etc.)
        socialApi.ts             # Authenticated REST calls (users, chat, etc.)
      components/
        AuthModule.tsx           # All state + logic (the "controller")
        AuthModuleView.tsx       # Pure render (the "view")
      utils/
        displayName.ts           # Display-name validation helpers
```

### Architecture pattern

State and business logic live exclusively in `AuthModule.tsx`. `AuthModuleView.tsx` is a pure presentational component that receives props — it contains no state, no API calls, and no side effects beyond event handlers passed from `AuthModule`.

When adding a new feature:
1. Add state and handlers to `AuthModule.tsx`.
2. Thread them as props into `AuthModuleView.tsx`.
3. Render in `AuthModuleView.tsx`.

---

## Coding Conventions

### TypeScript
- Strict mode is enabled — avoid `any`; prefer explicit types or generics.
- Use `type` aliases over `interface` unless declaration merging is needed.
- Name component prop types `<ComponentName>Props`.
- Export types that cross file boundaries; keep internal types local.

### React
- Functional components only.
- Use `useMemo` for expensive derivations and API client instances.
- Use `useRef` for mutable values that must not trigger re-renders (e.g. canvas refs, latest-value refs).
- Avoid `useEffect` for derived state; compute inline or in `useMemo`.
- Keep components focused: if a component is doing both logic and rendering, split it.

### Naming
- Components: `PascalCase`
- Functions and variables: `camelCase`
- Constants: `SCREAMING_SNAKE_CASE`
- Filenames mirror their default export (e.g. `AuthModule.tsx` exports `AuthModule`).

### Styling
- Tailwind utility classes only — no custom CSS files except `index.css` (global resets + theme tokens) and `App.css` (legacy, avoid extending).
- Color palette is rose-based. Primary interactive colour: `rose-600`. Error: `red-600`. Success: `green-600`.
- Responsive: mobile-first. Sidebar collapses on small screens using `lg:` breakpoint variants.
- Landscape mobile handled with `landscape:max-lg:` compound variants.

### API calls
- All REST calls go through typed helpers in `authApi.ts` / `socialApi.ts`.
- Errors are thrown as `ApiError` instances; catch and map with `mapErrorToMessage`.
- `VITE_BACKEND_URL` is the base URL (configured in `.env`).
- Authenticated requests require `Authorization: Bearer <accessToken>`. The token is stored via `tokenStorage.ts`.

### Real-time (Socket.IO)
- A single Socket.IO socket instance is managed in `drawbackSocket.ts`.
- Namespace: `/drawback`. Auth: JWT in the `auth` handshake object.
- All socket event names use dot-notation (e.g. `chat.requested`, `draw.stroke`).
- Emit helpers are exported from `drawbackSocket.ts`; import and call them — do not call `socket.emit` directly outside that module.

### Notices / toasts
- Use the `showNotice(text, type)` helper (defined in `AuthModule`) to surface feedback.
- Types: `'info'` | `'success'` | `'error'`.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_BACKEND_URL` | API base URL, e.g. `http://localhost:3000/api` |

Prefix all Vite-exposed env vars with `VITE_`.

---

## Display Names

- Always prefixed with `@` (e.g. `@alice`, `@bob_99`).
- 3–29 alphanumeric/underscore characters after the `@`.
- Stored and compared case-insensitively.
- Validation lives in `src/modules/auth/utils/displayName.ts`.

---

## Key API Endpoints

See `docs/FRONTEND_INTEGRATION.md` for full request/response shapes.

**Authentication** (no token required)
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/confirm/:token`
- `GET /auth/display-name/check?name=`

**Users** (Bearer token required)
- `GET /users/me` — own profile
- `PATCH /users/me` — update display name
- `PATCH /users/me/mode` — set `PUBLIC` / `PRIVATE`
- `DELETE /users/me` — delete account
- `GET /users/public` — list public users
- `GET /users/search?q=` — search by @name

**Chat**
- `POST /chat/requests` — send chat request
- `GET /chat/requests/sent` / `received`
- `POST /chat/requests/:id/respond`
- `DELETE /chat/requests/:id`

---

## WebSocket Events

See `docs/WEBSOCKET_REFERENCE.md` for full payload shapes.

**Server → Client**
- `chat.requested` — incoming chat request
- `chat.response` — response to an outgoing request
- `chat.joined` — both peers joined the room
- `draw.stroke` — remote drawing stroke
- `draw.clear` — remote canvas cleared
- `draw.peer.joined` / `draw.peer.left` / `draw.peer.waiting`

**Client → Server**
- `chat.join` — join a chat room
- `draw.stroke` — send a drawing stroke
- `draw.clear` — clear canvas

---

## Canvas Drawing

- Two canvases: `localCanvasRef` (user draws here) and `remoteCanvasRef` (peer strokes rendered here).
- Strokes are normalised to `[0, 1]` coordinates before sending so they are resolution-independent.
- Canvas resolution is synced to the element's CSS size on each pointer-down event via `syncCanvasResolution`.
- `touch-action: none` must be set on the canvas element to prevent scroll interference.

---

## SPA Routing

There is no router library. Routes are detected by reading `window.location.pathname`:
- `/` — main app
- `/confirm` — email confirmation landing page

Production servers must redirect all unknown paths to `index.html`. See `deploy/nginx/drawback.chat.conf`.

---

## Scripts

```bash
yarn dev          # Start Vite dev server
yarn build        # Production build to dist/
yarn typecheck    # Run tsc --noEmit
yarn lint         # Run ESLint
yarn preview      # Preview production build locally
yarn deploy       # Run deploy/deploy-frontend.sh
```

---

## Do / Don't

**Do**
- Keep all state in `AuthModule.tsx`.
- Write strict TypeScript — no implicit `any`.
- Use Tailwind classes; keep the rose colour palette consistent.
- Normalise canvas coordinates before emitting draw events.
- Guard against missing canvas context before drawing.

**Don't**
- Don't add state or API calls to `AuthModuleView.tsx`.
- Don't use `socket.emit` outside `drawbackSocket.ts`.
- Don't install a routing library — the app intentionally avoids one.
- Don't store tokens anywhere other than `tokenStorage.ts`.
- Don't add CSS files for per-component styles; use Tailwind utilities.
