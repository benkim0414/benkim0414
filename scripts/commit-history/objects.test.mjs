import test from 'node:test';
import assert from 'node:assert/strict';

import { parseCommit, transformCommit } from './objects.mjs';

function commitBuffer({ parents = [], headers = [], message = '' } = {}) {
  const lines = [
    `tree ${'3'.repeat(40)}`,
    ...parents.map((parent) => `parent ${parent}`),
    'author A <a@example.test> 1 +1030',
    'committer B <b@example.test> 2 -0700',
    ...headers,
  ];
  return Buffer.from(`${lines.join('\n')}\n\n${message}`);
}

test('changes only approved message and mapped parent bytes', () => {
  const oldParent = '1'.repeat(40);
  const newParent = '2'.repeat(40);
  const raw = commitBuffer({
    parents: [oldParent],
    message: 'feat(skills): search\n\nBody stays.\n',
  });

  const rewritten = transformCommit(raw, {
    parentMap: new Map([[oldParent, newParent]]),
    replacementMessage: Buffer.from('feat(github.io): search\n\nBody stays.\n'),
    signaturePolicy: 'reject',
  });

  assert.deepEqual(
    rewritten,
    Buffer.from(
      raw
        .toString('utf8')
        .replace(oldParent, newParent)
        .replace('feat(skills): search', 'feat(github.io): search'),
    ),
  );
});

test('maps multiple parents in order and preserves unknown headers', () => {
  const oldParents = ['1'.repeat(40), '2'.repeat(40)];
  const newParents = ['a'.repeat(40), 'b'.repeat(40)];
  const raw = commitBuffer({
    parents: oldParents,
    headers: ['x-private exact bytes'],
    message: 'Merge branches\n',
  });

  const parsed = parseCommit(
    transformCommit(raw, {
      parentMap: new Map([
        [oldParents[0], newParents[0]],
        [oldParents[1], newParents[1]],
      ]),
      replacementMessage: null,
      signaturePolicy: 'reject',
    }),
  );

  assert.deepEqual(
    parsed.headers
      .filter(({ name }) => name === 'parent')
      .map(({ value }) => value.toString('ascii')),
    newParents,
  );
  assert.equal(
    parsed.headers.find(({ name }) => name === 'x-private').value.toString(),
    'exact bytes',
  );
});

test('preserves empty root commits and supports an approved empty message', () => {
  const raw = commitBuffer();
  assert.deepEqual(
    transformCommit(raw, {
      parentMap: new Map(),
      replacementMessage: null,
      signaturePolicy: 'reject',
    }),
    raw,
  );
  assert.equal(
    parseCommit(
      transformCommit(raw, {
        parentMap: new Map(),
        replacementMessage: Buffer.alloc(0),
        signaturePolicy: 'reject',
      }),
    ).message.length,
    0,
  );
});

test('preserves non-ASCII message bytes and explicit encoding headers', () => {
  const parent = '1'.repeat(40);
  const raw = commitBuffer({
    parents: [parent],
    headers: ['encoding ISO-8859-1'],
    message: 'docs(workflow): café\n',
  });
  const rewritten = transformCommit(raw, {
    parentMap: new Map([[parent, '2'.repeat(40)]]),
    replacementMessage: null,
    signaturePolicy: 'reject',
  });
  const parsed = parseCommit(rewritten);

  assert.deepEqual(parsed.message, Buffer.from('docs(workflow): café\n'));
  assert.equal(
    parsed.headers.find(({ name }) => name === 'encoding').value.toString(),
    'ISO-8859-1',
  );
});

for (const signatureHeader of ['gpgsig', 'gpgsig-sha256']) {
  test(`rejects a ${signatureHeader} commit when bytes would change`, () => {
    const parent = '1'.repeat(40);
    const raw = commitBuffer({
      parents: [parent],
      headers: [
        `${signatureHeader} -----BEGIN SIGNATURE-----`,
        ' continuation bytes',
      ],
      message: 'feat(workflow): signed\n',
    });

    assert.throws(
      () =>
        transformCommit(raw, {
          parentMap: new Map([[parent, '2'.repeat(40)]]),
          replacementMessage: null,
          signaturePolicy: 'reject',
        }),
      /signature-bearing commit/,
    );
    assert.deepEqual(
      transformCommit(raw, {
        parentMap: new Map([[parent, parent]]),
        replacementMessage: null,
        signaturePolicy: 'reject',
      }),
      raw,
    );
  });
}

test('preserves an embedded mergetag byte-for-byte', () => {
  const raw = commitBuffer({
    headers: [
      `mergetag object ${'4'.repeat(40)}`,
      ' type commit',
      ' tag fixture',
      ' tagger José <j@example.test> 3 +0000',
    ],
    message: 'Merge fixture\n',
  });
  const rewritten = transformCommit(raw, {
    parentMap: new Map(),
    replacementMessage: Buffer.from('Merge fixture with corrected subject\n'),
    signaturePolicy: 'reject',
  });
  const before = parseCommit(raw).headers.find(
    ({ name }) => name === 'mergetag',
  );
  const after = parseCommit(rewritten).headers.find(
    ({ name }) => name === 'mergetag',
  );

  assert.deepEqual(after.value, before.value);
});

test('rejects remapping a real parent bound by an embedded mergetag', () => {
  const oldParent = '1'.repeat(40);
  const raw = commitBuffer({
    parents: [oldParent],
    headers: [
      `mergetag object ${oldParent}`,
      ' type commit',
      ' tag fixture',
      ' tagger José <j@example.test> 3 +0000',
    ],
    message: 'Merge fixture\n',
  });

  assert.throws(
    () =>
      transformCommit(raw, {
        parentMap: new Map([[oldParent, '2'.repeat(40)]]),
        replacementMessage: null,
        signaturePolicy: 'reject',
      }),
    /mergetag/,
  );
});

test('rejects a missing parent mapping', () => {
  const raw = commitBuffer({ parents: ['1'.repeat(40)] });
  assert.throws(
    () =>
      transformCommit(raw, {
        parentMap: new Map(),
        replacementMessage: null,
        signaturePolicy: 'reject',
      }),
    /missing parent mapping/,
  );
});

test('rejects malformed commit headers', async (t) => {
  await t.test('missing separator', () => {
    assert.throws(() => parseCommit(Buffer.from('tree bad\n')), /separator/);
  });
  await t.test('orphan continuation', () => {
    assert.throws(
      () => parseCommit(Buffer.from(' orphan\n\nmessage')),
      /orphan continuation/,
    );
  });
  await t.test('invalid header line', () => {
    assert.throws(
      () => parseCommit(Buffer.from('invalid\n\nmessage')),
      /invalid header/,
    );
  });
});
