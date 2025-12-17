# corpusu

Monolithic TypeScript + Vite project.

Quick start:

```sh
npm install
npm run build       # build library
npm run build:sample:rollup  # build sample CLI bundle
npm run start:sample # build + run sample CLI
```

Development notes:

- Sources are under `src/` (core, engine, sample).
- The sample CLI uses Ink and is runnable via `npm run start:sample`.
- Type-check with `npm run typecheck`.

If you need CI steps, the GitHub workflow runs `npm ci` and the build/typecheck scripts.
