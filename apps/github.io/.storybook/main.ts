import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import type { StorybookConfig } from '@storybook/react-vite';

const storybookDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(storybookDir, '../../..');
const linkedWorktreeDependencyRoot = resolve(storybookDir, '../../../../..');

const config: StorybookConfig = {
  stories: ['../src/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      },
    },
  },
  viteFinal: (config) => ({
    ...config,
    server: {
      ...config.server,
      allowedHosts: ['100.113.57.51', 'localhost'],
      fs: {
        ...config.server?.fs,
        allow: [
          ...(config.server?.fs?.allow ?? []),
          workspaceRoot,
          linkedWorktreeDependencyRoot,
        ],
      },
    },
  }),
};

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
