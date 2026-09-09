import { git } from './git.mjs';
import { validateLedger } from './ledger.mjs';
import { transformCommit } from './objects.mjs';

export function rewriteObjects({ cwd, inventory, ledger }) {
  const rows = validateLedger(inventory, ledger, { requireResolved: true });
  const parentMap = new Map();
  const mapping = [];

  for (const commit of inventory.commits) {
    for (const parent of commit.parents) {
      if (!parentMap.has(parent)) {
        throw new Error(
          `missing mapped parent ${parent} before commit ${commit.oid}`,
        );
      }
    }

    const row = rows.get(commit.oid);
    const original = git(cwd, ['cat-file', 'commit', commit.oid]);
    const rewritten = transformCommit(original, {
      parentMap,
      replacementMessage:
        row.decision === 'change'
          ? Buffer.from(row.replacementMessageBase64, 'base64')
          : null,
      signaturePolicy: 'reject',
    });
    const newOid = rewritten.equals(original)
      ? commit.oid
      : git(cwd, ['hash-object', '-t', 'commit', '-w', '--stdin'], rewritten)
          .toString('ascii')
          .trim();

    parentMap.set(commit.oid, newOid);
    mapping.push({ oldOid: commit.oid, newOid });
  }

  return mapping;
}
