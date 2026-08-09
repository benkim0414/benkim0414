import { existsSync, readFileSync } from 'node:fs';
import { vi } from 'vitest';

import config, { getStorybookAllowedHosts } from './main';

describe('getStorybookAllowedHosts', () => {
  it.each([
    [undefined, ['localhost']],
    ['storybook.example.test', ['localhost', 'storybook.example.test']],
    ['   ', ['localhost']],
    ['localhost', ['localhost']],
  ])('returns safe Storybook hosts for %s', (host, expected) => {
    expect(getStorybookAllowedHosts(host)).toEqual(expected);
  });

  it('defines localhost as the default Storybook core allowed host', () => {
    expect(config.core?.allowedHosts).toEqual(['localhost']);
  });

  it('applies a runtime host to Storybook core and Vite server policies', async () => {
    const runtimeHost = 'storybook.example.test';
    const previousHost = process.env.STORYBOOK_ALLOWED_HOST;

    process.env.STORYBOOK_ALLOWED_HOST = runtimeHost;
    vi.resetModules();

    try {
      const { default: runtimeConfig } = await import('./main');
      const viteConfig = await runtimeConfig.viteFinal?.({});

      expect(runtimeConfig.core?.allowedHosts).toEqual([
        'localhost',
        runtimeHost,
      ]);
      expect(viteConfig?.server?.allowedHosts).toEqual([
        'localhost',
        runtimeHost,
      ]);
    } finally {
      if (previousHost === undefined) {
        delete process.env.STORYBOOK_ALLOWED_HOST;
      } else {
        process.env.STORYBOOK_ALLOWED_HOST = previousHost;
      }
      vi.resetModules();
    }
  });

  it('does not persist a private network address in Storybook configuration', () => {
    const sourcePath = existsSync('.storybook/main.ts')
      ? '.storybook/main.ts'
      : 'apps/github.io/.storybook/main.ts';
    const source = readFileSync(sourcePath, 'utf8');

    expect(source).not.toMatch(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
    expect(source).not.toContain('.ts.net');
    expect(source).not.toMatch(/tailnet/i);
  });
});
