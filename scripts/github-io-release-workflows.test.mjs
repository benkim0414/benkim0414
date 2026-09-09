import assert from 'node:assert/strict';
import {
  access,
  readFile,
  mkdtemp,
  mkdir,
  writeFile,
  rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const workflow = await readFile(
  '.github/workflows/release-github-io.yml',
  'utf8',
);
const step = (name) => {
  const body = workflow.split(`      - name: ${name}\n`)[1];
  assert.ok(body, `Missing workflow step: ${name}`);
  return body.split(/\n      - (?:name:|uses:)/)[0];
};

test('serializes main releases with complete history', () => {
  for (const pattern of [
    /push:\n    branches: \[main\]/,
    /group: release\n  cancel-in-progress: false/,
    /fetch-depth: 0/,
    /git fetch origin --tags/,
    /contents: write/,
    /actions: read/,
    /github.ref == 'refs\/heads\/main'/,
  ])
    assert.match(workflow, pattern);
  assert.doesNotMatch(workflow, /pull_request:/);
});

test('discovers cross-run recovery evidence before calculation and build', () => {
  const recovery = step('Discover saved release');
  for (const pattern of [
    /github-io-\$SOURCE_SHA/,
    /repos\/\$GITHUB_REPOSITORY\/actions\/artifacts/,
    /--paginate/,
    /expired/,
    /workflow_id/,
  ])
    assert.match(recovery, pattern);
  assert.match(step('Download saved release'), /run-id:/);
  assert.match(step('Download saved release'), /github-token:/);
  const calculate = step('Calculate or resume release');
  for (const pattern of [
    /verify-record/,
    /--target "\$SOURCE_SHA"/,
    /github-io-release\.mjs calculate --target "\$SOURCE_SHA"/,
    /github-io-release\.mjs bootstrap --target "\$SOURCE_SHA"/,
    /BOOTSTRAP.*true/,
    /GITHUB_OUTPUT/,
  ])
    assert.match(calculate, pattern);
  assert.ok(
    workflow.indexOf('name: Discover saved release') <
      workflow.indexOf('name: Calculate or resume release'),
  );
  assert.ok(
    workflow.indexOf('name: Calculate or resume release') <
      workflow.indexOf('name: Validate and build release'),
  );
});

test('only prepares new builds with verified embedded versions', () => {
  const build = step('Validate and build release');
  for (const pattern of [
    /if: steps\.release\.outputs\.action == 'prepare'/,
    /pnpm nx lint github\.io/,
    /pnpm nx test github\.io --run/,
    /APP_RELEASE=true APP_VERSION="\$VERSION" pnpm nx build github\.io --skip-nx-cache/,
    /Verified footer version v/,
    /tar[^\n]+dist\/apps\/github\.io/,
  ])
    assert.match(build, pattern);
  assert.match(step('Create release record'), /serializeReleaseRecord/);
  assert.match(
    step('Verify release files'),
    /verify-record[^\n]+--artifact .*github-io-pages\.tgz/,
  );
});

test('built-version verification accepts split prefix bundles and rejects nearby versions', async (t) => {
  const snippet = step('Validate and build release').match(
    /node --input-type=module <<'VERIFY_VERSION'\n([\s\S]*?)\n          VERIFY_VERSION/,
  )?.[1];
  assert.ok(
    snippet,
    'The emitted version must be checked independently of prefix folding',
  );
  const script = snippet.replace(/^          /gm, '');
  const cwd = await mkdtemp(join(tmpdir(), 'github-io-built-version-'));
  const previousDirectory = process.cwd();
  const previousVersion = process.env.VERSION;
  t.after(async () => {
    process.chdir(previousDirectory);
    if (previousVersion === undefined) delete process.env.VERSION;
    else process.env.VERSION = previousVersion;
    await rm(cwd, { recursive: true, force: true });
  });
  process.chdir(cwd);
  process.env.VERSION = '1.2.3';
  const assets = join(cwd, 'dist/apps/github.io/assets');
  await mkdir(assets, { recursive: true });
  for (const [bundle, expectedStatus] of [
    ['var version=`1.2.3`; const footer=`v${version}`;', 0],
    ['const version="1.2.3";', 0],
    ["const version='1.2.3';", 0],
    ['const version="1.2.30";', 1],
    ['const version="dev";', 1],
  ]) {
    await writeFile(join(assets, 'main.js'), bundle);
    const run = () =>
      import(
        `data:text/javascript,${encodeURIComponent(script)}#${encodeURIComponent(bundle)}`
      );
    if (expectedStatus === 0) await assert.doesNotReject(run);
    else
      await assert.rejects(
        run,
        /Built JavaScript must contain the exact release version/,
      );
  }
});

test('persists verified files before tagging and publishing matching Release assets', () => {
  const persist = step('Persist prepared release');
  for (const pattern of [
    /actions\/upload-artifact@/,
    /name: github-io-\$\{\{ steps\.source\.outputs\.sha \}\}/,
    /retention-days: 90/,
    /github-io-pages\.tgz/,
    /release-record\.json/,
    /if-no-files-found: error/,
    /include-hidden-files: true/,
  ])
    assert.match(persist, pattern);
  const ordered = [
    'Verify release files',
    'Persist prepared release',
    'Create or verify release tag',
    'Publish verified release',
  ].map((name) => workflow.indexOf(`name: ${name}`));
  assert.ok(
    ordered.every(
      (position, index) =>
        position >= 0 && (!index || position > ordered[index - 1]),
    ),
  );
  assert.match(
    step('Create or verify release tag'),
    /existing_tag_sha.*!=.*SOURCE_SHA/,
  );
  assert.match(
    step('Create or verify release tag'),
    /git tag -a "\$TAG" "\$SOURCE_SHA" -m "\$TAG"/,
  );
  const publish = step('Publish verified release');
  for (const pattern of [
    /--verify-tag/,
    /gh release upload "\$TAG"/,
    /gh release download "\$TAG"/,
    /cmp .*release-record\.json/,
    /cmp .*github-io-pages\.tgz/,
    /gh release edit "\$TAG" --draft=false/,
  ])
    assert.match(publish, pattern);
});

test('removes the parallel Changesets and unversioned deployment paths', async () => {
  for (const path of [
    '.github/workflows/changesets-version.yml',
    '.github/workflows/deploy-github-pages-artifact.yml',
    '.changeset/config.json',
    '.changeset/sharp-aliens-tan.md',
  ])
    await assert.rejects(access(path), { code: 'ENOENT' });
  const manifest = JSON.parse(await readFile('package.json', 'utf8'));
  assert.equal(manifest.devDependencies['@changesets/cli'], undefined);
  assert.doesNotMatch(
    workflow,
    /changesets\/action|apps\/github\.io\/package\.json|--force/,
  );
  assert.doesNotMatch(
    await readFile('pnpm-lock.yaml', 'utf8'),
    /@changesets\//,
  );
});
