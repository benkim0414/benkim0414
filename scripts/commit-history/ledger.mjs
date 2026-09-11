import { TextDecoder } from 'node:util';

const INVENTORY_KEYS = [
  'schemaVersion',
  'objectFormat',
  'refs',
  'worktrees',
  'commits',
];
const REF_KEYS = ['name', 'oid', 'role', 'reason'];
const WORKTREE_KEYS = ['path', 'head', 'branch', 'statusPorcelain'];
const COMMIT_KEYS = [
  'oid',
  'tree',
  'parents',
  'messageBase64',
  'containingRefs',
  'paths',
  'signed',
  'specialHeaders',
];
const PATH_RECORD_KEYS = ['parent', 'paths'];
const SPECIAL_HEADER_KEYS = ['name', 'valueBase64'];
const ROW_KEYS = [
  'oid',
  'decision',
  'originalMessageBase64',
  'replacementMessageBase64',
  'domain',
  'reason',
  'evidence',
  'changeKind',
  'releaseEffect',
  'containingRefs',
];
const EVIDENCE_KEYS = ['path', 'explanation'];
const DECISIONS = new Set(['keep', 'change', 'manual-review']);
const CHANGE_KINDS = new Set([
  'none',
  'scope',
  'separately-approved-message-change',
]);
// This is release-classifier eligibility for the effective message, not a version delta.
// Task 7 computes before/after version bumps separately during replay verification.
const RELEASE_EFFECTS = new Set(['releasing', 'nonreleasing', 'unreviewed']);
const REF_ROLES = new Set(['target', 'tracking', 'preserve']);
const SPECIAL_HEADER_NAMES = new Set([
  'encoding',
  'gpgsig',
  'gpgsig-sha256',
  'mergetag',
]);

function fail(message) {
  throw new Error(message);
}

function assertRecord(value, label, keys) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  for (const key of keys) {
    if (!Object.hasOwn(value, key)) fail(`${label} is missing ${key}`);
  }
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) fail(`${label} has unknown field ${key}`);
  }
}

function assertArray(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
}

function assertString(value, label, { nonempty = false } = {}) {
  if (typeof value !== 'string' || (nonempty && value.trim() === '')) {
    fail(`${label} must be ${nonempty ? 'a non-empty string' : 'a string'}`);
  }
}

function oidPattern(objectFormat) {
  if (objectFormat === 'sha1') return /^[0-9a-f]{40}$/;
  if (objectFormat === 'sha256') return /^[0-9a-f]{64}$/;
  fail(`inventory objectFormat has unknown value ${String(objectFormat)}`);
}

function assertOid(value, label, pattern) {
  if (typeof value !== 'string' || !pattern.test(value))
    fail(`${label} must be a full OID`);
}

function decodeBase64(value, label) {
  assertString(value, label);
  if (
    value.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      value,
    )
  ) {
    fail(`${label} must use canonical base64`);
  }
  const decoded = Buffer.from(value, 'base64');
  if (decoded.toString('base64') !== value)
    fail(`${label} must use canonical base64`);
  return decoded;
}

function assertStringSet(values, label) {
  assertArray(values, label);
  const seen = new Set();
  for (const [index, value] of values.entries()) {
    assertString(value, `${label}[${index}]`, { nonempty: true });
    if (seen.has(value)) fail(`${label} contains duplicate ${value}`);
    seen.add(value);
  }
  return seen;
}

