import {
  cpSync,
  existsSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function syncArtifact(buildDirectory, targetDirectory) {
  if (!existsSync(buildDirectory)) {
    throw new Error(`Build directory does not exist: ${buildDirectory}`);
  }
  if (!existsSync(join(targetDirectory, '.git'))) {
    throw new Error(`Target directory must contain .git: ${targetDirectory}`);
  }

  for (const entry of readdirSync(targetDirectory)) {
    if (entry !== '.git') {
      rmSync(join(targetDirectory, entry), { recursive: true, force: true });
    }
  }
  for (const entry of readdirSync(buildDirectory)) {
    cpSync(join(buildDirectory, entry), join(targetDirectory, entry), {
      recursive: true,
    });
  }
  writeFileSync(join(targetDirectory, '.nojekyll'), '');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  syncArtifact(process.argv[2], process.argv[3]);
}
