#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { checkScope } from './commit-scope-policy.mjs';

const oidPattern = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const zeroPattern = /^(?:0{40}|0{64})$/;

function git(args, options = {}) {
  return execFileSync('git', args, {
    encoding: options.encoding ?? 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function parseOptions(args) {
  const parsed = { staged: false, validateRange: false };
  const values = new Map([
    ['--message-file', 'messageFile'],
    ['--base', 'base'],
    ['--head', 'head'],
    ['--pr-title', 'prTitle'],
  ]);
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--staged') {
      parsed.staged = true;
      continue;
    }
    if (argument === '--validate-range') {
      parsed.validateRange = true;
      continue;
    }
    const key = values.get(argument);
    if (!key) throw new Error(`Unknown argument ${JSON.stringify(argument)}.`);
    if (parsed[key] !== undefined)
      throw new Error(`Argument ${argument} may be supplied only once.`);
    if (index === args.length - 1)
      throw new Error(`Missing required ${argument} value.`);
    parsed[key] = args[(index += 1)];
  }
  if (parsed.staged) {
    if (
      !parsed.messageFile ||
      parsed.base ||
      parsed.head ||
      parsed.prTitle ||
      parsed.validateRange
    )
      throw new Error(
        'Staged mode requires only --staged --message-file PATH.',
      );
  } else if (!parsed.base || !parsed.head || parsed.messageFile) {
    throw new Error('Range mode requires --base OID --head OID.');
  }
  return parsed;
}

function validateOid(value, label) {
  if (!oidPattern.test(value))
    throw new Error(`${label} must be a full hexadecimal commit OID.`);
}

function nameStatusPaths(buffer) {
  const fields = buffer.toString('utf8').split('\0');
  const paths = [];
  for (let index = 0; index < fields.length && fields[index];) {
    const status = fields[index++];
    paths.push(fields[index++]);
    if (status.startsWith('R') || status.startsWith('C'))
      paths.push(fields[index++]);
  }
  return paths.filter(Boolean);
}

function inspect(subject, paths, label) {
  const result = checkScope({ subject, paths });
  for (const message of result.review)
    process.stderr.write(`review: ${label}: ${message}\n`);
  for (const message of result.errors)
    process.stderr.write(`error: ${label}: ${message}\n`);
  return result.errors.length;
}

function commitPaths(oid) {
  return nameStatusPaths(
    git(
      [
        'diff-tree',
        '--root',
        '--no-commit-id',
        '--name-status',
        '-z',
        '-r',
        '-M',
        oid,
      ],
      { encoding: 'buffer' },
    ),
  );
}

function assertRange(base, head, requireAncestor) {
  validateOid(base, '--base');
  validateOid(head, '--head');
  if (zeroPattern.test(base))
    throw new Error(
      'A new branch has no enforcement boundary; rerun with an explicit documented baseline.',
    );
  for (const [label, oid] of [
    ['--base', base],
    ['--head', head],
  ]) {
    try {
      git(['rev-parse', '--verify', `${oid}^{commit}`]);
    } catch {
      throw new Error(
        `Cannot resolve ${label} ${oid}; provide an explicit documented baseline.`,
      );
    }
  }
  if (requireAncestor) {
    try {
      execFileSync('git', ['merge-base', '--is-ancestor', base, head], {
        stdio: 'ignore',
      });
    } catch {
      throw new Error(
        'The base is not reachable from head; after a rewrite, provide an explicit documented baseline.',
      );
    }
  }
}

function rangeCommits(base, head, requireAncestor) {
  assertRange(base, head, requireAncestor);
  return git(['rev-list', '--reverse', '--topo-order', head, '--not', base])
    .trim()
    .split('\n')
    .filter(Boolean);
}

function main(args) {
  const options = parseOptions(args);
  let failures = 0;
  if (options.staged) {
    const subject = readFileSync(options.messageFile, 'utf8').split(
      /\r?\n/,
      1,
    )[0];
    const paths = nameStatusPaths(
      git(['diff', '--cached', '--name-status', '-z', '-M'], {
        encoding: 'buffer',
      }),
    );
    failures += inspect(subject, paths, 'staged commit');
  } else {
    const { base, head } = options;
    const requireAncestor = options.prTitle === undefined;
    if (options.validateRange) {
      assertRange(base, head, requireAncestor);
      return;
    }
    const commits = rangeCommits(base, head, requireAncestor);
    const allPaths = [];
    for (const oid of commits) {
      const paths = commitPaths(oid);
      allPaths.push(...paths);
      failures += inspect(
        git(['show', '-s', '--format=%s', oid]).trimEnd(),
        paths,
        oid,
      );
    }
    if (options.prTitle !== undefined)
      failures += inspect(
        options.prTitle,
        [...new Set(allPaths)],
        'proposed squash title',
      );
  }
  process.exitCode = failures ? 1 : 0;
}

try {
  main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`error: ${error.message}\n`);
  process.exitCode = 1;
}
