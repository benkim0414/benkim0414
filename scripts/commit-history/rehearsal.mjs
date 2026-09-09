import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { git } from './git.mjs';
import { validateLedger } from './ledger.mjs';
import { rewriteObjects } from './rewrite.mjs';
import { verifyMapping } from './verify.mjs';

const CLI = fileURLToPath(new URL('./cli.mjs', import.meta.url));
const APPROVAL_KEYS = [
  'schemaVersion',
  'executable',
  'argv',
  'source',
  'sourceCommonDirectory',
  'runDirectory',
  'destination',
  'inventoryPath',
  'ledgerPath',
  'backupPath',
  'restoredRepository',
  'approvalPath',
  'reportPath',
  'inventoryDigest',
  'ledgerDigest',
  'backupDigest',
  'sourceRefStateBase64',
  'refs',
  'worktrees',
  'signaturePolicy',
  'backupVerified',
  'warnings',
  'approvalEvidence',
];

function fail(message) {
  throw new Error(message);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function digestJson(value) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex');
}

function digestFile(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function sourceRefState(source) {
  return git(source, [
    'for-each-ref',
    '--sort=refname',
    '--format=%(refname)%00%(objectname)%00%(symref)%00',
  ]);
}

function parseRefState(raw) {
  const fields = raw.toString('utf8').split('\0');
  const refs = [];
  for (let index = 0; index + 2 < fields.length; index += 3) {
    const name = fields[index].replace(/^\n+/, '');
    if (name === '') continue;
    refs.push({
      name,
      oid: fields[index + 1],
      symbolicTarget: fields[index + 2] || null,
    });
  }
  return refs;
}

function commonDirectory(source) {
  const output = git(source, ['rev-parse', '--git-common-dir'])
    .toString('utf8')
    .trim();
  return realpathSync(resolve(source, output));
}

function currentWorktrees(inventory) {
  return inventory.worktrees.map((worktree) => {
    const head = git(worktree.path, ['rev-parse', '--verify', 'HEAD'])
      .toString('ascii')
      .trim();
    let branch = null;
    try {
      branch = git(worktree.path, ['symbolic-ref', '-q', 'HEAD'])
        .toString('utf8')
        .trim();
    } catch {
      // A detached HEAD is represented as null in the inventory.
    }
    return {
      path: worktree.path,
      head,
      branch,
      statusPorcelain: git(worktree.path, [
        'status',
        '--porcelain=v1',
      ]).toString('utf8'),
    };
  });
}

function assertFrozenWorktrees(inventory) {
  const current = currentWorktrees(inventory);
  for (const [index, expected] of inventory.worktrees.entries()) {
    const actual = current[index];
    if (
      actual.path !== expected.path ||
      actual.head !== expected.head ||
      actual.branch !== expected.branch
    ) {
      fail(`worktree identity changed for ${expected.path}`);
    }
    if (actual.statusPorcelain !== expected.statusPorcelain) {
      fail(`worktree status changed for ${expected.path}`);
    }
  }
  return current;
}

function frozenRefs(source, inventory) {
  const raw = sourceRefState(source);
  const actual = parseRefState(raw);
  if (actual.length !== inventory.refs.length) {
    fail('source refs changed since inventory');
  }
  const byName = new Map(actual.map((ref) => [ref.name, ref]));
  const refs = inventory.refs.map((ref) => {
    const current = byName.get(ref.name);
    if (!current || current.oid !== ref.oid) {
      fail(`frozen tip differs for ${ref.name}`);
    }
    if (
      current.symbolicTarget !== null &&
      (!byName.has(current.symbolicTarget) ||
        byName.get(current.symbolicTarget).oid !== current.oid)
    ) {
      fail(`symbolic ref ${ref.name} has an unavailable target`);
    }
    return { ...ref, symbolicTarget: current.symbolicTarget };
  });
  return { raw, refs };
}

function assertNoDetachedOnlyCommits(inventory) {
  const detachedOnly = inventory.commits.filter(
    ({ containingRefs }) => containingRefs.length === 0,
  );
  if (detachedOnly.length > 0) {
    fail(
      `detached-only inventory commits cannot be backed up without mutating source refs: ${detachedOnly
        .map(({ oid }) => oid)
        .join(', ')}`,
    );
  }
}

function ensureEmptyDirectory(path, label) {
  if (existsSync(path)) {
    if (!statSync(path).isDirectory() || readdirSync(path).length !== 0) {
      fail(`${label} must be empty: ${path}`);
    }
    return;
  }
  mkdirSync(path, { recursive: true });
}

function bundleHeads(source, backupPath) {
  const output = git(source, ['bundle', 'list-heads', backupPath])
    .toString('utf8')
    .trim();
  if (output === '') return new Map();
  return new Map(
    output.split('\n').map((line) => {
      const space = line.indexOf(' ');
      return [line.slice(space + 1), line.slice(0, space)];
    }),
  );
}

function assertBundleRefs(source, backupPath, refs) {
  const heads = bundleHeads(source, backupPath);
  for (const ref of refs) {
    if (heads.get(ref.name) !== ref.oid) {
      fail(`backup bundle is missing exact ref ${ref.name}`);
    }
  }
}

function initializeBare(path, objectFormat) {
  ensureEmptyDirectory(path, 'repository');
  git(path, ['init', '--quiet', '--bare', `--object-format=${objectFormat}`]);
}

function restoreRefs(repository, backupPath, refs) {
  for (const ref of refs.filter(({ symbolicTarget }) => !symbolicTarget)) {
    git(repository, [
      'fetch',
      '--quiet',
      '--no-tags',
      backupPath,
      `${ref.name}:${ref.name}`,
    ]);
  }
  for (const ref of refs.filter(({ symbolicTarget }) => symbolicTarget)) {
    git(repository, ['symbolic-ref', ref.name, ref.symbolicTarget]);
  }
}

function assertRestored(repository, inventory, refs) {
  git(repository, ['fsck', '--full', '--strict']);
  for (const ref of refs) {
    const actual = git(repository, ['rev-parse', '--verify', ref.name])
      .toString('ascii')
      .trim();
    if (actual !== ref.oid) fail(`restored tip differs for ${ref.name}`);
    if (ref.symbolicTarget) {
      const actualTarget = git(repository, ['symbolic-ref', ref.name])
        .toString('utf8')
        .trim();
      if (actualTarget !== ref.symbolicTarget) {
        fail(`restored symbolic target differs for ${ref.name}`);
      }
    }
  }
  for (const { oid } of inventory.commits) {
    const type = git(repository, ['cat-file', '-t', oid])
      .toString('ascii')
      .trim();
    if (type !== 'commit') fail(`restored backup is missing commit ${oid}`);
  }
}

function rehearsalArgv(paths) {
  return [
    CLI,
    'rehearse',
    '--backup',
    paths.backupPath,
    '--destination',
    paths.destination,
    '--inventory',
    paths.inventoryPath,
    '--ledger',
    paths.ledgerPath,
    '--approval',
    paths.approvalPath,
    '--output',
    paths.reportPath,
  ];
}

function assertSourceUnchanged(source, beforeRefs, beforeWorktrees, inventory) {
  if (!sourceRefState(source).equals(beforeRefs)) {
    fail('source refs changed during rehearsal operation');
  }
  const afterWorktrees = currentWorktrees(inventory);
  if (JSON.stringify(afterWorktrees) !== JSON.stringify(beforeWorktrees)) {
    fail('source worktrees changed during rehearsal operation');
  }
}

export function prepareRehearsal({ source, runDirectory, inventory, ledger }) {
  validateLedger(inventory, ledger, { requireResolved: true });
  assertNoDetachedOnlyCommits(inventory);

  const sourcePath = realpathSync(source);
  const runPath = resolve(runDirectory);
  const sourceCommonDirectory = commonDirectory(sourcePath);
  if (runPath === sourcePath || runPath === sourceCommonDirectory) {
    fail('run directory must differ from source and common Git directory');
  }

  const { raw: beforeRefs, refs } = frozenRefs(sourcePath, inventory);
  const beforeWorktrees = assertFrozenWorktrees(inventory);
  ensureEmptyDirectory(runPath, 'run directory');

  const paths = {
    inventoryPath: join(runPath, 'inventory.json'),
    ledgerPath: join(runPath, 'ledger.json'),
    backupPath: join(runPath, 'backup.bundle'),
    restoredRepository: join(runPath, 'restored.git'),
    approvalPath: join(runPath, 'approval.json'),
    destination: join(runPath, 'rewritten.git'),
    reportPath: join(runPath, 'report.json'),
  };
  writeJson(paths.inventoryPath, inventory);
  writeJson(paths.ledgerPath, ledger);
  git(sourcePath, [
    'bundle',
    'create',
    paths.backupPath,
    ...refs.map(({ name }) => name),
  ]);
  git(sourcePath, ['bundle', 'verify', paths.backupPath]);
  assertBundleRefs(sourcePath, paths.backupPath, refs);
  initializeBare(paths.restoredRepository, inventory.objectFormat);
  restoreRefs(paths.restoredRepository, paths.backupPath, refs);
  assertRestored(paths.restoredRepository, inventory, refs);
  assertSourceUnchanged(sourcePath, beforeRefs, beforeWorktrees, inventory);

  const warnings = [
    'Git bundles exclude uncommitted files; preserve listed worktree changes separately before any later reconciliation.',
  ];
  const approvalPackage = {
    schemaVersion: 1,
    executable: process.execPath,
    argv: rehearsalArgv(paths),
    source: sourcePath,
    sourceCommonDirectory,
    runDirectory: runPath,
    ...paths,
    inventoryDigest: digestJson(inventory),
    ledgerDigest: digestJson(ledger),
    backupDigest: digestFile(paths.backupPath),
    sourceRefStateBase64: beforeRefs.toString('base64'),
    refs,
    worktrees: beforeWorktrees,
    signaturePolicy: 'reject',
    backupVerified: true,
    warnings,
    approvalEvidence: null,
  };
  writeJson(paths.approvalPath, approvalPackage);
  return approvalPackage;
}

function assertRecord(value, label, keys) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} has missing or unknown fields`);
  }
}

function validateApproval(approval) {
  assertRecord(approval, 'approval', APPROVAL_KEYS);
  if (approval.schemaVersion !== 1) fail('approval schemaVersion must be 1');
  if (approval.approvalEvidence !== null) {
    assertRecord(approval.approvalEvidence, 'approval evidence', [
      'kind',
      'statement',
    ]);
  }
  if (
    approval.approvalEvidence === null ||
    typeof approval.approvalEvidence !== 'object' ||
    Array.isArray(approval.approvalEvidence) ||
    approval.approvalEvidence.kind !== 'direct-user-approval' ||
    typeof approval.approvalEvidence.statement !== 'string' ||
    approval.approvalEvidence.statement.trim() === ''
  ) {
    fail('direct user approval evidence is required');
  }
  if (approval.signaturePolicy !== 'reject') {
    fail('approval signature policy must be reject');
  }
  if (approval.backupVerified !== true) {
    fail('approval must record a verified backup');
  }
  if (approval.executable !== process.execPath) {
    fail('approved executable differs');
  }
  const expectedArgv = rehearsalArgv(approval);
  if (JSON.stringify(approval.argv) !== JSON.stringify(expectedArgv)) {
    fail('approved argv differs from exact rehearsal arguments');
  }
}

function assertSafeDestination(destination, approval) {
  const destinationPath = resolve(destination);
  if (
    destinationPath === approval.source ||
    destinationPath === approval.sourceCommonDirectory
  ) {
    fail('destination must differ from source and common Git directory');
  }
  if (destinationPath !== approval.destination) {
    fail('destination differs from approved path');
  }
  if (
    existsSync(destinationPath) &&
    (!statSync(destinationPath).isDirectory() ||
      readdirSync(destinationPath).length !== 0)
  ) {
    fail(`destination must be empty: ${destinationPath}`);
  }
  return destinationPath;
}

function assertApprovedInputs({ backup, inventory, ledger, approval }) {
  if (resolve(backup) !== approval.backupPath) {
    fail('backup differs from approved path');
  }
  if (digestJson(inventory) !== approval.inventoryDigest) {
    fail('inventory digest differs from approval');
  }
  if (digestJson(ledger) !== approval.ledgerDigest) {
    fail('ledger digest differs from approval');
  }
  if (digestFile(approval.backupPath) !== approval.backupDigest) {
    fail('backup digest differs from approval');
  }
  const currentRefs = sourceRefState(approval.source);
  if (currentRefs.toString('base64') !== approval.sourceRefStateBase64) {
    fail('source refs changed from frozen tips');
  }
  const currentByName = new Map(
    parseRefState(currentRefs).map((ref) => [ref.name, ref]),
  );
  const expectedRefs = inventory.refs.map((ref) => ({
    ...ref,
    symbolicTarget: currentByName.get(ref.name)?.symbolicTarget ?? null,
  }));
  if (JSON.stringify(approval.refs) !== JSON.stringify(expectedRefs)) {
    fail('approved refs differ from exact frozen refs');
  }
  if (commonDirectory(approval.source) !== approval.sourceCommonDirectory) {
    fail('source common Git directory differs from approval');
  }
}

function rejectAnnotatedTags(repository, refs) {
  for (const ref of refs.filter(({ name }) => name.startsWith('refs/tags/'))) {
    const type = git(repository, ['cat-file', '-t', ref.oid])
      .toString('ascii')
      .trim();
    if (type === 'tag') {
      fail(`annotated tag ${ref.name} requires a separately approved policy`);
    }
  }
}

function installMappedRefs(destination, refs, mapping) {
  const byOld = new Map(mapping.map(({ oldOid, newOid }) => [oldOid, newOid]));
  const updates = refs.filter(
    ({ role, symbolicTarget }) => role !== 'preserve' && !symbolicTarget,
  );
  for (const ref of updates) {
    if (!byOld.has(ref.oid)) {
      fail(`ref ${ref.name} does not point directly to an inventoried commit`);
    }
  }
  const transaction = [
    'start',
    ...updates.map(
      ({ name, oid }) => `update ${name} ${byOld.get(oid)} ${oid}`,
    ),
    'prepare',
    'commit',
    '',
  ].join('\n');
  git(destination, ['update-ref', '--stdin'], Buffer.from(transaction));
  return byOld;
}

function verifyInstalledRefs(destination, refs, byOld) {
  return refs.map((ref) => {
    const newOid = ref.role === 'preserve' ? ref.oid : byOld.get(ref.oid);
    if (!newOid) fail(`missing mapped tip for ${ref.name}`);
    const actual = git(destination, ['rev-parse', '--verify', ref.name])
      .toString('ascii')
      .trim();
    if (actual !== newOid) fail(`installed tip differs for ${ref.name}`);
    if (ref.symbolicTarget) {
      const target = git(destination, ['symbolic-ref', ref.name])
        .toString('utf8')
        .trim();
      if (target !== ref.symbolicTarget) {
        fail(`installed symbolic target differs for ${ref.name}`);
      }
    }
    return {
      name: ref.name,
      role: ref.role,
      oldOid: ref.oid,
      newOid,
      symbolicTarget: ref.symbolicTarget,
    };
  });
}

export function rehearse({ backup, destination, inventory, ledger, approval }) {
  validateApproval(approval);
  validateLedger(inventory, ledger, { requireResolved: true });
  assertNoDetachedOnlyCommits(inventory);
  assertApprovedInputs({ backup, inventory, ledger, approval });
  const beforeRefs = sourceRefState(approval.source);
  const beforeWorktrees = assertFrozenWorktrees(inventory);
  if (JSON.stringify(beforeWorktrees) !== JSON.stringify(approval.worktrees)) {
    fail('approved worktrees differ from exact frozen worktrees');
  }
  const destinationPath = assertSafeDestination(destination, approval);

  git(approval.source, ['bundle', 'verify', approval.backupPath]);
  assertBundleRefs(approval.source, approval.backupPath, approval.refs);
  initializeBare(destinationPath, inventory.objectFormat);
  restoreRefs(destinationPath, approval.backupPath, approval.refs);
  assertRestored(destinationPath, inventory, approval.refs);
  rejectAnnotatedTags(destinationPath, approval.refs);

  const mapping = rewriteObjects({
    cwd: destinationPath,
    inventory,
    ledger,
  });
  const verification = verifyMapping({
    source: destinationPath,
    destination: destinationPath,
    inventory,
    ledger,
    mapping,
  });
  const byOld = installMappedRefs(destinationPath, approval.refs, mapping);
  const refs = verifyInstalledRefs(destinationPath, approval.refs, byOld);
  assertSourceUnchanged(
    approval.source,
    beforeRefs,
    beforeWorktrees,
    inventory,
  );

  const report = {
    schemaVersion: 1,
    inventoryDigest: approval.inventoryDigest,
    ledgerDigest: approval.ledgerDigest,
    backupDigest: approval.backupDigest,
    mapping,
    refs,
    preservedRefs: refs
      .filter(({ role }) => role === 'preserve')
      .map(({ name, oldOid }) => ({ name, oid: oldOid })),
    counts: {
      commits: mapping.length,
      roots: verification.rootCount,
      refs: refs.length,
      preservedRefs: refs.filter(({ role }) => role === 'preserve').length,
      changedCommits: mapping.filter(({ oldOid, newOid }) => oldOid !== newOid)
        .length,
      changedRefs: refs.filter(({ oldOid, newOid }) => oldOid !== newOid)
        .length,
    },
    verification,
    signaturePolicy: 'reject',
    signatureHandling: {
      policy: 'reject',
      signedCommitCount: inventory.commits.filter(({ signed }) => signed)
        .length,
      annotatedTagCount: 0,
    },
    failures: [],
  };
  writeJson(approval.reportPath, report);
  return report;
}
