import {
  cpSync,
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  serializeReleaseRecord,
  verifyDeployment,
} from './github-io-release.mjs';

const DEPLOYED_RECORD_NAME = '.github-pages-release.json';

function readRecord(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function syncArtifact(
  buildDirectory,
  targetDirectory,
  { releaseRecordPath, bootstrap = false, cwd = process.cwd() } = {},
) {
  if (!existsSync(buildDirectory)) {
    throw new Error(`Build directory does not exist: ${buildDirectory}`);
  }
  if (!existsSync(join(targetDirectory, '.git'))) {
    throw new Error(`Target directory must contain .git: ${targetDirectory}`);
  }
  if (!releaseRecordPath) {
    throw new Error('--release-record is required');
  }

  const candidate = readRecord(releaseRecordPath);
  const canonicalRecord = serializeReleaseRecord(candidate);
  const deployedRecordPath = join(targetDirectory, DEPLOYED_RECORD_NAME);
  const deployed = existsSync(deployedRecordPath)
    ? readRecord(deployedRecordPath)
    : null;
  const result = verifyDeployment({ candidate, deployed, bootstrap, cwd });

  if (result.action === 'conflict') {
    throw new Error('Deployment conflict: candidate cannot replace target');
  }
  if (result.action === 'divergent') {
    throw new Error('Divergent deployment source history');
  }
  if (result.action !== 'deploy') return result;

  for (const entry of readdirSync(targetDirectory)) {
    if (entry !== '.git') {
      rmSync(join(targetDirectory, entry), { recursive: true, force: true });
    }
  }
  for (const entry of readdirSync(buildDirectory)) {
    if (entry === '.git' || entry === 'package.json') continue;
    cpSync(join(buildDirectory, entry), join(targetDirectory, entry), {
      recursive: true,
    });
  }
  writeFileSync(join(targetDirectory, '.nojekyll'), '');
  writeFileSync(deployedRecordPath, canonicalRecord);

  return result;
}

function parseArguments(argv) {
  const [buildDirectory, targetDirectory, ...rest] = argv;
  let releaseRecordPath;
  let bootstrap = false;

  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (argument === '--bootstrap') {
      bootstrap = true;
      continue;
    }
    if (argument === '--release-record') {
      releaseRecordPath = rest[index + 1];
      if (!releaseRecordPath || releaseRecordPath.startsWith('--')) {
        throw new Error('--release-record requires a value');
      }
      index += 1;
      continue;
    }
    throw new Error(`Unexpected argument: ${argument}`);
  }

  if (!releaseRecordPath) throw new Error('--release-record is required');
  return { buildDirectory, targetDirectory, releaseRecordPath, bootstrap };
}

export function runCli(argv) {
  const { buildDirectory, targetDirectory, releaseRecordPath, bootstrap } =
    parseArguments(argv);
  return syncArtifact(buildDirectory, targetDirectory, {
    releaseRecordPath,
    bootstrap,
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = runCli(process.argv.slice(2));
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
