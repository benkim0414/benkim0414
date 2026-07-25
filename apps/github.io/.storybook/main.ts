import { fileURLToPath } from 'node:url';
import { dirname, sep, resolve } from 'node:path';

import type { StorybookConfig } from '@storybook/react-vite';

const storybookDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(storybookDir, '../../..');
const linkedWorktreeDependencyRoot =
  getLinkedWorktreeDependencyRoot(storybookDir);

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
        allow: Array.from(
          new Set([
            ...(config.server?.fs?.allow ?? []),
            workspaceRoot,
            ...(linkedWorktreeDependencyRoot
              ? [linkedWorktreeDependencyRoot]
              : []),
          ]),
        ),
      },
    },
  }),
};

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

function getLinkedWorktreeDependencyRoot(path: string): string | undefined {
  const segments = path.split(sep);
  const worktreesIndex = segments.lastIndexOf('.worktrees');

  if (worktreesIndex === -1 || worktreesIndex + 1 >= segments.length) {
    return undefined;
  }

  return segments.slice(0, worktreesIndex).join(sep) || sep;
}

export default config;

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
