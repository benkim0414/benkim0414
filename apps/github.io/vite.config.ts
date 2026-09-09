/// <reference types='vitest' />
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

const release = process.env.APP_RELEASE === 'true';
const supplied = process.env.APP_VERSION;

// The absolute end assertion also rejects JavaScript's final-newline $ match.
const stableVersion = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?![\s\S])/;
if (release && !stableVersion.test(supplied ?? '')) {
  throw new Error('APP_VERSION must be a stable SemVer for release builds');
}

const version = release ? supplied : 'dev';

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
  base: '/',
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

  define:
    mode === 'test'
      ? undefined
      : {
          __APP_RELEASE__: JSON.stringify(release),
          __APP_VERSION__: JSON.stringify(version),
        },

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
    setupFiles: ['src/test-setup.ts'],
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
