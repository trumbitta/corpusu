# Copilot Instructions for AI Coding Agents

## Project Overview

- This is a monorepo managed by [Nx](https://nx.dev), primarily using TypeScript.
- Major packages are under `packages/`:
  - `core/`: Core logic, data models, and utilities (see `src/` for main code).
  - `engine/`: Engine logic and related utilities.
  - `sample/`: Example app, likely for demo or testing purposes.
- Shared configuration and build logic is at the root (see `nx.json`, `tsconfig.base.json`, `eslint.config.mjs`).

## Key Workflows

- **Build**: `npx nx build <project>` (e.g., `core`, `engine`, `sample`)
- **Test**: `npx nx test <project>`
- **Typecheck**: `npx tsc -b` or use Nx targets
- **Sync TypeScript project references**: `npx nx sync` (manually) or `npx nx sync:check` (CI)
- **Release**: `npx nx release` (see README for details)
- **Visualize project graph**: `npx nx graph`

## Project Conventions

- **TypeScript project references** are managed automatically by Nx. Do not edit `tsconfig.json` references by hand.
- **Tests** are colocated with source files (e.g., `lib/character.spec.ts`).
- **Data** for core logic is in `core/src/data/characters/*.json`.
- **Vite** is used for local builds in each package (see `vite.config.ts`).
- **ESLint** config is per-package, but inherits from root config.
- **No custom AGENT/CLAUDE/cursor rules** found; follow this file and README for guidance.

## Integration & Patterns

- Cross-package imports use the Nx-generated paths (see `tsconfig.base.json`).
- Prefer using Nx CLI for all dev tasks to ensure project graph and references stay in sync.
- Example: To add a new library, use `npx nx g @nx/js:lib packages/<name> --publishable --importPath=@my-org/<name>`.

## References

- See [README.md](../README.md) for more details and links to Nx documentation.
- Key config files: `nx.json`, `tsconfig.base.json`, `eslint.config.mjs`, `vite.config.ts` in each package.
- Example data: `core/src/data/characters/`
- Example tests: `core/src/lib/character.spec.ts`, `engine/src/lib/engine.spec.ts`

---

If you are unsure about a workflow or convention, prefer the Nx CLI and check the README for project-specific details. Ask for feedback if you encounter unclear or undocumented patterns.
