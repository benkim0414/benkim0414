#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Nx writes human-readable progress to stdout. Keep this process boundary JSON-only.
const writeResult = process.stdout.write.bind(process.stdout);
process.stdout.write = process.stderr.write.bind(process.stderr);

try {
  const decision = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  assert.equal(decision.action, 'prepare');
  assert.equal(decision.project, 'github.io');
  const manifestRoot = 'dist/release-manifests/github.io';
  mkdirSync(manifestRoot, { recursive: true });
  const manifest = JSON.parse(
    readFileSync('apps/github.io/package.json', 'utf8'),
  );
  writeFileSync(
    join(manifestRoot, 'package.json'),
    JSON.stringify({ ...manifest, version: decision.previousVersion }),
  );

  const { ReleaseClient } = await import('nx/release');
  // Pinned Nx 23 helper: use the release graph's resolved tag pattern, then check
  // it against the coordinator's persisted identity before any publication.
  const { createGitTagValues } =
    await import('nx/src/command-line/release/utils/shared');
  const client = new ReleaseClient({
    version: { versionActionsOptions: { skipLockFileUpdate: true } },
    groups: {
      'github.io': {
        version: {
          manifestRootsToUpdate: [manifestRoot],
          versionActions: './scripts/github-io-version-actions.cjs',
          currentVersionResolver: 'git-tag',
        },
      },
    },
  });
  const { projectsVersionData, releaseGraph } = await client.releaseVersion({
    projects: [decision.project],
    specifier: decision.newVersion,
    firstRelease: decision.bootstrap,
    dryRun: true,
    stageChanges: false,
    gitCommit: false,
    gitTag: false,
    gitPush: false,
  });
  assert.deepEqual(Object.keys(projectsVersionData), [decision.project]);
  const actual = projectsVersionData[decision.project];
  assert.equal(
    actual.newVersion,
    decision.newVersion,
    'Nx candidate version disagrees with the coordinator',
  );
  assert.equal(
    actual.currentVersion,
    decision.previousVersion,
    'Nx baseline disagrees with the coordinator',
  );
  const tags = createGitTagValues(
    releaseGraph.releaseGroups,
    releaseGraph.releaseGroupToFilteredProjects,
    projectsVersionData,
  );
  assert.deepEqual(
    tags,
    [decision.tag],
    'Nx tag format disagrees with the coordinator',
  );
  writeResult(
    `${JSON.stringify({ previousVersion: decision.previousVersion, newVersion: actual.newVersion, tag: tags[0], projects: Object.keys(projectsVersionData) })}\n`,
  );
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
