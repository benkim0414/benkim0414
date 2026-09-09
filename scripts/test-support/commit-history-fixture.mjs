import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

export function repositoryFixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'commit-history-fixture-'));
  let sequence = 0;

  t.after(() => rmSync(cwd, { recursive: true, force: true }));

  function run(...args) {
    const result = spawnSync('git', args, {
      cwd,
      maxBuffer: 64 * 1024 * 1024,
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(result.stderr.toString('utf8'));
    return result.stdout;
  }

  run('init', '--quiet', '--initial-branch=main');
  run('config', 'user.name', 'Commit History Fixture');
  run('config', 'user.email', 'fixture@example.invalid');
  run('config', 'core.hooksPath', '/dev/null');

  function commit(subject) {
    sequence += 1;
    const relativePath = `fixture-${sequence}.txt`;
    writeFileSync(join(cwd, relativePath), `${subject}\n`);
    run('add', '--', relativePath);
    run('commit', '--quiet', '-m', subject);
    return run('rev-parse', 'HEAD').toString('ascii').trim();
  }

  return { cwd, commit, git: run };
}
