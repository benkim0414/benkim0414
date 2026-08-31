import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const versionWorkflowPath = '.github/workflows/changesets-version.yml';
const releaseWorkflowPath = '.github/workflows/release-github-io.yml';
const releaseTitle = 'chore(release): version github.io';
const releaseTitlePattern = releaseTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const readWorkflow = (path) => readFile(path, 'utf8');

test('creates github.io version pull requests without publishing', async () => {
  const workflow = await readWorkflow(versionWorkflowPath);
  const changesetsInputs = workflow.match(
    /changesets\/action@[^\n]+\n\s+with:\n((?:\s{10}.+\n?)+)/,
  )?.[1];

  assert.match(workflow, /push:\s*\n\s+branches:\s*\[main\]/);
  assert.match(workflow, /permissions:\s*\n\s+contents:\s*write/);
  assert.match(workflow, /pull-requests:\s*write/);
  assert.match(
    workflow,
    /changesets\/action@fdf536a68c4154480c89b42547f8102cf0d8bc47 # v2\.1\.1/,
  );
  assert.ok(changesetsInputs, 'Changesets action inputs must be configured');
  assert.match(changesetsInputs, /version-script:\s*pnpm changeset version/);
  assert.match(
    changesetsInputs,
    new RegExp(`commit-message: ['"]${releaseTitlePattern}['"]`),
  );
  assert.match(
    changesetsInputs,
    new RegExp(`pr-title: ['"]${releaseTitlePattern}['"]`),
  );
  assert.doesNotMatch(changesetsInputs, /^\s+(?:version|commit|title):/m);
  assert.doesNotMatch(changesetsInputs, /^\s+publish:/m);
});

test('releases only a merged github.io version pull request', async () => {
  const workflow = await readWorkflow(releaseWorkflowPath);

  assert.match(workflow, /pull_request:\s*\n\s+types:\s*\[closed\]/);
  assert.match(workflow, /github\.event\.pull_request\.merged == true/);
  assert.match(workflow, /github\.event\.pull_request\.base\.ref == 'main'/);
  assert.match(
    workflow,
    new RegExp(
      `github\\.event\\.pull_request\\.title == '${releaseTitlePattern}'`,
    ),
  );
  assert.match(
    workflow,
    /github\.event\.pull_request\.user\.login == 'github-actions\[bot\]'/,
  );
  assert.match(
    workflow,
    /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/,
  );
  assert.match(
    workflow,
    /github\.event\.pull_request\.head\.ref == 'changeset-release\/main'/,
  );
  assert.match(
    workflow,
    /group:\s*github-io-release-\$\{\{ github\.event\.pull_request\.number \}\}/,
  );
  assert.match(workflow, /permissions:\s*\n\s+contents:\s*write/);
  assert.match(workflow, /GH_TOKEN:\s*\$\{\{ secrets\.GITHUB_TOKEN \}\}/);
  assert.match(
    workflow,
    /ref:\s*\$\{\{ github\.event\.pull_request\.merge_commit_sha \}\}/,
  );
  assert.match(workflow, /apps\/github\.io\/package\.json/);
  assert.match(workflow, /tag="github\.io@\$version"/);
  assert.match(workflow, /git (?:rev-parse|ls-remote)[^\n]+refs\/tags\/\$tag/);
  assert.match(workflow, /existing_tag_sha=.*refs\/tags\/\$tag\^\{\}/);
  assert.match(workflow, /existing_tag_sha.*!=.*merge_sha/);
  assert.match(workflow, /exit 1/);
  assert.match(workflow, /git tag -a "\$tag" "\$merge_sha" -m "\$tag"/);
  assert.match(workflow, /gh release view "\$tag"/);
  assert.match(
    workflow,
    /gh release create "\$tag"[\s\S]*--target "\$merge_sha"[\s\S]*--generate-notes[\s\S]*--title "\$tag"/,
  );
});
