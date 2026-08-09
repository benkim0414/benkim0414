import { existsSync, readFileSync } from 'node:fs';

import { getStorybookAllowedHosts } from './main';

describe('getStorybookAllowedHosts', () => {
  it.each([
    [undefined, ['localhost']],
    ['storybook.example.test', ['localhost', 'storybook.example.test']],
    ['   ', ['localhost']],
    ['localhost', ['localhost']],
  ])('returns safe Storybook hosts for %s', (host, expected) => {
    expect(getStorybookAllowedHosts(host)).toEqual(expected);
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
