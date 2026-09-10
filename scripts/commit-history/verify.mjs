import { git } from './git.mjs';
import { validateLedger } from './ledger.mjs';
import {
  isSignatureHeader,
  parseCommit,
  signatureApprovalKey,
  signatureHeaderSha256,
  validateSignatureAllowlist,
} from './objects.mjs';

function fail(message) {
  throw new Error(message);
}

function oidPattern(objectFormat) {
  if (objectFormat === 'sha1') return /^[0-9a-f]{40}$/;
  if (objectFormat === 'sha256') return /^[0-9a-f]{64}$/;
  fail(`unknown object format ${String(objectFormat)}`);
}

function headerValues(parsed, name) {
  return parsed.headers
    .filter((header) => header.name === name)
    .map(({ value }) => value.toString('ascii'));
}

function treeOf(parsed, label) {
  const trees = headerValues(parsed, 'tree');
  if (trees.length !== 1) fail(`${label} must contain exactly one tree header`);
  return trees[0];
}

function parentsOf(parsed) {
  return headerValues(parsed, 'parent');
}

function equalArrays(left, right) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function headersEqual(expected, destination) {
  return (
    expected.length === destination.headers.length &&
    expected.every(
      (header, index) =>
        header.name === destination.headers[index].name &&
        header.value.equals(destination.headers[index].value),
    )
  );
}

function expectedHeaders({
  source,
  oldOid,
  newOid,
  byOld,
  signaturePolicy,
  approvals,
  usedApprovals,
  removals,
}) {
  const identityChanged = oldOid !== newOid;
  return source.headers.flatMap((header) => {
    if (header.name === 'parent') {
      return [
        {
          name: header.name,
          value: Buffer.from(
            byOld.get(header.value.toString('ascii')),
            'ascii',
          ),
        },
      ];
    }
    if (!identityChanged || !isSignatureHeader(header.name)) {
      return [header];
    }
    if (signaturePolicy === 'reject') {
      fail(`refusing changed identity for signature-bearing commit ${oldOid}`);
    }
    const removal = {
      oid: oldOid,
      header: header.name,
      sha256: signatureHeaderSha256(header),
    };
    const key = signatureApprovalKey(removal);
    if (
      !approvals.some((approval) => signatureApprovalKey(approval) === key) ||
      usedApprovals.has(key)
    ) {
      fail(
        `refusing changed identity for signature-bearing commit ${oldOid} without exact signature approval`,
      );
    }
    usedApprovals.add(key);
    removals.push(removal);
    return [];
  });
}

function validateMapping(inventory, mapping) {
  if (!Array.isArray(mapping)) fail('mapping must be an array');
  if (mapping.length !== inventory.commits.length) {
    fail(
      `mapping count ${mapping.length} differs from inventory count ${inventory.commits.length}`,
    );
  }

  const pattern = oidPattern(inventory.objectFormat);
  const inventoryOids = new Set(inventory.commits.map(({ oid }) => oid));
  const byOld = new Map();
  const newOids = new Set();
  for (const [index, row] of mapping.entries()) {
    if (
      row === null ||
      typeof row !== 'object' ||
      Array.isArray(row) ||
      Object.keys(row).length !== 2 ||
      !Object.hasOwn(row, 'oldOid') ||
      !Object.hasOwn(row, 'newOid')
    ) {
      fail(`mapping[${index}] must contain only oldOid and newOid`);
    }
    if (typeof row.oldOid !== 'string' || !pattern.test(row.oldOid)) {
      fail(`mapping[${index}].oldOid must be a full OID`);
    }
    if (typeof row.newOid !== 'string' || !pattern.test(row.newOid)) {
      fail(`mapping[${index}].newOid must be a full OID`);
    }
    if (!inventoryOids.has(row.oldOid)) {
      fail(`mapping contains unknown old OID ${row.oldOid}`);
    }
    if (byOld.has(row.oldOid))
      fail(`mapping has duplicate old OID ${row.oldOid}`);
    if (newOids.has(row.newOid)) {
      fail(`mapping has duplicate new OID ${row.newOid}`);
    }
    byOld.set(row.oldOid, row.newOid);
    newOids.add(row.newOid);
  }
  for (const oid of inventoryOids) {
    if (!byOld.has(oid)) fail(`mapping coverage is missing old OID ${oid}`);
  }
  return byOld;
}

