/// <reference types='vitest' />
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

function getStylexPlugin(mode: string) {
  const plugin = stylex.vite({
    devMode: mode === 'test' ? 'css-only' : 'full',
    useCSSLayers: {
      before: ['reset', 'theme', 'base', 'astryx-base', 'astryx-theme'],
      after: ['utilities'],
      prefix: 'stylex',
    },
    sxPropName: false,
  });

  if (mode !== 'test') {
    return plugin;
  }

  return {
    ...plugin,
    configureServer: undefined,
    handleHotUpdate: undefined,
    transformIndexHtml: undefined,
  };
}

export default defineConfig(({ mode }) => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/github.io',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [getStylexPlugin(mode), react(), nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  build: {
    outDir: '../../dist/apps/github.io',
    emptyOutDir: true,
    reportCompressedSize: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        notFound: resolve(__dirname, '404.html'),
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '.storybook/**/*.spec.ts',
    ],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/github.io',
      provider: 'v8',
    },
  },
}));
