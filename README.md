<h1 align="center">Easy Quick Form</h1>

<p align="center">
  <b>Open-source, self-hostable drag-and-drop form builder</b> — a free Google Forms /
  Typeform alternative built with React, TypeScript, Express and MongoDB.
</p>

<p align="center">
  <a href="https://github.com/SahinurDEV/easy-quick-form/actions/workflows/ci.yml"><img src="https://github.com/SahinurDEV/easy-quick-form/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/SahinurDEV/easy-quick-form/stargazers"><img src="https://img.shields.io/github/stars/SahinurDEV/easy-quick-form?style=flat&logo=github" alt="GitHub stars" /></a>
  <a href="https://github.com/SahinurDEV/easy-quick-form/network/members"><img src="https://img.shields.io/github/forks/SahinurDEV/easy-quick-form?style=flat" alt="Forks" /></a>
  <a href="https://github.com/SahinurDEV/easy-quick-form/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22"><img src="https://img.shields.io/github/issues/SahinurDEV/easy-quick-form/good%20first%20issue?color=7057ff&label=good%20first%20issues" alt="Good first issues" /></a>
  <a href="https://github.com/SahinurDEV/easy-quick-form/commits/main"><img src="https://img.shields.io/github/last-commit/SahinurDEV/easy-quick-form" alt="Last commit" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center">
  <a href="https://easy-quick-form.vercel.app"><b>🚀 Live demo</b></a>
  &nbsp;·&nbsp;
  <a href="#-quick-start"><b>⚡ Quick start</b></a>
  &nbsp;·&nbsp;
  <a href="https://easy-quick-form-api.vercel.app/api/docs/"><b>📚 API docs</b></a>
  &nbsp;·&nbsp;
  <a href="./CONTRIBUTING.md"><b>🤝 Contribute</b></a>
</p>

<!--
  TODO(maintainer): add a 10–20 s demo GIF (build a form → share → view responses)
  at docs/demo.gif and uncomment the block below. A demo GIF is the single biggest
  driver of stars for UI projects.

<p align="center">
  <img src="./docs/demo.gif" alt="Building a form with drag and drop in Easy Quick Form" width="900" />
</p>
-->

> ⭐ **If Easy Quick Form is useful to you, please star the repo** — it helps other
> developers find it and keeps the project going.

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=white" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" />
  <img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" />
</p>

---

## Why Easy Quick Form?

- **Own your data** — self-host it with one `docker compose up`; responses live in your MongoDB.
- **Free and MIT-licensed** — no response limits, no paywalled field types.
- **A real-world full-stack TypeScript reference** — Google sign-in with refresh-token
  rotation, shared Zod schemas between client and server, TanStack Query/Table, dnd-kit,
  Tiptap, Swagger docs, Vitest + Supertest tests and CI. Great for learning the MERN stack.

|                                 | Easy Quick Form | Google Forms | Typeform |
| ------------------------------- | :-------------: | :----------: | :------: |
| Open source (MIT)               |       ✅        |      ❌      |    ❌    |
| Self-hostable (Docker)          |       ✅        |      ❌      |    ❌    |
| Drag-and-drop builder           |       ✅        |      ✅      |    ✅    |
| Responses stored in your own DB |       ✅        |      ❌      |    ❌    |
| Free, unlimited responses       |       ✅        |      ✅      |    ❌    |

## ⚡ Quick start

```bash
git clone https://github.com/SahinurDEV/easy-quick-form.git
cd easy-quick-form
docker compose up --build   # MongoDB + API + client → http://localhost:8080
```

You need a Google OAuth client ID for sign-in — see [Getting started](#getting-started)
for the full setup without Docker.

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

| Layer        | Technologies                                                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | React, TypeScript, Tailwind, ShadcnUI, React Hook Form, Zod, React Router, DND Kit, TanStack Query/Table, Tiptap, React Dropzone, React Easy Crop, Zustand |
| **Backend**  | Node, Express, TypeScript, Mongoose, Google OAuth, Multer, Sharp, JWT                                                                                      |
| **Database** | MongoDB                                                                                                                                                    |
| **Shared**   | Zod validation schemas reused across client and server                                                                                                     |

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

| Command        | Description                               |
| -------------- | ----------------------------------------- |
| `pnpm dev`     | Start the client and server in watch mode |
| `pnpm build`   | Build all workspace packages              |
| `pnpm preview` | Preview the production builds             |

## Deploying to Vercel

The live demo runs as two Vercel projects built from this monorepo (both are connected
to the GitHub repo, so every push to `main` redeploys them):

| Project               | Root directory | What it is                                                                                                          |
| --------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------- |
| `easy-quick-form`     | `client`       | Vite static build; `client/vercel.json` adds the SPA fallback rewrite to `index.html`                               |
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

| Method | Endpoint        |
| ------ | --------------- |
| POST   | `/auth/google`  |
| GET    | `/auth/refresh` |
| GET    | `/auth/logout`  |

Sign-in is Google-only: the former email/password endpoints (`/auth/signup`, `/auth/login`,
`/auth/forgot-password`, `/auth/reset-password/:token`, `/user/change-password`) return
`410 Gone`.

</details>

<details>
<summary><b>User</b></summary>

| Method | Endpoint               |
| ------ | ---------------------- |
| GET    | `/user/profile`        |
| PATCH  | `/user/profile`        |
| DELETE | `/user/delete-account` |

</details>

<details>
<summary><b>Forms</b></summary>

| Method | Endpoint                                           |
| ------ | -------------------------------------------------- |
| GET    | `/forms?page=0&pageSize=10&sort=-name&search=form` |
| GET    | `/forms/:id`                                       |
| POST   | `/forms`                                           |
| PATCH  | `/forms/:id`                                       |
| PATCH  | `/forms/bulk-delete`                               |
| DELETE | `/forms/:id`                                       |

</details>

<details>
<summary><b>Form responses</b></summary>

| Method | Endpoint               |
| ------ | ---------------------- |
| GET    | `/forms/:id/responses` |
| POST   | `/forms/:id/responses` |

</details>

## Roadmap

Ideas we'd love help with (see the
[good first issues](https://github.com/SahinurDEV/easy-quick-form/labels/good%20first%20issue)):

- [ ] Export responses to CSV
- [ ] Dark mode
- [ ] Form templates (contact, feedback, event registration, quiz)
- [ ] Conditional logic (show a field based on a previous answer)
- [ ] Email/webhook notifications on new responses
- [ ] Response analytics charts
- [ ] Embeddable forms (`<iframe>` / script snippet)
- [ ] i18n

Have another idea? [Open a feature request](https://github.com/SahinurDEV/easy-quick-form/issues/new/choose).

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for the
development workflow and guidelines, and our [Code of Conduct](./CODE_OF_CONDUCT.md).

### Contributors

<a href="https://github.com/SahinurDEV/easy-quick-form/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=SahinurDEV/easy-quick-form" alt="Contributors" />
</a>

## Star history

<a href="https://star-history.com/#SahinurDEV/easy-quick-form&Date">
  <img src="https://api.star-history.com/svg?repos=SahinurDEV/easy-quick-form&type=Date" alt="Star history chart" width="600" />
</a>

## Security

Found a vulnerability? Please see [SECURITY.md](./SECURITY.md) for how to report it
responsibly.

## License

Distributed under the [MIT License](./LICENSE).
