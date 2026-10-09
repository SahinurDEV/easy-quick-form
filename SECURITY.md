# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in Easy Quick Form, please report it
**privately** — do not open a public GitHub issue.

Instead, use GitHub's [private vulnerability reporting](https://github.com/SahinurDEV/easy-quick-form/security/advisories/new)
or contact the maintainer directly.

Please include:

- A description of the vulnerability and its impact.
- Steps to reproduce (proof of concept if possible).
- Any suggested remediation.

You can expect an initial response within a few days. Please give us a reasonable
amount of time to address the issue before any public disclosure.

## Handling secrets

This project reads all secrets (database URI, JWT secrets, SMTP credentials, OAuth
client secrets) from environment variables. **Never commit real `.env` files** — they
are git-ignored. Use the provided `*.env.example` files as templates, and rotate any
credential that may have been exposed.
