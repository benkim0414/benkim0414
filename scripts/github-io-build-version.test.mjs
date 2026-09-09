import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('the production Vite config enforces strict stable SemVer at the build boundary', () => {
  for (const [version, valid] of [
    ['1.2.3', true],
    ['0.0.0', true],
    ['01.2.3', false],
    ['1.2.3\n', false],
    ['0.0.0-development', false],
    ['', false],
  ]) {
    const result = spawnSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
      import { loadConfigFromFile } from 'vite';
      try {
        const loaded = await loadConfigFromFile({ command: 'build', mode: 'production' }, 'apps/github.io/vite.config.ts');
        process.stdout.write(loaded.config.define.__APP_VERSION__);
      } catch (error) { process.stderr.write(error.message); process.exitCode = 1; }
    `,
      ],
      {
        encoding: 'utf8',
        env: { ...process.env, APP_RELEASE: 'true', APP_VERSION: version },
      },
    );
    assert.equal(
      result.status,
      valid ? 0 : 1,
      `APP_VERSION=${JSON.stringify(version)}\n${result.stderr}`,
    );
    if (valid) assert.equal(JSON.parse(result.stdout), version);
    else assert.match(result.stderr, /APP_VERSION must be a stable SemVer/);
  }
});
