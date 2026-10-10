# Contributing to Easy Quick Form

Thanks for your interest in contributing! This guide covers everything you need to get
started.

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you
are expected to uphold it.

## Getting started

1. **Fork** the repository and **clone** your fork.
2. Follow the [Getting started](./README.md#getting-started) steps in the README to
   install dependencies, build the shared validation package, and configure your
   `.env` files.
3. Create a branch for your change:

   ```bash
   git checkout -b feat/short-description
   ```

## Local setup

You need **Node.js 18+** (22 or 24 recommended), **pnpm** (`corepack enable`), and a
MongoDB database: a free [Atlas](https://www.mongodb.com/atlas/database) cluster, a local
`mongod`, or just `docker compose up mongo`.

```bash
git clone https://github.com/<your-username>/easy-quick-form.git
cd easy-quick-form
pnpm install
pnpm -F @form-builder/validation build    # shared schemas, needed before the first run

cp server/.env.example server/.env        # DATABASE, the two JWT secrets, GOOGLE_CLIENT_ID/SECRET
cp client/.env.example client/.env        # VITE_SECRET_KEY (any long random string), VITE_GOOGLE_CLIENT_ID

pnpm dev                                  # client on :4400, API on :8000
```

Generate the JWT secrets with
`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.

**Sign-in is Google-only**, so you need your own Google OAuth client for local dev: in Google
Cloud Console create an OAuth client ID of type "Web application", add `http://localhost:4400`
as an Authorized JavaScript origin (no redirect URIs needed), then put the client ID in
`GOOGLE_CLIENT_ID` (server) and `VITE_GOOGLE_CLIENT_ID` (client) and the secret in
`GOOGLE_CLIENT_SECRET` (server only). While the consent screen is in "Testing" mode, add your
Google account as a test user.

ImgBB/Cloudinary are **optional** (without them avatars go to local disk). SMTP is no longer
used. API tests don't need Google: they create users directly (see `server/src/test/helpers.ts`).

Prefer containers? `docker compose up --build` starts MongoDB, the API and the client
(client on `http://localhost:8080`).

Interactive API docs live at `http://localhost:8000/api/docs`.

## Development workflow

- This is a **pnpm workspace monorepo** (`client`, `server`, `packages/validation`).
- Shared validation lives in `packages/validation` and is consumed by both apps — if
  you change it, rebuild with `pnpm -F @form-builder/validation build`.
- Run the whole stack in watch mode with `pnpm dev`.

### Before you open a PR

Please run these checks locally and make sure they pass:

```bash
# Type-check + test the server
pnpm -F @form-builder/server exec tsc --noEmit
pnpm -F @form-builder/server test

# Lint + build the client
pnpm -F @form-builder/client lint
pnpm -F @form-builder/client test
pnpm -F @form-builder/client build
```

Code is formatted with **Prettier** (config in `.prettierrc`). Please format your
changes before committing.

## Deployment

`main` auto-deploys to Vercel (two projects: `client/` → static site, `server/` →
serverless function). See [Deploying to Vercel](./README.md#deploying-to-vercel) for how
it is wired. If your change adds an environment variable, document it in the matching
`.env.example` and mention it in your PR so a maintainer can add it on Vercel.
Keep `app.listen` out of `src/app.ts` (only `src/server.ts` listens) so the app still
works as a serverless function.

## Good first issues

New here? Look for issues labelled
[`good first issue`](https://github.com/SahinurDEV/easy-quick-form/labels/good%20first%20issue).
Comment on one to claim it before you start.

## Commit messages

Write clear, imperative commit messages (e.g. `Fix refresh-token rotation on login`).
[Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`,
`docs:`, `chore:` …) are encouraged but not required.

## Pull requests

1. Keep PRs focused — one logical change per PR.
2. Fill out the PR template, describing **what** changed and **why**.
3. Reference any related issues (e.g. `Closes #12`).
4. Make sure the checks above pass and there are no leftover `console.log`s or
   commented-out code.

## Reporting bugs & requesting features

Use the [issue templates](https://github.com/SahinurDEV/easy-quick-form/issues/new/choose).
For security issues, **do not** open a public issue — see [SECURITY.md](./SECURITY.md).

Thank you for helping make Easy Quick Form better! 🎉
## Formatting

Before submitting a pull request, format the codebase using:

```bash
pnpm format
```

To check formatting without changing files, run:

```bash
pnpm format:check
```