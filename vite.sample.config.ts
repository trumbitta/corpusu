import { defineConfig } from 'vite';
export default defineConfig({
  build: {
    ssr: true,
    outDir: 'dist',
    target: 'node24',
    lib: {
      entry: 'src/sample/main.tsx',
      formats: ['es'],
      fileName: () => 'sample-bundle.mjs',
    },
    rollupOptions: {
      external: ['react-devtools-core'],
      output: {
        banner: "#!/usr/bin/env node",
      },
    },
  },
});
