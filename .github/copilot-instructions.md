# GitHub Copilot Instructions — DrawkcaB Frontend

## Project Overview

DrawkcaB is a real-time collaborative drawing chat app. Users register, confirm their email, log in, find other users, send chat requests, and draw together on a shared canvas over a Socket.IO connection.

The frontend is a single-page React 19 app built with Vite, TypeScript, and Tailwind CSS v4. Routing is handled with Wouter, a lightweight (~1.5KB) React Router alternative.

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
| Routing | Wouter v3 |
| Package manager | Yarn 1 |

---

## Project Structure

```
src/
  App.tsx                        # Root — Router with Route/Switch for pages
  main.tsx                       # Entry point
  index.css                      # Global styles + Tailwind import
  pages/
    MainPage.tsx                 # "/" — Register/Login or Dashboard
    ConfirmPage.tsx              # "/confirm" — Email confirmation
    ResetPasswordPage.tsx        # "/reset-password" — Password reset
  components/
    auth/
      RegisterForm.tsx           # Registration form component
      LoginForm.tsx              # Login form component
      ForgotPasswordModal.tsx    # Forgot password modal component
    common/
      Header.tsx                 # App header component
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
      constants.ts               # Shared constants
      api/
        authApi.ts               # Auth REST calls (register, login, etc.)
        socialApi.ts             # Authenticated REST calls (users, chat, etc.)
      components/
        AuthModule.tsx           # State container + logic provider
        AuthModuleView.tsx       # Dashboard view (to be extracted)
      utils/
        displayName.ts           # Display-name validation helpers
```

### Architecture pattern

- **Pages** (`src/pages/`) — Top-level route components
- **Components** (`src/components/`) — Reusable UI components organized by feature
- **Common** (`src/common/`) — Truly shared utilities, API clients, components
- **Modules** (`src/modules/`) — Feature modules with their own API, utils, and legacy views

State management lives in `AuthModule.tsx`. Page components receive props and are kept as pure as possible.

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

Routing is handled by **Wouter** — a lightweight (~1.5KB) React Router alternative.

**Routes:**
- `/` — main app (register/login when logged out, dashboard when logged in)
- `/confirm` — email confirmation landing page
- `/reset-password` — password reset page

**Usage:**
- `useLocation()` — get/set current location
- `useRoute(pattern)` — returns `[match, params]` tuple
- `useSearch()` — get query string
- `<Link href="/path">` — client-side navigation
- `<Router>` — wraps app in App.tsx

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
- Place route logic in page components (`src/pages/`).  
- Extract reusable UI into feature components (`src/components/auth/`, `src/components/common/`).
- Keep pages as presentation-focused as possible; pass data and handlers as props.
- Keep state management in `AuthModule.tsx`.
- Write strict TypeScript — no implicit `any`.
- Use Tailwind classes; keep the rose colour palette consistent.
- Normalise canvas coordinates before emitting draw events.
- Guard against missing canvas context drawing.
- Use Wouter hooks (`useLocation`, `useRoute`) for routing logic.

**Don't**
- Don't mix business logic into page components — keep them presentational.
- Don't use `socket.emit` outside `drawbackSocket.ts`.
- Don't use `window.location` directly — use Wouter's `useLocation()` hook instead.
- Don't store tokens anywhere other than `tokenStorage.ts`.
- Don't add CSS files for per-component styles; use Tailwind utilities.
