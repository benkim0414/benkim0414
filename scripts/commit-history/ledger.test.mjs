import test from 'node:test';
import assert from 'node:assert/strict';

import { validateLedger } from './ledger.mjs';

const firstOid = '1'.repeat(40);
const secondOid = '2'.repeat(40);
const firstOriginal = Buffer.from(
  'feat(skills): add search\n\nPreserve this body byte-for-byte.\n',
).toString('base64');
const secondOriginal = Buffer.from(
  'docs(workflow): explain migration\n',
).toString('base64');

function completeInventory() {
  return {
    schemaVersion: 1,
    objectFormat: 'sha1',
    refs: [
      {
        name: 'refs/heads/main',
        oid: secondOid,
        role: 'target',
        reason: 'local branch',
      },
    ],
    worktrees: [
      {
        path: '/fixture/repository',
        head: secondOid,
        branch: 'refs/heads/main',
        statusPorcelain: '',
      },
    ],
    commits: [
      {
        oid: firstOid,
        tree: 'a'.repeat(40),
        parents: [],
        messageBase64: firstOriginal,
        containingRefs: ['refs/heads/main'],
        paths: [{ parent: null, paths: ['skills/search.mjs'] }],
        signed: false,
        specialHeaders: [],
      },
      {
        oid: secondOid,
        tree: 'b'.repeat(40),
        parents: [firstOid],
        messageBase64: secondOriginal,
        containingRefs: ['refs/heads/main'],
        paths: [{ parent: firstOid, paths: ['docs/migration.md'] }],
        signed: false,
        specialHeaders: [],
      },
    ],
  };
}

function keepRow(oid = firstOid) {
  const commit = completeInventory().commits.find(
    (candidate) => candidate.oid === oid,
  );
  return {
    oid,
    decision: 'keep',
    originalMessageBase64: commit.messageBase64,
    replacementMessageBase64: null,
    domain: oid === firstOid ? 'skills' : 'workflow',
    reason: 'scope is already accurate',
    evidence: [
      { path: 'docs/commit-audit.md', explanation: 'manual ownership review' },
    ],
    changeKind: 'none',
    releaseEffect: 'nonreleasing',
    containingRefs: ['refs/heads/main'],
  };
}

test('a syntactically valid header is not a complete decision ledger', () => {
  const inventory = completeInventory();
  assert.throws(
    () => validateLedger(inventory, [], { requireResolved: true }),
    /missing decision/,
  );
  assert.throws(
    () =>
      validateLedger(
        inventory,
        [
          {
            oid: firstOid,
            decision: 'manual-review',
            originalMessageBase64: firstOriginal,
            replacementMessageBase64: null,
            domain: 'github.io',
            reason: 'ownership unresolved',
            evidence: [],
            changeKind: 'none',
            releaseEffect: 'unreviewed',
            containingRefs: ['refs/heads/main'],
          },
          keepRow(secondOid),
        ],
        { requireResolved: true },
      ),
    /unresolved/,
  );
});

test('ledger OIDs must equal the inventory OID set exactly', async (t) => {
  const inventory = completeInventory();
  await t.test('rejects an unknown SHA', () => {
    const unknown = { ...keepRow(), oid: '3'.repeat(40) };
    assert.throws(
      () =>
        validateLedger(inventory, [keepRow(), unknown, keepRow(secondOid)], {
          requireResolved: false,
        }),
      /unknown commit/,
    );
  });
  await t.test('rejects a duplicate row', () => {
    assert.throws(
      () =>
        validateLedger(inventory, [keepRow(), keepRow(), keepRow(secondOid)], {
          requireResolved: false,
        }),
      /duplicate decision/,
    );
  });
  await t.test('rejects a missing row', () => {
    assert.throws(
      () => validateLedger(inventory, [keepRow()], { requireResolved: false }),
      /missing decision/,
    );
  });
});

test('ledger rejects changed original message bytes and containing refs', async (t) => {
  await t.test('changed original bytes', () => {
    const row = keepRow();
    row.originalMessageBase64 = Buffer.from('feat(skills): changed\n').toString(
      'base64',
    );
    assert.throws(
      () =>
        validateLedger(completeInventory(), [row, keepRow(secondOid)], {
          requireResolved: false,
        }),
      /original message bytes/,
    );
  });
  await t.test('changed containing refs', () => {
    const row = keepRow();
    row.containingRefs = [];
    assert.throws(
      () =>
        validateLedger(completeInventory(), [row, keepRow(secondOid)], {
          requireResolved: false,
        }),
      /containing refs/,
    );
  });
});

