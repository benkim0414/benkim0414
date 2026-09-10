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
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from 'node:path';
import { fileURLToPath } from 'node:url';

import { git } from './git.mjs';
import { validateLedger } from './ledger.mjs';
import {
  isSignatureHeader,
  parseCommit,
  signatureApprovalKey,
  signatureHeaderSha256,
  validateSignatureAllowlist,
} from './objects.mjs';
import { rewriteObjects } from './rewrite.mjs';
import { verifyMapping } from './verify.mjs';

const CLI = fileURLToPath(new URL('./cli.mjs', import.meta.url));
const APPROVAL_KEYS = [
  'schemaVersion',
  'executable',
  'argv',
  'source',
  'sourceGitDirectory',
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
  'signatureAllowlist',
  'signatureAllowlistPath',
  'signatureAllowlistDigest',
  'backupVerified',
  'warnings',
  'approvalDigest',
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

function gitDirectory(source) {
  return realpathSync(
    git(source, ['rev-parse', '--absolute-git-dir']).toString('utf8').trim(),
  );
}

function canonicalPath(path) {
  let existing = resolve(path);
  const missing = [];
  while (!existsSync(existing)) {
    const parent = dirname(existing);
    if (parent === existing) fail(`cannot resolve path ${path}`);
    missing.unshift(basename(existing));
    existing = parent;
  }
  return resolve(realpathSync(existing), ...missing);
}

function containsPath(parent, child) {
  const difference = relative(parent, child);
  return (
    difference === '' ||
    (!isAbsolute(difference) &&
      difference !== '..' &&
      !difference.startsWith(`..${sep}`))
  );
}

function pathsOverlap(left, right) {
  return containsPath(left, right) || containsPath(right, left);
}

function assertOutsideGitStorage(
  path,
  sourceGitDirectory,
  sourceCommonDirectory,
) {
  if (
    pathsOverlap(path, sourceGitDirectory) ||
    pathsOverlap(path, sourceCommonDirectory)
  ) {
    fail(`protected path overlaps source Git storage: ${path}`);
  }
}

function assertSafeRunDirectory(
  runDirectory,
  source,
  sourceGitDirectory,
  sourceCommonDirectory,
) {
  const runPath = canonicalPath(runDirectory);
  assertOutsideGitStorage(runPath, sourceGitDirectory, sourceCommonDirectory);
  if (containsPath(runPath, source)) {
    fail('run directory cannot be source or an ancestor of source');
  }
  if (containsPath(source, runPath)) {
    const parts = relative(source, runPath).split(sep);
    if (
      parts.length !== 2 ||
      parts[0] !== '.history-repair' ||
      parts[1] === ''
    ) {
      fail('source-local run directory must be .history-repair/<run-id>');
    }
  }
  return runPath;
}

function listedWorktreePaths(source) {
  const records = git(source, ['worktree', 'list', '--porcelain', '-z'])
    .toString('utf8')
    .split('\0\0')
    .filter(Boolean);
  return records.map((record) => {
    const field = record
      .split('\0')
      .find((entry) => entry.startsWith('worktree '));
    if (!field) fail('worktree listing omitted a path');
    return realpathSync(field.slice('worktree '.length));
  });
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
  const expectedPaths = inventory.worktrees
    .map(({ path }) => realpathSync(path))
    .sort();
  const actualPaths = listedWorktreePaths(inventory.worktrees[0].path).sort();
  if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) {
    fail('worktree set changed since inventory');
  }
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
  const argv = [
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
  if (paths.signatureAllowlistPath !== null) {
    argv.push('--signature-allowlist', paths.signatureAllowlistPath);
  }
  return argv;
}

function assertSourceUnchanged(source, beforeRefs, beforeWorktrees, inventory) {
  if (!sourceRefState(source).equals(beforeRefs)) {
    fail('source refs changed during rehearsal operation');
  }
  const afterWorktrees = assertFrozenWorktrees(inventory);
  if (JSON.stringify(afterWorktrees) !== JSON.stringify(beforeWorktrees)) {
    fail('source worktrees changed during rehearsal operation');
  }
}

function validateSignaturePlan({
  source,
  inventory,
  ledgerRows,
  signaturePolicy,
  signatureAllowlist,
}) {
  const approvals = validateSignatureAllowlist(
    signaturePolicy,
    signatureAllowlist,
    inventory.objectFormat,
  );
  const changedIdentities = new Map();
  const used = new Set();

  for (const commit of inventory.commits) {
    const row = ledgerRows.get(commit.oid);
    const unavailableParent = commit.parents.find(
      (parent) => !changedIdentities.has(parent),
    );
    if (unavailableParent) {
      fail(`missing parent ${unavailableParent} before commit ${commit.oid}`);
    }
    const identityChanged =
      row.decision === 'change' ||
      commit.parents.some((parent) => changedIdentities.get(parent) === true);
    changedIdentities.set(commit.oid, identityChanged);

    const parsed = parseCommit(git(source, ['cat-file', 'commit', commit.oid]));
    const signatures = parsed.headers.filter(({ name }) =>
      isSignatureHeader(name),
    );
    const inventoriedSignatures = commit.specialHeaders.filter(({ name }) =>
      isSignatureHeader(name),
    );
    if (
      commit.signed !== signatures.length > 0 ||
      signatures.length !== inventoriedSignatures.length ||
      signatures.some(
        (header, index) =>
          header.name !== inventoriedSignatures[index].name ||
          header.value.toString('base64') !==
            inventoriedSignatures[index].valueBase64,
      )
    ) {
      fail(`source commit ${commit.oid} signatures differ from inventory`);
    }
    if (!identityChanged || signatures.length === 0) continue;
    if (signaturePolicy === 'reject') {
      fail(`refusing to rewrite signature-bearing commit ${commit.oid}`);
    }
    for (const header of signatures) {
      const removal = {
        oid: commit.oid,
        header: header.name,
        sha256: signatureHeaderSha256(header),
      };
      const key = signatureApprovalKey(removal);
      if (
        !approvals.some((approval) => signatureApprovalKey(approval) === key) ||
        used.has(key)
      ) {
        fail(
          `refusing to remove ${header.name} from ${commit.oid} without exact signature approval`,
        );
      }
      used.add(key);
    }
  }

  const unused = approvals.find(
    (approval) => !used.has(signatureApprovalKey(approval)),
  );
  if (unused) fail(`unused signature approval ${signatureApprovalKey(unused)}`);
  return approvals;
}

export function prepareRehearsal({
  source,
  runDirectory,
  inventory,
  ledger,
  signaturePolicy = 'reject',
  signatureAllowlist = [],
}) {
  const ledgerRows = validateLedger(inventory, ledger, {
    requireResolved: true,
  });
  assertNoDetachedOnlyCommits(inventory);

  const sourcePath = realpathSync(source);
  const sourceGitDirectory = gitDirectory(sourcePath);
  const sourceCommonDirectory = commonDirectory(sourcePath);
  const runPath = assertSafeRunDirectory(
    runDirectory,
    sourcePath,
    sourceGitDirectory,
    sourceCommonDirectory,
  );
  const approvals = validateSignaturePlan({
    source: sourcePath,
    inventory,
    ledgerRows,
    signaturePolicy,
    signatureAllowlist,
  });

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
    signatureAllowlistPath:
      signaturePolicy === 'remove-approved'
        ? join(runPath, 'signature-allowlist.json')
        : null,
  };
  writeJson(paths.inventoryPath, inventory);
  writeJson(paths.ledgerPath, ledger);
  if (paths.signatureAllowlistPath !== null) {
    writeJson(paths.signatureAllowlistPath, approvals);
  }
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
  const immutablePackage = {
    schemaVersion: 1,
    executable: process.execPath,
    argv: rehearsalArgv(paths),
    source: sourcePath,
    sourceGitDirectory,
    sourceCommonDirectory,
    runDirectory: runPath,
    ...paths,
    inventoryDigest: digestJson(inventory),
    ledgerDigest: digestJson(ledger),
    backupDigest: digestFile(paths.backupPath),
    sourceRefStateBase64: beforeRefs.toString('base64'),
    refs,
    worktrees: beforeWorktrees,
    signaturePolicy,
    signatureAllowlist: approvals,
    signatureAllowlistDigest: digestJson(approvals),
    backupVerified: true,
    warnings,
  };
  const approvalPackage = {
    ...immutablePackage,
    approvalDigest: digestJson(immutablePackage),
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

function immutableApprovalRecord(approval) {
  const {
    approvalDigest: _approvalDigest,
    approvalEvidence: _approvalEvidence,
    ...immutable
  } = approval;
  return immutable;
}

function validateApproval(approval) {
  assertRecord(approval, 'approval', APPROVAL_KEYS);
  if (approval.schemaVersion !== 1) fail('approval schemaVersion must be 1');
  if (
    typeof approval.approvalDigest !== 'string' ||
    !/^[0-9a-f]{64}$/.test(approval.approvalDigest) ||
    digestJson(immutableApprovalRecord(approval)) !== approval.approvalDigest
  ) {
    fail('approval package digest does not match immutable package fields');
  }
  if (approval.approvalEvidence !== null) {
    assertRecord(approval.approvalEvidence, 'approval evidence', [
      'approvalDigest',
      'kind',
      'statement',
    ]);
  }
  if (
    approval.approvalEvidence === null ||
    typeof approval.approvalEvidence !== 'object' ||
    Array.isArray(approval.approvalEvidence) ||
    approval.approvalEvidence.kind !== 'direct-user-approval' ||
    approval.approvalEvidence.approvalDigest !== approval.approvalDigest ||
    typeof approval.approvalEvidence.statement !== 'string' ||
    approval.approvalEvidence.statement.trim() === ''
  ) {
    fail('direct user approval evidence is required');
  }
  if (approval.signaturePolicy !== 'reject') {
    if (approval.signaturePolicy !== 'remove-approved') {
      fail('approval signature policy is unsupported');
    }
  }
  const approvals = validateSignatureAllowlist(
    approval.signaturePolicy,
    approval.signatureAllowlist,
  );
  if (
    typeof approval.signatureAllowlistDigest !== 'string' ||
    !/^[0-9a-f]{64}$/.test(approval.signatureAllowlistDigest) ||
    digestJson(approvals) !== approval.signatureAllowlistDigest
  ) {
    fail('approval signature allowlist digest does not match');
  }
  if (
    (approval.signaturePolicy === 'reject' &&
      approval.signatureAllowlistPath !== null) ||
    (approval.signaturePolicy === 'remove-approved' &&
      typeof approval.signatureAllowlistPath !== 'string')
  ) {
    fail('approval signature allowlist path does not match policy');
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
  const destinationPath = canonicalPath(destination);
  const approvedRunDirectory = assertSafeRunDirectory(
    approval.runDirectory,
    approval.source,
    approval.sourceGitDirectory,
    approval.sourceCommonDirectory,
  );
  if (approvedRunDirectory !== approval.runDirectory) {
    fail('approved run directory is not canonical');
  }
  assertOutsideGitStorage(
    destinationPath,
    approval.sourceGitDirectory,
    approval.sourceCommonDirectory,
  );
  if (containsPath(destinationPath, approval.source)) {
    fail('destination must differ from source and its ancestors');
  }
  if (!containsPath(approvedRunDirectory, destinationPath)) {
    fail('destination must remain inside the approved run directory');
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
  if (
    approval.signatureAllowlistPath !== null &&
    canonicalPath(approval.signatureAllowlistPath) !==
      join(approvedRunDirectory, 'signature-allowlist.json')
  ) {
    fail('signature allowlist must remain at its protected run path');
  }
  if (
    canonicalPath(approval.reportPath) !==
    join(approvedRunDirectory, 'report.json')
  ) {
    fail('report must remain at its protected run path');
  }
  return destinationPath;
}

function normalizeInvocation(invocation) {
  assertRecord(invocation, 'invocation', ['argv', 'executable']);
  if (!Array.isArray(invocation.argv)) fail('invocation argv must be an array');
  const argv = invocation.argv.map((value) => {
    if (typeof value !== 'string') fail('invocation argv must contain strings');
    return value;
  });
  if ((argv.length !== 14 && argv.length !== 16) || argv[1] !== 'rehearse') {
    fail('actual invocation differs from approved arguments');
  }
  const normalizedArgv = [canonicalPath(argv[0]), argv[1]];
  for (let index = 2; index < argv.length; index += 2) {
    normalizedArgv.push(argv[index], canonicalPath(argv[index + 1]));
  }
  return {
    executable: canonicalPath(invocation.executable),
    argv: normalizedArgv,
  };
}

function assertApprovedInputs({
  backup,
  inventory,
  ledger,
  signatureAllowlist,
  approval,
  invocation,
}) {
  const actualInvocation = normalizeInvocation(invocation);
  const approvedInvocation = {
    executable: canonicalPath(approval.executable),
    argv: approval.argv,
  };
  if (JSON.stringify(actualInvocation) !== JSON.stringify(approvedInvocation)) {
    fail('actual invocation differs from approved arguments');
  }
  if (canonicalPath(backup) !== approval.backupPath) {
    fail('backup differs from approved path');
  }
  if (digestJson(inventory) !== approval.inventoryDigest) {
    fail('inventory digest differs from approval');
  }
  if (digestJson(ledger) !== approval.ledgerDigest) {
    fail('ledger digest differs from approval');
  }
  if (digestJson(signatureAllowlist) !== approval.signatureAllowlistDigest) {
    fail('signature allowlist digest differs from approval');
  }
  if (approval.signatureAllowlistPath !== null) {
    let frozenAllowlist;
    try {
      frozenAllowlist = JSON.parse(
        readFileSync(approval.signatureAllowlistPath, 'utf8'),
      );
    } catch (error) {
      fail(`cannot read approved signature allowlist: ${error.message}`);
    }
    if (digestJson(frozenAllowlist) !== approval.signatureAllowlistDigest) {
      fail('frozen signature allowlist digest differs from approval');
    }
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
  if (gitDirectory(approval.source) !== approval.sourceGitDirectory) {
    fail('source Git directory differs from approval');
  }
  return currentRefs;
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

export function rehearse({
  backup,
  destination,
  inventory,
  ledger,
  signatureAllowlist = [],
  approval,
  invocation,
}) {
  validateApproval(approval);
  validateLedger(inventory, ledger, { requireResolved: true });
  assertNoDetachedOnlyCommits(inventory);
  const destinationPath = assertSafeDestination(destination, approval);
  const beforeRefs = assertApprovedInputs({
    backup,
    inventory,
    ledger,
    signatureAllowlist,
    approval,
    invocation,
  });
  const beforeWorktrees = assertFrozenWorktrees(inventory);
  if (JSON.stringify(beforeWorktrees) !== JSON.stringify(approval.worktrees)) {
    fail('approved worktrees differ from exact frozen worktrees');
  }
  if (existsSync(approval.reportPath)) {
    fail(`report output already exists: ${approval.reportPath}`);
  }
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
    signaturePolicy: approval.signaturePolicy,
    signatureAllowlist,
  });
  const verification = verifyMapping({
    source: destinationPath,
    destination: destinationPath,
    inventory,
    ledger,
    mapping,
    signaturePolicy: approval.signaturePolicy,
    signatureAllowlist,
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
    signatureAllowlistDigest: approval.signatureAllowlistDigest,
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
    signaturePolicy: approval.signaturePolicy,
    signatureHandling: {
      policy: approval.signaturePolicy,
      signedCommitCount: inventory.commits.filter(({ signed }) => signed)
        .length,
      approvedHeaderCount: signatureAllowlist.length,
      removedHeaderCount: verification.signatureRemovals.length,
      removedHeaders: verification.signatureRemovals,
      annotatedTagCount: 0,
    },
    failures: [],
  };
  writeJson(approval.reportPath, report);
  return report;
}
