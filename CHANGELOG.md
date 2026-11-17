# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0] - TBD

First tagged release.

### Added

- Drag-and-drop form builder with rich elements (WYSIWYG editor, calendar, date-range
  picker, combobox, …), form CRUD, search, bulk delete and response viewing.
- Google sign-in with JWT access tokens and rotating refresh tokens with reuse detection.
- Profile pictures via ImgBB, Cloudinary or local disk.
- Shared Zod validation package used by client and server.
- Swagger API docs at `/api/docs`, Docker Compose setup, Vercel deployment.
- Vitest + Supertest test suites and GitHub Actions CI.

### Fixed

- Deleting a form now deletes its responses (#32).
- Support for Mongoose 9 (#69).
