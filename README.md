<h1 align="center">Easy Quick Form</h1>

<p align="center">
  A full-stack MERN application for building dynamic forms with a drag-and-drop
  interface, and for tracking and viewing the responses they receive.
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

- 🔐 **JWT authentication** with protected routes, refresh tokens, reuse detection and rotation.
- 🚪 Logout, change password, and delete account.
- 📧 Transactional emails on signup and password reset (Nodemailer).
- 🖼️ Profile-picture upload with drag-and-drop and cropping.
- 🧱 **Drag-and-drop form builder** with many element types.
- 🔎 Full **CRUD** and search over forms.
- 📊 Form submission and response viewing.
- 🧰 Rich form elements — WYSIWYG editor, calendar, date-range picker, and more.
- 🪵 Centralized error logging and consistent error handling / user feedback.

> **Note:** profile pictures are stored on the server's local disk, so the upload
> feature is intended for local development. For production, swap the disk storage in
> `server/src/controllers/userController.ts` for a cloud store (S3, Cloudinary, etc.).

## Tech stack

| Layer        | Technologies                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| **Frontend** | React, TypeScript, Tailwind, ShadcnUI, React Hook Form, Zod, React Router, DND Kit, TanStack Query/Table, Tiptap, React Dropzone, React Easy Crop, Zustand |
| **Backend**  | Node, Express, TypeScript, Mongoose, Nodemailer, Multer, Sharp, JWT                                            |
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
- An **SMTP** account for emails — e.g. a free [Brevo](https://www.brevo.com/) server.

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
Override secrets (JWT, SMTP, Google) via a root `.env` file or your shell.

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

## API reference

Base path: `/api/v1`

<details>
<summary><b>Auth</b></summary>

| Method | Endpoint                       |
| ------ | ------------------------------ |
| POST   | `/auth/signup`                 |
| POST   | `/auth/login`                  |
| GET    | `/auth/refresh`                |
| GET    | `/auth/logout`                 |
| POST   | `/auth/forgot-password`        |
| PATCH  | `/auth/reset-password/:token`  |

</details>

<details>
<summary><b>User</b></summary>

| Method | Endpoint                  |
| ------ | ------------------------- |
| GET    | `/user/profile`           |
| PATCH  | `/user/profile`           |
| PATCH  | `/user/change-password`   |
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
