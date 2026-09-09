import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

test('Nx selects only github.io for independent tag-based deployable releases', async () => {
  const nx = await readJson('nx.json');
  const group = nx.release?.groups?.['github.io'];
  assert.ok(group);
  assert.deepEqual(group.projects, ['github.io']);
  assert.equal(group.projectsRelationship, 'independent');
  assert.equal(group.releaseTag.pattern, 'github.io@{version}');
  assert.equal(group.version.currentVersionResolver, 'git-tag');
  assert.deepEqual(group.version.manifestRootsToUpdate, [
    'dist/release-manifests/{projectName}',
  ]);
  assert.equal(group.version.updateDependents, 'never');
  const project = await readJson('apps/github.io/project.json');
  assert.ok(project.tags.includes('release:deployable'));
  assert.deepEqual(project.targets.build.inputs, [
    '...',
    { env: 'APP_RELEASE' },
    { env: 'APP_VERSION' },
  ]);
  assert.equal(nx.targetDefaults?.build?.inputs, undefined);
  assert.equal((await readJson('apps/github.io/package.json')).private, true);
});
