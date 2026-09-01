import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

test('github.io release configuration', async () => {
  const packageManifest = await readJson('apps/github.io/package.json');
  const changesetConfig = await readJson('.changeset/config.json');

  assert.equal(packageManifest.name, '@benkim0414/github-io');
  assert.equal(packageManifest.private, true);
  assert.equal(packageManifest.version, '0.1.0');
  assert.equal(changesetConfig.baseBranch, 'main');
  assert.deepEqual(changesetConfig.privatePackages, { version: true, tag: true });
});
