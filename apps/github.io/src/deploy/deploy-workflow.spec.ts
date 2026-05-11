import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const workspaceRoot = resolve(import.meta.dirname, '../../../..');
const workflow = readFileSync(
  resolve(workspaceRoot, '.github/workflows/deploy-github-io.yml'),
  'utf8'
);
const docs = readFileSync(resolve(workspaceRoot, 'docs/github-pages-deployment.md'), 'utf8');

describe('GitHub Pages deployment workflow', () => {
  it('builds and verifies the github.io app before publishing', () => {
    expect(workflow).toContain('pnpm install --frozen-lockfile');
    expect(workflow).toContain('pnpm nx test github.io');
    expect(workflow).toContain('pnpm nx e2e github.io-e2e');
    expect(workflow).toContain('pnpm nx build github.io');
  });

  it('publishes the static dist output to the user-site repository', () => {
    expect(workflow).toContain('git@github.com:benkim0414/benkim0414.github.io.git');
    expect(workflow).toContain('BUILD_DIRECTORY: apps/github.io/dist');
    expect(workflow).toContain('git push origin HEAD:main');
  });

  it('uses the documented deploy key secret', () => {
    expect(workflow).toContain('webfactory/ssh-agent@v0.10.0');
    expect(workflow).toContain('secrets.GH_PAGES_DEPLOY_KEY');
    expect(docs).toContain('GH_PAGES_DEPLOY_KEY');
    expect(docs).toContain('benkim0414/benkim0414.github.io');
  });
});
