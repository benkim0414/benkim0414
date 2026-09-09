import { spawnSync } from 'node:child_process';

export function git(cwd, args, input) {
  const result = spawnSync('git', args, {
    cwd,
    input,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.toString('utf8'));
  return result.stdout;
}