function validateInventory(inventory) {
  assertRecord(inventory, 'inventory', INVENTORY_KEYS);
  if (inventory.schemaVersion !== 1) fail('inventory schemaVersion must be 1');
  const pattern = oidPattern(inventory.objectFormat);

  assertArray(inventory.refs, 'inventory refs');
  const refNames = new Set();
  for (const [index, ref] of inventory.refs.entries()) {
    const label = `inventory refs[${index}]`;
    assertRecord(ref, label, REF_KEYS);
    assertString(ref.name, `${label}.name`, { nonempty: true });
    if (!ref.name.startsWith('refs/'))
      fail(`${label}.name must be a full ref name`);
    if (refNames.has(ref.name)) fail(`inventory has duplicate ref ${ref.name}`);
    refNames.add(ref.name);
    assertOid(ref.oid, `${label}.oid`, pattern);
    if (!REF_ROLES.has(ref.role))
      fail(`${label}.role has unknown value ${String(ref.role)}`);
    assertString(ref.reason, `${label}.reason`, { nonempty: true });
  }

  assertArray(inventory.worktrees, 'inventory worktrees');
  for (const [index, worktree] of inventory.worktrees.entries()) {
    const label = `inventory worktrees[${index}]`;
    assertRecord(worktree, label, WORKTREE_KEYS);
    assertString(worktree.path, `${label}.path`, { nonempty: true });
    assertOid(worktree.head, `${label}.head`, pattern);
    if (worktree.branch !== null) {
      assertString(worktree.branch, `${label}.branch`, { nonempty: true });
      if (!worktree.branch.startsWith('refs/heads/')) {
        fail(`${label}.branch must be null or a full local branch ref`);
      }
    }
    assertString(worktree.statusPorcelain, `${label}.statusPorcelain`);
  }

  assertArray(inventory.commits, 'inventory commits');
  const commits = new Map();
  for (const [index, commit] of inventory.commits.entries()) {
    const label = `inventory commits[${index}]`;
    assertRecord(commit, label, COMMIT_KEYS);
    assertOid(commit.oid, `${label}.oid`, pattern);
    if (commits.has(commit.oid))
      fail(`inventory has duplicate commit ${commit.oid}`);
    assertOid(commit.tree, `${label}.tree`, pattern);
    assertArray(commit.parents, `${label}.parents`);
    for (const [parentIndex, parent] of commit.parents.entries()) {
      assertOid(parent, `${label}.parents[${parentIndex}]`, pattern);
    }
    decodeBase64(commit.messageBase64, `${label}.messageBase64`);
    const commitRefs = assertStringSet(
      commit.containingRefs,
      `${label}.containingRefs`,
    );
    for (const refName of commitRefs) {
      if (!refNames.has(refName))
        fail(`${label}.containingRefs contains unknown ref ${refName}`);
    }

    assertArray(commit.paths, `${label}.paths`);
    const expectedParents =
      commit.parents.length === 0 ? [null] : commit.parents;
    if (commit.paths.length !== expectedParents.length) {
      fail(`${label}.paths must have one record per parent`);
    }
    for (const [pathIndex, pathRecord] of commit.paths.entries()) {
      const pathLabel = `${label}.paths[${pathIndex}]`;
      assertRecord(pathRecord, pathLabel, PATH_RECORD_KEYS);
      if (pathRecord.parent !== expectedParents[pathIndex]) {
        fail(`${pathLabel}.parent does not match the ordered commit parent`);
      }
      assertStringSet(pathRecord.paths, `${pathLabel}.paths`);
    }

    if (typeof commit.signed !== 'boolean')
      fail(`${label}.signed must be a boolean`);
    assertArray(commit.specialHeaders, `${label}.specialHeaders`);
    let signatureHeader = false;
    let encoding = null;
    for (const [headerIndex, header] of commit.specialHeaders.entries()) {
      const headerLabel = `${label}.specialHeaders[${headerIndex}]`;
      assertRecord(header, headerLabel, SPECIAL_HEADER_KEYS);
      if (!SPECIAL_HEADER_NAMES.has(header.name)) {
        fail(`${headerLabel}.name has unknown value ${String(header.name)}`);
      }
      const value = decodeBase64(
        header.valueBase64,
        `${headerLabel}.valueBase64`,
      );
      if (header.name === 'gpgsig' || header.name === 'gpgsig-sha256')
        signatureHeader = true;
      if (header.name === 'encoding') {
        if (encoding !== null) fail(`${label} has duplicate encoding headers`);
        encoding = value.toString('ascii');
        try {
          new TextDecoder(encoding, { fatal: true });
        } catch {
          fail(`${label} has unrecognized message encoding ${encoding}`);
        }
      }
    }
    if (commit.signed !== signatureHeader)
      fail(`${label}.signed does not match signature headers`);
    commits.set(commit.oid, { ...commit, encoding: encoding ?? 'utf-8' });
  }

  return { commits, pattern };
}

function equalSets(left, right) {
  return (
    left.size === right.size && [...left].every((value) => right.has(value))
  );
}

function parseConventionalMessage(messageBytes, encoding, label) {
  let header;
  const newline = messageBytes.indexOf(0x0a);
  const headerBytes =
    newline === -1 ? messageBytes : messageBytes.subarray(0, newline);
  const body =
    newline === -1 ? Buffer.alloc(0) : messageBytes.subarray(newline + 1);
  try {
    header = new TextDecoder(encoding, { fatal: true }).decode(headerBytes);
  } catch {
    fail(`${label} is not valid ${encoding} text`);
  }
  const match =
    /^(?<type>[A-Za-z][A-Za-z0-9-]*)(?:\((?<scope>[^()\r\n]+)\))?(?<breaking>!)?: (?<description>.+)$/.exec(
      header,
    );
  if (!match) fail(`${label} does not have a conventional commit header`);
  return {
    type: match.groups.type,
    scope: match.groups.scope ?? null,
    breaking: match.groups.breaking === '!',
    description: match.groups.description,
    body,
  };
}

function validateScopeChange(commit, original, replacement) {
  const before = parseConventionalMessage(
    original,
    commit.encoding,
    `commit ${commit.oid} original message`,
  );
  const after = parseConventionalMessage(
    replacement,
    commit.encoding,
    `commit ${commit.oid} replacement message`,
  );
  if (!before.body.equals(after.body))
    fail(`commit ${commit.oid} scope change altered body bytes`);
  if (before.type !== after.type)
    fail(`commit ${commit.oid} scope change altered type`);
  if (before.description !== after.description) {
    fail(`commit ${commit.oid} scope change altered description`);
  }
  if (before.breaking !== after.breaking) {
    fail(`commit ${commit.oid} scope change altered breaking marker`);
  }
  if (before.scope === after.scope)
    fail(`commit ${commit.oid} scope change did not change scope`);
}