export function verifyMapping({
  source,
  destination,
  inventory,
  ledger,
  mapping,
  signaturePolicy = 'reject',
  signatureAllowlist = [],
}) {
  const ledgerRows = validateLedger(inventory, ledger, {
    requireResolved: true,
  });
  const approvals = validateSignatureAllowlist(
    signaturePolicy,
    signatureAllowlist,
    inventory.objectFormat,
  );
  const usedSignatureApprovals = new Set();
  const signatureRemovals = [];
  const byOld = validateMapping(inventory, mapping);
  const parsedPairs = inventory.commits.map((commit) => ({
    commit,
    source: parseCommit(git(source, ['cat-file', 'commit', commit.oid])),
    destination: parseCommit(
      git(destination, ['cat-file', 'commit', byOld.get(commit.oid)]),
    ),
  }));

  const rootCount = inventory.commits.filter(
    ({ parents }) => parents.length === 0,
  ).length;
  const destinationRootCount = parsedPairs.filter(
    ({ destination: parsed }) => parentsOf(parsed).length === 0,
  ).length;
  if (destinationRootCount !== rootCount) {
    fail(
      `destination root count differs: expected ${rootCount}, received ${destinationRootCount}`,
    );
  }

  for (const {
    commit,
    source: sourceCommit,
    destination: newCommit,
  } of parsedPairs) {
    const newOid = byOld.get(commit.oid);
    const sourceTree = treeOf(sourceCommit, `source commit ${commit.oid}`);
    const destinationTree = treeOf(newCommit, `destination commit ${newOid}`);
    if (sourceTree !== commit.tree) {
      fail(`source commit ${commit.oid} tree differs from inventory`);
    }
    if (destinationTree !== sourceTree) {
      fail(`destination commit ${newOid} tree differs from source`);
    }

    const sourceParents = parentsOf(sourceCommit);
    if (!equalArrays(sourceParents, commit.parents)) {
      fail(`source commit ${commit.oid} parents differ from inventory`);
    }
    const expectedParents = sourceParents.map((parent) => byOld.get(parent));
    if (expectedParents.some((parent) => parent === undefined)) {
      fail(`source commit ${commit.oid} has an unmapped parent`);
    }
    if (
      sourceCommit.headers.some(({ name }) => name === 'mergetag') &&
      sourceParents.some((parent, index) => parent !== expectedParents[index])
    ) {
      fail(`refusing remapped parent for mergetag commit ${commit.oid}`);
    }
    if (!equalArrays(parentsOf(newCommit), expectedParents)) {
      fail(`destination commit ${newOid} parents differ from mapped parents`);
    }

    const inventoryMessage = Buffer.from(commit.messageBase64, 'base64');
    if (!sourceCommit.message.equals(inventoryMessage)) {
      fail(`source commit ${commit.oid} message differs from inventory`);
    }
    const row = ledgerRows.get(commit.oid);
    const expectedMessage =
      row.decision === 'change'
        ? Buffer.from(row.replacementMessageBase64, 'base64')
        : sourceCommit.message;
    if (!newCommit.message.equals(expectedMessage)) {
      fail(`destination commit ${newOid} message differs from ledger`);
    }
    const expected = expectedHeaders({
      source: sourceCommit,
      oldOid: commit.oid,
      newOid,
      byOld,
      signaturePolicy,
      approvals,
      usedApprovals: usedSignatureApprovals,
      removals: signatureRemovals,
    });
    if (!headersEqual(expected, newCommit)) {
      fail(
        `destination commit ${newOid} header order or metadata differs from source`,
      );
    }
  }

  const unused = approvals.find(
    (approval) => !usedSignatureApprovals.has(signatureApprovalKey(approval)),
  );
  if (unused) {
    fail(`unused signature approval ${signatureApprovalKey(unused)}`);
  }

  return {
    commitCount: mapping.length,
    rootCount,
    treesEqual: true,
    parentsEqual: true,
    messagesEqual: true,
    metadataEqual: true,
    signatureRemovals,
  };
}
