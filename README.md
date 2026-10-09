<h1 align="center">Easy Quick Form</h1>

<p align="center">
  A full-stack MERN application for building dynamic forms with a drag-and-drop
  interface, and for tracking and viewing the responses they receive.
</p>

<p align="center">
  <b>🚀 Live demo: <a href="https://easy-quick-form.vercel.app">easy-quick-form.vercel.app</a></b>
  &nbsp;·&nbsp; API: <a href="https://easy-quick-form-api.vercel.app/api/docs/">easy-quick-form-api.vercel.app/api/docs</a>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" />
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" />
</p>

---

## Features

- 🔐 **Sign in with Google** (Google-only auth; no passwords to manage), backed by JWT access tokens and refresh tokens with reuse detection and rotation.
- 🚪 Logout and delete account.
- 🖼️ Profile-picture upload with drag-and-drop and cropping.
- 🧱 **Drag-and-drop form builder** with many element types.
- 🔎 Full **CRUD** and search over forms.
- 📊 Form submission and response viewing.
- 🧰 Rich form elements — WYSIWYG editor, calendar, date-range picker, and more.
- 🪵 Centralized error logging and consistent error handling / user feedback.

> **Note:** profile pictures are uploaded to ImgBB when `IMGBB_API_KEY` is set, otherwise
> to Cloudinary when the `CLOUDINARY_*` env vars are set, and otherwise to the server's
> local disk (fine for local development). On Vercel, avatar uploads return `503` unless
> ImgBB or Cloudinary is configured.

## Tech stack

| Layer        | Technologies                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| **Frontend** | React, TypeScript, Tailwind, ShadcnUI, React Hook Form, Zod, React Router, DND Kit, TanStack Query/Table, Tiptap, React Dropzone, React Easy Crop, Zustand |
| **Backend**  | Node, Express, TypeScript, Mongoose, Google OAuth, Multer, Sharp, JWT                                          |
| **Database** | MongoDB                                                                                                        |
| **Shared**   | Zod validation schemas reused across client and server                                                         |

## Project structure