test('ledger rejects omissions, unknown enums, non-canonical base64, and changes without reasons', async (t) => {
  await t.test('omitted field', () => {
    const row = keepRow();
    delete row.releaseEffect;
    assert.throws(
      () =>
        validateLedger(completeInventory(), [row, keepRow(secondOid)], {
          requireResolved: false,
        }),
      /releaseEffect/,
    );
  });
  await t.test('unknown decision', () => {
    const row = keepRow();
    row.decision = 'rewrite';
    assert.throws(
      () =>
        validateLedger(completeInventory(), [row, keepRow(secondOid)], {
          requireResolved: false,
        }),
      /decision/,
    );
  });
  await t.test('unreviewed release effect on a resolved decision', () => {
    const row = keepRow();
    row.releaseEffect = 'unreviewed';
    assert.throws(
      () =>
        validateLedger(completeInventory(), [row, keepRow(secondOid)], {
          requireResolved: false,
        }),
      /releaseEffect.*manual-review/,
    );
  });
  await t.test('unrecognized message encoding', () => {
    const row = keepRow();
    row.originalMessageBase64 = 'not base64!';
    assert.throws(
      () =>
        validateLedger(completeInventory(), [row, keepRow(secondOid)], {
          requireResolved: false,
        }),
      /base64/,
    );
  });
  await t.test('unrecognized commit message character encoding', () => {
    const inventory = completeInventory();
    inventory.commits[0].specialHeaders = [
      {
        name: 'encoding',
        valueBase64: Buffer.from('x-invalid-encoding').toString('base64'),
      },
    ];
    assert.throws(
      () =>
        validateLedger(inventory, [keepRow(), keepRow(secondOid)], {
          requireResolved: false,
        }),
      /encoding/,
    );
  });
  await t.test('change without a reason', () => {
    const row = keepRow();
    row.decision = 'change';
    row.replacementMessageBase64 = Buffer.from(
      'feat(github.io): add search\n\nPreserve this body byte-for-byte.\n',
    ).toString('base64');
    row.changeKind = 'scope';
    row.reason = '';
    assert.throws(
      () =>
        validateLedger(completeInventory(), [row, keepRow(secondOid)], {
          requireResolved: true,
        }),
      /reason/,
    );
  });
});

test('scope changes preserve conventional header semantics and exact body bytes', async (t) => {
  function scopeRow(replacement) {
    const row = keepRow();
    row.decision = 'change';
    row.changeKind = 'scope';
    row.replacementMessageBase64 = Buffer.from(replacement).toString('base64');
    row.reason = 'historical project ownership is github.io';
    return row;
  }

  const valid = scopeRow(
    'feat(github.io): add search\n\nPreserve this body byte-for-byte.\n',
  );
  const validated = validateLedger(
    completeInventory(),
    [valid, keepRow(secondOid)],
    {
      requireResolved: true,
    },
  );
  assert.equal(validated.get(firstOid), valid);

  await t.test('rejects a changed body', () => {
    assert.throws(
      () =>
        validateLedger(
          completeInventory(),
          [
            scopeRow('feat(github.io): add search\n\nChanged body.\n'),
            keepRow(secondOid),
          ],
          { requireResolved: true },
        ),
      /body bytes/,
    );
  });
  await t.test('rejects a changed type', () => {
    assert.throws(
      () =>
        validateLedger(
          completeInventory(),
          [
            scopeRow(
              'fix(github.io): add search\n\nPreserve this body byte-for-byte.\n',
            ),
            keepRow(secondOid),
          ],
          { requireResolved: true },
        ),
      /type/,
    );
  });
  await t.test('rejects a changed description', () => {
    assert.throws(
      () =>
        validateLedger(
          completeInventory(),
          [
            scopeRow(
              'feat(github.io): add different search\n\nPreserve this body byte-for-byte.\n',
            ),
            keepRow(secondOid),
          ],
          { requireResolved: true },
        ),
      /description/,
    );
  });
  await t.test('rejects a changed breaking marker', () => {
    assert.throws(
      () =>
        validateLedger(
          completeInventory(),
          [
            scopeRow(
              'feat(github.io)!: add search\n\nPreserve this body byte-for-byte.\n',
            ),
            keepRow(secondOid),
          ],
          { requireResolved: true },
        ),
      /breaking marker/,
    );
  });
});

test('wider message changes require separate approval evidence', () => {
  const row = keepRow();
  row.decision = 'change';
  row.changeKind = 'separately-approved-message-change';
  row.replacementMessageBase64 = Buffer.from(
    'fix(workflow): replace message\n',
  ).toString('base64');
  row.reason = 'approved correction beyond scope';
  row.evidence = [];

  assert.throws(
    () =>
      validateLedger(completeInventory(), [row, keepRow(secondOid)], {
        requireResolved: true,
      }),
    /approval evidence/,
  );
  row.evidence = [
    {
      path: 'approvals/message-change.md',
      explanation: 'explicit approval record',
    },
  ];
  assert.equal(
    validateLedger(completeInventory(), [row, keepRow(secondOid)], {
      requireResolved: true,
    }).get(firstOid),
    row,
  );
});