function validateRow(row, index, commit, pattern) {
  const label = `ledger rows[${index}]`;
  assertRecord(row, label, ROW_KEYS);
  assertOid(row.oid, `${label}.oid`, pattern);
  if (!DECISIONS.has(row.decision))
    fail(`${label}.decision has unknown value ${String(row.decision)}`);
  if (!CHANGE_KINDS.has(row.changeKind)) {
    fail(`${label}.changeKind has unknown value ${String(row.changeKind)}`);
  }
  if (!RELEASE_EFFECTS.has(row.releaseEffect)) {
    fail(
      `${label}.releaseEffect has unknown value ${String(row.releaseEffect)}`,
    );
  }
  if (row.releaseEffect === 'unreviewed' && row.decision !== 'manual-review') {
    fail(
      `${label}.releaseEffect unreviewed is only valid for manual-review decisions`,
    );
  }
  if (row.decision === 'manual-review' && row.releaseEffect !== 'unreviewed') {
    fail(
      `${label}.releaseEffect must be unreviewed for manual-review decisions`,
    );
  }
  assertString(row.domain, `${label}.domain`, { nonempty: true });
  assertString(row.reason, `${label}.reason`, { nonempty: true });
  const original = decodeBase64(
    row.originalMessageBase64,
    `${label}.originalMessageBase64`,
  );
  if (
    !original.equals(
      decodeBase64(
        commit.messageBase64,
        `inventory commit ${commit.oid} messageBase64`,
      ),
    )
  ) {
    fail(
      `ledger row ${commit.oid} original message bytes differ from inventory`,
    );
  }

  assertArray(row.evidence, `${label}.evidence`);
  for (const [evidenceIndex, evidence] of row.evidence.entries()) {
    const evidenceLabel = `${label}.evidence[${evidenceIndex}]`;
    assertRecord(evidence, evidenceLabel, EVIDENCE_KEYS);
    assertString(evidence.path, `${evidenceLabel}.path`, { nonempty: true });
    assertString(evidence.explanation, `${evidenceLabel}.explanation`, {
      nonempty: true,
    });
  }
  const rowRefs = assertStringSet(
    row.containingRefs,
    `${label}.containingRefs`,
  );
  const commitRefs = new Set(commit.containingRefs);
  if (!equalSets(rowRefs, commitRefs))
    fail(`ledger row ${commit.oid} containing refs differ from inventory`);

  if (row.decision === 'change') {
    if (row.replacementMessageBase64 === null)
      fail(`${label}.replacementMessageBase64 is required`);
    const replacement = decodeBase64(
      row.replacementMessageBase64,
      `${label}.replacementMessageBase64`,
    );
    if (replacement.equals(original))
      fail(`ledger row ${commit.oid} replacement message is unchanged`);
    if (row.changeKind === 'scope')
      validateScopeChange(commit, original, replacement);
    else if (row.changeKind === 'separately-approved-message-change') {
      if (row.evidence.length === 0)
        fail(`ledger row ${commit.oid} lacks explicit approval evidence`);
    } else {
      fail(`${label}.changeKind must authorize the message change`);
    }
  } else {
    if (row.replacementMessageBase64 !== null) {
      fail(
        `${label}.replacementMessageBase64 must be null unless decision is change`,
      );
    }
    if (row.changeKind !== 'none')
      fail(`${label}.changeKind must be none unless decision is change`);
  }
}

export function validateLedger(inventory, rows, { requireResolved }) {
  const { commits, pattern } = validateInventory(inventory);
  assertArray(rows, 'ledger rows');
  if (typeof requireResolved !== 'boolean')
    fail('requireResolved must be a boolean');

  const byOid = new Map();
  for (const [index, row] of rows.entries()) {
    if (row === null || typeof row !== 'object' || Array.isArray(row)) {
      fail(`ledger rows[${index}] must be an object`);
    }
    const oid = row.oid;
    if (byOid.has(oid)) fail(`duplicate decision for commit ${String(oid)}`);
    const commit = commits.get(oid);
    if (!commit) fail(`unknown commit ${String(oid)} in ledger`);
    validateRow(row, index, commit, pattern);
    byOid.set(oid, row);
  }

  for (const oid of commits.keys()) {
    if (!byOid.has(oid)) fail(`missing decision for commit ${oid}`);
  }
  if (requireResolved) {
    const unresolved = rows.find(
      ({ decision }) => decision === 'manual-review',
    );
    if (unresolved)
      fail(`unresolved manual-review decision for commit ${unresolved.oid}`);
  }
  return byOid;
}
