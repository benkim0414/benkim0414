import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const workflow = await readFile(
  '.github/workflows/release-github-io.yml',
  'utf8',
);
const deploy = workflow.split('\n  deploy:\n')[1] ?? '';

test('gates cross-repository credentials behind release and deployment environment', () => {
  for (const pattern of [
    /needs: release/,
    /if: needs\.release\.outputs\.action != 'noop'/,
    /environment: github-pages/,
    /repository: benkim0414\/benkim0414\.github\.io/,
    /ref: main/,
    /ssh-key: \$\{\{ secrets\.PAGES_DEPLOY_KEY \}\}/,
    /persist-credentials: true/,
  ])
    assert.match(deploy, pattern);
  assert.doesNotMatch(workflow.split('\n  deploy:\n')[0], /PAGES_DEPLOY_KEY/);
  assert.doesNotMatch(deploy, /pnpm (?:install|nx build)/);
});

test('verifies persisted bytes before extraction and performs anti-rollback sync', () => {
  assert.match(deploy, /actions\/download-artifact@/);
  assert.match(
    deploy,
    /run-id: \$\{\{ needs\.release\.outputs\.artifact_run_id \}\}/,
  );
  assert.match(
    deploy,
    /verify-record[^\n]+--target "\$SOURCE_SHA"[^\n]+--tag "\$TAG"/,
  );
  assert.ok(deploy.indexOf('verify-record') < deploy.indexOf('tar -xzf'));
  assert.match(
    deploy,
    /sync-github-pages-artifact\.mjs .* --release-record .*release-record\.json/,
  );
  assert.match(deploy, /--bootstrap/);
  assert.match(deploy, /identical|superseded/);
  assert.match(deploy, /git push origin main/);
  assert.doesNotMatch(deploy, /--force|git add --all/);
});
