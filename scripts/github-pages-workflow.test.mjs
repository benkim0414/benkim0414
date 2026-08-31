import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const workflowPath = '.github/workflows/deploy-github-pages-artifact.yml';

const readWorkflow = () => readFile(workflowPath, 'utf8');

test('publishes verified github.io artifacts to the Pages repository', async () => {
  const workflow = await readWorkflow();

  assert.match(workflow, /push:\s*\n\s+branches:\s*\[main\]/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /group:\s*github-pages-artifact-sync/);
  assert.match(workflow, /cancel-in-progress:\s*true/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.match(workflow, /pnpm nx lint github\.io/);
  assert.match(workflow, /pnpm nx test github\.io --run/);
  assert.match(workflow, /pnpm nx build github\.io/);
  assert.match(workflow, /repository:\s*benkim0414\/benkim0414\.github\.io/);
  assert.match(workflow, /secrets\.GITHUB_PAGES_DEPLOY_KEY/);
  assert.match(
    workflow,
    /node scripts\/sync-github-pages-artifact\.mjs dist\/apps\/github\.io \.pages-site/,
  );
  assert.match(workflow, /git push origin main(?!\s+--force)/);
});
