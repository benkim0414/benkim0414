import { git } from './git.mjs';

const SPECIAL_HEADERS = new Set([
  'encoding',
  'gpgsig',
  'gpgsig-sha256',
  'mergetag',
]);

function lines(buffer) {
  const text = buffer.toString('ascii').trim();
  return text === '' ? [] : text.split('\n');
}

function parseRefs(cwd) {
  const output = git(cwd, [
    'for-each-ref',
    '--sort=refname',
    '--format=%(refname)%00%(objectname)%00%(*objectname)%00%(symref)',
  ]);

  return lines(output).map((record) => {
    const [name, oid, peeledOid, symbolicTarget] = record.split('\0');
    const classification = classifyRef(name, symbolicTarget);
    return { name, oid, peeledOid, ...classification };
  });
}

function classifyRef(name, symbolicTarget) {
  if (name === 'refs/stash' || name.startsWith('refs/original/')) {
    return { role: 'preserve', reason: 'recovery ref' };
  }
  if (name.startsWith('refs/heads/')) {
    return { role: 'target', reason: 'local branch' };
  }
  if (name.startsWith('refs/remotes/')) {
    return {
      role: 'tracking',
      reason: symbolicTarget ? 'symbolic tracking HEAD' : 'remote-tracking ref',
    };
  }
  if (name.startsWith('refs/tags/')) {
    return { role: 'target', reason: 'tag' };
  }
  return { role: 'preserve', reason: 'auxiliary ref' };
}

function commitTip(cwd, ref) {
  const result = git(cwd, ['rev-parse', '--verify', `${ref.name}^{commit}`]);
  return result.toString('ascii').trim();
}

function parseWorktrees(cwd) {
  const fields = git(cwd, ['worktree', 'list', '--porcelain', '-z'])
    .toString('utf8')
    .split('\0');
  const records = [];
  let record = null;

  for (const field of fields) {
    if (field === '') {
      if (record) {
        records.push(record);
        record = null;
      }
      continue;
    }
    const separator = field.indexOf(' ');
    const key = separator === -1 ? field : field.slice(0, separator);
    const value = separator === -1 ? true : field.slice(separator + 1);
    if (key === 'worktree') record = { path: value };
    else if (record) record[key] = value;
  }

  return records.map((item) => ({
    path: item.path,
    head: item.HEAD,
    branch: typeof item.branch === 'string' ? item.branch : null,
    statusPorcelain: git(item.path, ['status', '--porcelain=v1']).toString(
      'utf8',
    ),
  }));
}

function parseCommit(raw) {
  const separator = raw.indexOf('\n\n');
  if (separator === -1)
    throw new Error('malformed commit object: missing header separator');
  const headerBytes = raw.subarray(0, separator);
  const message = raw.subarray(separator + 2);
  const headerLines = [];
  let lineStart = 0;
  while (lineStart <= headerBytes.length) {
    const lineEnd = headerBytes.indexOf(0x0a, lineStart);
    if (lineEnd === -1) {
      headerLines.push(headerBytes.subarray(lineStart));
      break;
    }
    headerLines.push(headerBytes.subarray(lineStart, lineEnd));
    lineStart = lineEnd + 1;
  }
  const headers = [];

  for (const line of headerLines) {
    if (line[0] === 0x20) {
      if (headers.length === 0)
        throw new Error('malformed commit object: orphan continuation');
      headers.at(-1).value = Buffer.concat([
        headers.at(-1).value,
        Buffer.from('\n'),
        line,
      ]);
      continue;
    }
    const space = line.indexOf(0x20);
    if (space === -1)
      throw new Error('malformed commit object: invalid header');
    headers.push({
      name: line.subarray(0, space).toString('ascii'),
      value: line.subarray(space + 1),
    });
  }

  const treeBytes = headers.find(({ name }) => name === 'tree')?.value;
  if (!treeBytes) throw new Error('malformed commit object: missing tree');
  const tree = treeBytes.toString('ascii');
  const parents = headers
    .filter(({ name }) => name === 'parent')
    .map(({ value }) => value.toString('ascii'));
  const specialHeaders = headers
    .filter(({ name }) => SPECIAL_HEADERS.has(name))
    .map(({ name, value }) => ({
      name,
      valueBase64: value.toString('base64'),
    }));

  return {
    tree,
    parents,
    messageBase64: message.toString('base64'),
    signed: specialHeaders.some(
      ({ name }) => name === 'gpgsig' || name === 'gpgsig-sha256',
    ),
    specialHeaders,
  };
}

function parsePaths(output) {
  const fields = output.toString('utf8').split('\0');
  if (fields.at(-1) === '') fields.pop();
  return fields;
}

function changedPaths(cwd, oid, parents) {
  if (parents.length === 0) {
    return [
      {
        parent: null,
        paths: parsePaths(
          git(cwd, [
            'diff-tree',
            '--root',
            '--no-commit-id',
            '--name-only',
            '-r',
            '-z',
            oid,
          ]),
        ),
      },
    ];
  }

  return parents.map((parent) => ({
    parent,
    paths: parsePaths(
      git(cwd, [
        'diff-tree',
        '--no-commit-id',
        '--name-only',
        '-r',
        '-z',
        parent,
        oid,
      ]),
    ),
  }));
}

export function snapshot(cwd) {
  const objectFormat = git(cwd, ['rev-parse', '--show-object-format'])
    .toString('ascii')
    .trim();
  const internalRefs = parseRefs(cwd);
  const refsWithTips = internalRefs.map((ref) => ({
    ...ref,
    commitTip: commitTip(cwd, ref),
  }));
  const exactTips = [...new Set(refsWithTips.map(({ commitTip: tip }) => tip))];
  const commitOids =
    exactTips.length === 0
      ? []
      : lines(
          git(
            cwd,
            ['rev-list', '--topo-order', '--reverse', '--stdin'],
            Buffer.from(`${exactTips.join('\n')}\n`, 'ascii'),
          ),
        );
  const containingRefs = new Map(commitOids.map((oid) => [oid, []]));

  for (const ref of refsWithTips) {
    for (const oid of lines(git(cwd, ['rev-list', ref.commitTip]))) {
      containingRefs.get(oid)?.push(ref.name);
    }
  }

  const commits = commitOids.map((oid) => {
    const parsed = parseCommit(git(cwd, ['cat-file', 'commit', oid]));
    return {
      oid,
      tree: parsed.tree,
      parents: parsed.parents,
      messageBase64: parsed.messageBase64,
      containingRefs: containingRefs.get(oid),
      paths: changedPaths(cwd, oid, parsed.parents),
      signed: parsed.signed,
      specialHeaders: parsed.specialHeaders,
    };
  });

  return {
    schemaVersion: 1,
    objectFormat,
    refs: refsWithTips.map(({ name, oid, role, reason }) => ({
      name,
      oid,
      role,
      reason,
    })),
    worktrees: parseWorktrees(cwd),
    commits,
  };
}
