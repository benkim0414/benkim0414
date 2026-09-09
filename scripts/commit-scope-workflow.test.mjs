import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync(
  new URL('../.github/workflows/commit-scopes.yml', import.meta.url),
  'utf8',
);

test('workflow is read-only, pinned, and checks PR and push events', () => {
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /push:/);
  assert.match(workflow, /permissions:\n  contents: read/);
  assert.doesNotMatch(workflow, /pull_request_target|secrets\./);
  assert.match(
    workflow,
    /actions\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1/,
  );
  assert.match(
    workflow,
    /actions\/setup-node@820762786026740c76f36085b0efc47a31fe5020/,
  );
  assert.match(
    workflow,
    /pnpm\/action-setup@008330803749db0355799c700092d9a85fd074e9/,
  );
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /persist-credentials: false/);
});

test('workflow reads event JSON and passes arguments without expression interpolation', () => {
  assert.match(workflow, /GITHUB_EVENT_PATH/);
  assert.match(workflow, /spawnSync/);
  assert.doesNotMatch(workflow, /--pr-title\s+["']?\$\{\{/);
  assert.match(workflow, /--pr-title/);
  assert.match(workflow, /--base/);
  assert.match(workflow, /--head/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
});
