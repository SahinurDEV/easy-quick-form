# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- Server: `findOneAndUpdate` / `findByIdAndUpdate` use `returnDocument: 'after'` instead of
  the deprecated `new: true`, so the Mongoose deprecation warning is gone (#103).

## [1.0.0] - 2026-11-18

First tagged release.

### Added

- Drag-and-drop form builder with rich elements (WYSIWYG editor, calendar, date-range
  picker, combobox, …), form CRUD, search, bulk delete and response viewing.
- Google sign-in with JWT access tokens and rotating refresh tokens with reuse detection.
- Profile pictures via ImgBB, Cloudinary or local disk.
- Shared Zod validation package used by client and server.
- Swagger API docs at `/api/docs`, Docker Compose setup, Vercel deployment.
- Vitest + Supertest test suites and GitHub Actions CI.

### Changed

- Zod 4 for the shared validation schemas (#84).
- Vite 7, Vitest 4, TypeScript 5.9 and patched transitive dependencies; `pnpm audit`
  down from 29 to 5 advisories (#83).
- Client linting moved to an ESLint 9 flat config with eslint-plugin-react-hooks 7 (#86).
- Removed the redundant `@types/uuid` stub (#85).
- Vite 8 (Rolldown) with a function-form `manualChunks` (#92, #97); jsdom 31 (#93);
  TanStack Table 8.21, TypeScript 5.9 on the server, eslint-plugin-react-refresh 0.5 (#96);
  actions/checkout and actions/setup-node v7 in CI (#88, #89).
- README, issue forms and contributing guide refreshed (#87).

### Fixed

- Deleting a form now deletes its responses (#32).
- Support for Mongoose 9 (#69).
- The form builder no longer schedules a new timeout on every re-render after an
  element is dropped (#86).
- Flaky server tests in CI: test files run serially again under Vitest 4 (#95).

[Unreleased]: https://github.com/SahinurDEV/easy-quick-form/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/SahinurDEV/easy-quick-form/releases/tag/v1.0.0