This is a [pnpm workspace](https://pnpm.io/workspaces) monorepo:

```
easy-quick-form/
├── client/                 # React + Vite frontend
├── server/                 # Express + TypeScript API
└── packages/
    └── validation/         # Shared Zod schemas (used by client and server)
```

## Getting started

### Prerequisites

- **Node.js** 18+
- **pnpm** — enable via Corepack (ships with Node 16.13+):

  ```bash
  corepack enable
  ```

  …or install globally: `npm install -g pnpm`

- A **MongoDB** database — e.g. a free [MongoDB Atlas](https://www.mongodb.com/atlas/database) cluster.
- A **Google OAuth client** (Google Cloud Console → APIs & Services → Credentials → OAuth client ID,
  type "Web application"). Add `http://localhost:4400` (and `http://localhost:8080` for Docker)
  as **Authorized JavaScript origins**; no redirect URIs are needed. Sign-in is Google-only, so
  this is required.

### Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/SahinurDEV/easy-quick-form.git
   cd easy-quick-form
   pnpm install
   ```

2. **Build the shared validation package** (required before the first run — both apps depend on it)

   ```bash
   pnpm -F @form-builder/validation build
   ```

3. **Configure environment variables.** Copy each example file and fill it in:

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

4. **Run everything** (client + server together)

   ```bash
   pnpm dev
   ```

   The client runs on `http://localhost:4400` and the API on `http://localhost:8000`.

### With Docker

Bring up the whole stack (MongoDB + API + client) with one command:

```bash
docker compose up --build
```

The client is served on `http://localhost:8080`, the API on `http://localhost:8000`.
Override secrets (JWT, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) via a root `.env` file or your shell.

### Testing

```bash
pnpm -F @form-builder/server test   # API/auth integration tests (Vitest + Supertest)
pnpm -F @form-builder/client test   # component tests (Vitest + Testing Library)
```

### API documentation

Interactive Swagger UI is served by the API at **`/api/docs`** (e.g.
`http://localhost:8000/api/docs`).

### Scripts

Run from the repo root:

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `pnpm dev`      | Start the client and server in watch mode    |
| `pnpm build`    | Build all workspace packages                 |
| `pnpm preview`  | Preview the production builds                 |

## Deploying to Vercel

The live demo runs as two Vercel projects built from this monorepo (both are connected
to the GitHub repo, so every push to `main` redeploys them):

| Project               | Root directory | What it is                                                                                         |
| --------------------- | -------------- | -------------------------------------------------------------------------------------------------- |
| `easy-quick-form`     | `client`       | Vite static build; `client/vercel.json` adds the SPA fallback rewrite to `index.html`               |
| `easy-quick-form-api` | `server`       | Express app as a single serverless function (`server/api/index.js`); `server/vercel.json` rewrites every path to it |

Both projects use Node.js 24.x, keep **"Include files outside the root directory"**
enabled (the shared `packages/validation` lives outside them), and install from the
workspace root with pnpm. The build commands compile `@form-builder/validation` first.

How the API runs serverless:

- `server/api/index.js` reuses the compiled Express app (`dist/app.js`) without calling
  `app.listen`, and caches the MongoDB connection across warm invocations
  (`server/src/utils/db.ts`). `pnpm dev` / Docker still start `src/server.ts` as before.
- `trust proxy` is enabled on Vercel so rate limiting sees the real client IP.
- The refresh-token cookie is `SameSite=None; Secure`, so it works across the two domains.
- Swagger UI's static assets are copied into the static output at build time
  (`server/scripts/copy-swagger-assets.js`).

Environment variables:

- **API:** `DATABASE`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `NODE_ENV=production`,
  `CLIENT_URL` (the client origin, for CORS), `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  (required: sign-in is Google-only). Optional: `IMGBB_API_KEY` or `CLOUDINARY_*` (avatar
  uploads; without them uploads answer `503`). The `SMTP_*` variables are no longer used.
- **Client:** `VITE_BACKEND_BASE_URL` (e.g. `https://<api-domain>/api/v1`), `VITE_SECRET_KEY`,
  and `VITE_GOOGLE_CLIENT_ID` (same value as `GOOGLE_CLIENT_ID`). `VITE_*` values
  are baked into the public JS bundle, so never put real secrets in them.

To deploy your own copy: create the two projects with the root directories above, set the
env vars, then run `vercel deploy --prod` from the repo root (or push to the connected repo).

## API reference

Base path: `/api/v1`

<details>
<summary><b>Auth</b></summary>

| Method | Endpoint                       |
| ------ | ------------------------------ |
| POST   | `/auth/google`                 |
| GET    | `/auth/refresh`                |
| GET    | `/auth/logout`                 |

Sign-in is Google-only: the former email/password endpoints (`/auth/signup`, `/auth/login`,
`/auth/forgot-password`, `/auth/reset-password/:token`, `/user/change-password`) return
`410 Gone`.

</details>

<details>
<summary><b>User</b></summary>

| Method | Endpoint                  |
| ------ | ------------------------- |
| GET    | `/user/profile`           |
| PATCH  | `/user/profile`           |
| DELETE | `/user/delete-account`    |

</details>

<details>
<summary><b>Forms</b></summary>

| Method | Endpoint                                              |
| ------ | ---------------------------------------------------- |
| GET    | `/forms?page=0&pageSize=10&sort=-name&search=form`   |
| GET    | `/forms/:id`                                         |
| POST   | `/forms`                                             |
| PATCH  | `/forms/:id`                                         |
| PATCH  | `/forms/bulk-delete`                                 |
| DELETE | `/forms/:id`                                         |

</details>

<details>
<summary><b>Form responses</b></summary>

| Method | Endpoint                   |
| ------ | -------------------------- |
| GET    | `/forms/:id/responses`     |
| POST   | `/forms/:id/responses`     |

</details>

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for the
development workflow and guidelines, and our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Security

Found a vulnerability? Please see [SECURITY.md](./SECURITY.md) for how to report it
responsibly.

## License

Distributed under the [MIT License](./LICENSE).
