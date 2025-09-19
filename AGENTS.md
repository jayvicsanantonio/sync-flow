# Repository Guidelines

## Project Structure & Module Organization
Sync Flow runs as a Vercel Edge function with `api/index.ts` as the only entry that wires Hono routes into handlers. Application logic lives under `src/handlers` (request orchestration), `src/services` (Google Tasks, Resend, Redis integrations), `src/types` (shared TypeScript contracts), and `src/utils` (errors, rate limiting). Docs and operational playbooks are in `docs/`; reference them before introducing new flows. Temporary logs from local runs are stored under `logs/`.

## Build, Test, and Development Commands
Use pnpm. `pnpm install` bootstraps dependencies. `pnpm start` runs `vercel dev` and serves the Edge function locally. `pnpm type-check` runs `tsc --noEmit` against the strict config and should stay green before commits. `pnpm lint` / `pnpm lint:fix` enforce ESLint + Prettier; fix violations locally. `pnpm format` and `pnpm format:check` keep formatting aligned. `pnpm deploy` promotes to Vercel once PR checks pass.

## Coding Style & Naming Conventions
The project targets modern ESM TypeScript with strict mode enabled. Favor type-only imports (`import type { ... }`) and keep any usage behind lint suppressions rare. Prettier dictates formatting (2-space indent, single quotes, trailing commas); never hand-format. Keep files in `kebab-case.ts`, classes and types in `PascalCase`, and functions/variables in `camelCase`. Group imports external → internal → relative and prefer small, single-purpose modules.

## Testing Guidelines
Automated unit tests are still being introduced; add new suites as `*.test.ts` near the code or in `src/__tests__` and mock outbound services. Until coverage grows, rely on manual verification: run OAuth flows, exercise `handlers/*.ts` endpoints with curl/Postman, and confirm Redis/Resend behavior before merging. Always run `pnpm type-check` and `pnpm lint` as smoke checks, and document manual steps in the PR description.

## Commit & Pull Request Guidelines
Branch naming follows `feature/*`, `fix/*`, `refactor/*`, or `docs/*`. Commits should follow Conventional Commit syntax (`feat(auth): ...`, `fix(tasks): ...`) as reflected in history. Keep messages imperative and scope-limited. PRs must describe the change, link related issues/docs, list verification steps (include curl snippets when touching APIs), and add screenshots for UI-facing updates (e.g., Apple Shortcuts). Ensure reviewers can reproduce your validation easily.
