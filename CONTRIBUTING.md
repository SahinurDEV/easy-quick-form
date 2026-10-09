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

## Development workflow

- This is a **pnpm workspace monorepo** (`client`, `server`, `packages/validation`).
- Shared validation lives in `packages/validation` and is consumed by both apps — if
  you change it, rebuild with `pnpm -F @form-builder/validation build`.
- Run the whole stack in watch mode with `pnpm dev`.

### Before you open a PR

Please run these checks locally and make sure they pass:

```bash
# Type-check the server
pnpm -F @form-builder/server exec tsc --noEmit

# Lint + build the client
pnpm -F @form-builder/client lint
pnpm -F @form-builder/client build
```

Code is formatted with **Prettier** (config in `.prettierrc`). Please format your
changes before committing.

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
