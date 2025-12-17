# Copilot Instructions for AI Coding Agents

## Project Overview

- This is a monolithic TypeScript project using Vite for builds.
- Major code is under `src/`:
  - `core/`: Core logic, data models, and utilities.
  - `engine/`: Engine logic and related utilities.
  - `sample/`: Example app and CLI.
- Shared configuration and build logic is at the repo root (`package.json`, `tsconfig.base.json`, `eslint.config.mjs`).

## Key Workflows

- **Build**: `npm run build` (library) and `npm run build:sample:rollup` (sample bundle)
- **Run sample**: `npm run start:sample`
- **Typecheck**: `npm run typecheck` (uses `tsc`)

## Project Conventions

- **TypeScript project references** are managed via `tsconfig.base.json` and project `tsconfig` files. Do not edit references manually without checking `tsconfig.base.json`.
- **Tests** are colocated with source files (e.g., `lib/character.spec.ts`).
- **Data** for core logic is in `core/src/data/characters/*.json`.
- **Vite** is used for local builds in each package (see `vite.config.ts`).
- **ESLint** config is per-package, but inherits from root config.
- **No custom AGENT/CLAUDE/cursor rules** found; follow this file and README for guidance.

## Integration & Patterns

Cross-package imports use the paths defined in `tsconfig.base.json`.

## References

- See [README.md](../README.md) for project details.
  -- Key config files: `tsconfig.base.json`, `eslint.config.mjs`, `vite.config.ts`.
- Example data: `core/src/data/characters/`
- Example tests: `core/src/lib/character.spec.ts`, `engine/src/lib/engine.spec.ts`

---

If you are unsure about a workflow or convention, check the README for project-specific details and ask for feedback.
