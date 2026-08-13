# GitHub.io Astryx Codex Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Codex version-matched Astryx guidance under `apps/github.io`, with deterministic refresh and non-destructive freshness checks.

**Architecture:** Keep the existing nested `AGENTS.md` as the app's single instruction source and let the installed Astryx CLI own only one marker-delimited block inside it. Reviewed, narrowly scoped app-specific handwritten supplements remain outside that block. Root package scripts expose the installed CLI, refresh only the fixed app target, and run a standalone Node.js checker that generates an expected block in a temporary repository-local file before comparing it byte for byte.

**Tech Stack:** pnpm 11, Node.js 24 ESM and `node:test`, Astryx CLI/core/theme-neutral 0.1.4, Nx 23, Markdown `AGENTS.md` instructions.

## Global Constraints

- Scope generated guidance to `apps/github.io`; do not change global Codex configuration or the root `AGENTS.md`.
- Preserve all handwritten content outside `<!-- ASTRYX:START -->` and `<!-- ASTRYX:END -->` exactly.
- Permit reviewed, narrowly scoped app-specific handwritten supplements outside
  the managed block; the existing inline-style prohibition is an approved
  supplement.
- Treat the marker lines as standalone top-level Markdown nodes. Reject markers
  inside code spans, fenced or indented code, raw HTML blocks, block quotes, or
  list containers.
- Keep production refresh and check commands fixed to
  `apps/github.io/AGENTS.md`; custom targets are internal function/test seams.
- Require the production guide to exist before refresh and validate the
  refreshed postcondition against a fresh CLI-generated block.
- Use installed `@astryxdesign/cli@0.1.4`; do not upgrade or add dependencies.
- Invoke the executable declared by the installed package at `node_modules/@astryxdesign/cli/bin/astryx.mjs`.
- Treat the Astryx CLI as the only generator; do not import its private generator modules.
- Leave runtime application code, theme configuration, and CI workflows unchanged.
- The freshness check must leave no temporary files on success or handled failure.
- Stage explicit paths only and use conventional commit subjects scoped to `github.io`.

---

## File Map

- Modify `package.json`: expose stable Astryx invoke, refresh, check, and checker-test scripts.
- Create `scripts/check-astryx-agent-docs.mjs`: validate active top-level markers, generate an expected block through the installed CLI, compare blocks, render nested errors primary-first, and clean temporary files.
- Create `scripts/refresh-astryx-agent-docs.mjs`: require and validate the fixed production target, invoke the installed CLI refresh, and validate its postcondition.
- Create `scripts/check-astryx-agent-docs.test.mjs`: exercise Markdown marker contexts, single-target command behavior, explicit-target integration, current/stale comparisons, refresh postconditions, target containment, and cleanup through Node's built-in test runner.
- Modify `apps/github.io/AGENTS.md`: append the one generated block; no handwritten line may change.

---

### Task 1: Add a tested Astryx agent-doc freshness checker

**Files:**

- Create: `scripts/check-astryx-agent-docs.test.mjs`
- Create: `scripts/check-astryx-agent-docs.mjs`
- Modify: `package.json:5-9`

**Interfaces:**

- Produces: `extractAstryxBlock(content: string, label: string): string`.
- Produces: `resolveRepoPath(repoRoot: string, relativePath: string): string`.
- Produces: `generateExpectedAgentDocs({repoRoot: string, outputRelativePath: string}): void`.
- Produces: `checkAstryxAgentDocs(options?: {repoRoot?: string, targetRelativePath?: string, generateExpected?: Function, removeTemp?: Function}): void`; non-default targets and injected operations are internal test/function seams.
- Produces CLI: `node scripts/check-astryx-agent-docs.mjs`, fixed to `apps/github.io/AGENTS.md` and rejecting positional targets.
- Produces package scripts: `astryx`, `astryx:agents`, `astryx:agents:check`, and `test:astryx-agents`.
- Produces a refresh wrapper that rejects symlink escapes and malformed managed spans before invoking Astryx.
- Consumes: installed `node_modules/@astryxdesign/cli/bin/astryx.mjs` and a repository-relative agent-doc target.

- [ ] **Step 1: Write the failing Node tests**

Create `scripts/check-astryx-agent-docs.test.mjs`:

```js
import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {dirname, join} from 'node:path';
import {test} from 'node:test';

import {
  ASTRYX_MARKER_END,
  ASTRYX_MARKER_START,
  checkAstryxAgentDocs,
  extractAstryxBlock,
  resolveRepoPath,
} from './check-astryx-agent-docs.mjs';

const block = (version) =>
  `${ASTRYX_MARKER_START}\nAstryx v${version}\n${ASTRYX_MARKER_END}`;

test('extractAstryxBlock returns one complete managed block', () => {
  assert.equal(
    extractAstryxBlock(`before\n${block('0.1.4')}\nafter`, 'fixture'),
    block('0.1.4'),
  );
});

for (const [name, content] of [
  ['missing', 'handwritten guidance only'],
  ['incomplete', `${ASTRYX_MARKER_START}\nAstryx v0.1.4`],
  ['duplicate', `${block('0.1.4')}\n${block('0.1.4')}`],
]) {
  test(`extractAstryxBlock rejects ${name} markers`, () => {
    assert.throws(
      () => extractAstryxBlock(content, name),
      /exactly one complete Astryx managed block/,
    );
  });
}

test('resolveRepoPath rejects targets outside the repository', () => {
  assert.throws(
    () => resolveRepoPath('/workspace/repo', '../AGENTS.md'),
    /must stay inside the repository/,
  );
});

test('checkAstryxAgentDocs accepts current content and cleans generated files', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-agent-docs-test-current-'),
  );
  const targetRelativePath = 'apps/github.io/AGENTS.md';
  const targetPath = resolveRepoPath(repoRoot, targetRelativePath);

  try {
    mkdirSync(dirname(targetPath), {recursive: true});
    writeFileSync(targetPath, `handwritten\n${block('0.1.4')}\n`);

    checkAstryxAgentDocs({
      repoRoot,
      targetRelativePath,
      generateExpected: ({repoRoot: root, outputRelativePath}) => {
        writeFileSync(resolveRepoPath(root, outputRelativePath), block('0.1.4'));
      },
    });

    assert.deepEqual(
      readdirSync(repoRoot).filter((name) =>
        name.startsWith('.astryx-agent-docs-check-'),
      ),
      [],
    );
  } finally {
    rmSync(repoRoot, {recursive: true, force: true});
  }
});

test('checkAstryxAgentDocs rejects a stale copy and cleans generated files', () => {
  const repoRoot = mkdtempSync(
    join(process.cwd(), '.astryx-agent-docs-test-stale-'),
  );
  const targetRelativePath = 'apps/github.io/AGENTS.md';
  const targetPath = resolveRepoPath(repoRoot, targetRelativePath);

  try {
    mkdirSync(dirname(targetPath), {recursive: true});
    writeFileSync(targetPath, `handwritten\n${block('0.1.3')}\n`);

    assert.throws(
      () =>
        checkAstryxAgentDocs({
          repoRoot,
          targetRelativePath,
          generateExpected: ({repoRoot: root, outputRelativePath}) => {
            writeFileSync(
              resolveRepoPath(root, outputRelativePath),
              block('0.1.4'),
            );
          },
        }),
      /Astryx agent docs are stale.*pnpm astryx:agents/s,
    );

    assert.deepEqual(
      readdirSync(repoRoot).filter((name) =>
        name.startsWith('.astryx-agent-docs-check-'),
      ),
      [],
    );
  } finally {
    rmSync(repoRoot, {recursive: true, force: true});
  }
});
```

- [ ] **Step 2: Run the tests to prove the checker does not exist yet**

Run:

```bash
node --test scripts/check-astryx-agent-docs.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for
`scripts/check-astryx-agent-docs.mjs`.

- [ ] **Step 3: Implement the marker validator and CLI-backed comparison**

Create `scripts/check-astryx-agent-docs.mjs`:

```js
import {existsSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

export const ASTRYX_MARKER_START = '<!-- ASTRYX:START -->';
export const ASTRYX_MARKER_END = '<!-- ASTRYX:END -->';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REPO_ROOT = resolve(SCRIPT_DIR, '..');
const DEFAULT_TARGET = 'apps/github.io/AGENTS.md';
const TEMP_PREFIX = '.astryx-agent-docs-check-';

function countOccurrences(content, marker) {
  return content.split(marker).length - 1;
}

export function extractAstryxBlock(content, label) {
  const starts = countOccurrences(content, ASTRYX_MARKER_START);
  const ends = countOccurrences(content, ASTRYX_MARKER_END);
  const startIndex = content.indexOf(ASTRYX_MARKER_START);
  const endIndex = content.indexOf(ASTRYX_MARKER_END);

  if (starts !== 1 || ends !== 1 || endIndex < startIndex) {
    throw new Error(
      `${label} must contain exactly one complete Astryx managed block. ` +
        'Run `pnpm astryx:agents` to regenerate it.',
    );
  }

  return content.slice(startIndex, endIndex + ASTRYX_MARKER_END.length);
}

export function resolveRepoPath(repoRoot, relativePath) {
  if (isAbsolute(relativePath)) {
    throw new Error(`Target must stay inside the repository: ${relativePath}`);
  }

  const absolutePath = resolve(repoRoot, relativePath);
  const fromRoot = relative(repoRoot, absolutePath);
  if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`)) {
    throw new Error(`Target must stay inside the repository: ${relativePath}`);
  }

  return absolutePath;
}

export function generateExpectedAgentDocs({repoRoot, outputRelativePath}) {
  const cliPath = join(
    repoRoot,
    'node_modules/@astryxdesign/cli/bin/astryx.mjs',
  );
  if (!existsSync(cliPath)) {
    throw new Error(
      `Astryx CLI executable is missing at ${cliPath}. Run \`pnpm install --frozen-lockfile\`.`,
    );
  }

  const result = spawnSync(
    process.execPath,
    [
      cliPath,
      'init',
      '--features',
      'agents',
      '--agent-docs-path',
      outputRelativePath,
    ],
    {cwd: repoRoot, encoding: 'utf8'},
  );

  if (result.error) {
    throw new Error(`Astryx CLI failed to start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const diagnostic = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`Astryx CLI failed (${result.status}).\n${diagnostic}`);
  }
}

export function checkAstryxAgentDocs({
  repoRoot = DEFAULT_REPO_ROOT,
  targetRelativePath = DEFAULT_TARGET,
  generateExpected = generateExpectedAgentDocs,
} = {}) {
  const targetPath = resolveRepoPath(repoRoot, targetRelativePath);
  const checkedIn = extractAstryxBlock(
    readFileSync(targetPath, 'utf8'),
    targetRelativePath,
  );
  const tempDir = mkdtempSync(join(repoRoot, TEMP_PREFIX));
  let primaryError;

  try {
    const expectedPath = join(tempDir, 'AGENTS.md');
    const outputRelativePath = relative(repoRoot, expectedPath);
    generateExpected({repoRoot, outputRelativePath});
    const expected = extractAstryxBlock(
      readFileSync(expectedPath, 'utf8'),
      outputRelativePath,
    );

    if (checkedIn !== expected) {
      throw new Error(
        `Astryx agent docs are stale in ${targetRelativePath}. ` +
          'Run `pnpm astryx:agents` and commit the updated block.',
      );
    }
  } catch (error) {
    primaryError = error;
  }

  try {
    rmSync(tempDir, {recursive: true, force: true});
  } catch (cleanupError) {
    const message = `Failed to clean temporary Astryx docs at ${tempDir}: ${cleanupError.message}`;
    if (primaryError) {
      throw new AggregateError([primaryError, cleanupError], message);
    }
    throw new Error(message, {cause: cleanupError});
  }

  if (primaryError) {
    throw primaryError;
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : undefined;

if (invokedPath === import.meta.url) {
  try {
    if (process.argv.length > 2) {
      throw new Error(
        `Astryx agent-doc check does not accept a target; it always checks ${DEFAULT_TARGET}.`,
      );
    }
    checkAstryxAgentDocs();
    console.log(`Astryx agent docs are current: ${DEFAULT_TARGET}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
```

- [ ] **Step 4: Add the stable package scripts**

Update the `scripts` object in `package.json` to:

```json
"scripts": {
  "astryx": "node node_modules/@astryxdesign/cli/bin/astryx.mjs",
  "astryx:agents": "node scripts/refresh-astryx-agent-docs.mjs",
  "astryx:agents:check": "node scripts/check-astryx-agent-docs.mjs",
  "test:astryx-agents": "node --test scripts/check-astryx-agent-docs.test.mjs",
  "prepare": "husky",
  "commitlint": "commitlint --edit",
  "commit": "git-cz"
}
```

Do not change dependencies or the lockfile.

- [ ] **Step 5: Run focused tests and syntax validation**

Run:

```bash
pnpm test:astryx-agents
node --check scripts/check-astryx-agent-docs.mjs
node --check scripts/check-astryx-agent-docs.test.mjs
pnpm astryx --version
```

Expected: all Node tests pass, both syntax checks exit 0, and the CLI prints
`0.1.4`.

- [ ] **Step 6: Review and commit the checker capability**

Run:

```bash
git diff --check
git diff -- package.json scripts/check-astryx-agent-docs.mjs scripts/check-astryx-agent-docs.test.mjs
git status --short
```

Confirm `pnpm-lock.yaml` is unchanged, then commit only the three task files:

```bash
git add package.json scripts/check-astryx-agent-docs.mjs scripts/check-astryx-agent-docs.test.mjs
git commit -m "feat(github.io): verify Astryx agent context"
```

---

### Task 2: Generate and validate the app-scoped Astryx context

**Files:**

- Modify: `apps/github.io/AGENTS.md:75`
- Test: `scripts/check-astryx-agent-docs.test.mjs`

**Interfaces:**

- Consumes: `pnpm astryx:agents` and `pnpm astryx:agents:check` from Task 1.
- Produces: exactly one CLI-owned block bounded by `<!-- ASTRYX:START -->` and `<!-- ASTRYX:END -->` in `apps/github.io/AGENTS.md`.
- Produces: app-scoped guidance consumed automatically by Codex when it works below `apps/github.io`.

- [ ] **Step 1: Show that freshness verification fails before generation**

Run:

```bash
pnpm astryx:agents:check
```

Expected: exit 1 with
`apps/github.io/AGENTS.md must contain exactly one complete Astryx managed block`
and the recovery command `pnpm astryx:agents`.

- [ ] **Step 2: Generate the managed block through the installed CLI**

Run:

```bash
pnpm astryx:agents
```

Expected: the CLI reports that it wrote `apps/github.io/AGENTS.md`. Inspect the
diff and confirm every added line is inside one new marker pair at the end of
the file; no existing handwritten line may change.

- [ ] **Step 3: Verify the generated guidance contract**

Run:

```bash
rg -n "ASTRYX:(START|END)|WORKFLOW|template --list|template <name> --skeleton|component <Name>|No <div>|No inline style|Tokens for every value|MORE CLI" apps/github.io/AGENTS.md
```

Expected: one marker pair plus the template discovery, skeleton, component
docs, raw-element, inline-style, token, and CLI-reference guidance.

- [ ] **Step 4: Verify refresh idempotence**

Run:

```bash
node -e "const{readFileSync}=require('node:fs');const{spawnSync}=require('node:child_process');const p='apps/github.io/AGENTS.md';const before=readFileSync(p,'utf8');const r=spawnSync('pnpm',['astryx:agents'],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);const after=readFileSync(p,'utf8');if(before!==after){console.error('Second Astryx refresh changed AGENTS.md');process.exit(1)}console.log('Astryx refresh is idempotent')"
```

Expected: `Astryx refresh is idempotent` and exit 0.

- [ ] **Step 5: Verify current and stale outcomes**

Run the real check:

```bash
pnpm astryx:agents:check
```

Expected: `Astryx agent docs are current: apps/github.io/AGENTS.md`.

Then verify stale and internal custom-target behavior through the focused test
surface rather than a user-facing positional target:

```bash
node --test --test-name-pattern='rejects a stale copy|custom checker diagnostics' scripts/check-astryx-agent-docs.test.mjs
```

Expected: both focused tests pass, including stale detection, cleanup, and the
rule that internal custom-target diagnostics never recommend the fixed
production refresh command. Malformed markers remain covered by
`pnpm test:astryx-agents`; do not alter the checked-in file.

- [ ] **Step 6: Confirm the installed component knowledge checks**

Run:

```bash
pnpm astryx component Button --dense
pnpm astryx component Dialog --dense
pnpm astryx component Selector --dense
```

Expected inspection results:

- `Button` documentation shows its current `@astryxdesign/core` import.
- `Dialog` documentation identifies `purpose="required"` as non-dismissible.
- `Selector` documentation identifies required `options: SelectorOption[]`.

- [ ] **Step 7: Run final repository verification**

Run:

```bash
pnpm test:astryx-agents
node --check scripts/check-astryx-agent-docs.mjs
node --check scripts/refresh-astryx-agent-docs.mjs
pnpm astryx:agents
node -e "const{readFileSync}=require('node:fs');const{spawnSync}=require('node:child_process');const p='apps/github.io/AGENTS.md';const before=readFileSync(p,'utf8');const r=spawnSync('pnpm',['astryx:agents'],{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);const after=readFileSync(p,'utf8');if(before!==after){console.error('Second Astryx refresh changed AGENTS.md');process.exit(1)}console.log('Astryx refresh is idempotent')"
pnpm astryx:agents:check
pnpm nx lint github.io
pnpm nx test github.io
git diff --check
git status --short
```

Expected: checker tests and freshness pass; lint has zero errors and no new
warnings beyond the 23 baseline warnings; all 549 baseline app tests pass;
both script syntax checks and `git diff --check` exit 0; the second refresh is
byte-for-byte idempotent; and no refresh changes the repository-root
`AGENTS.md` or handwritten app guidance outside the managed block.

Do not run the app build or browser checks: the approved design excludes
runtime and visual changes.

- [ ] **Step 8: Review and commit the generated app guidance**

Run:

```bash
git diff -- apps/github.io/AGENTS.md
git status --short
```

Confirm the diff only appends or updates the marker-delimited generated block.
Then commit only that path:

```bash
git add apps/github.io/AGENTS.md
git commit -m "chore(github.io): sync Astryx agent context"
```

---

## Approved Final Review Corrections

This section supersedes the initial implementation snippets wherever they
describe target arguments, marker validation, refresh completion, root-file
restoration, or error rendering.

1. Use a container-aware Markdown scanner and require each marker line to be a
   standalone top-level node. Preserve the accepted one-to-three-space
   top-level indentation and existing fenced/indented-code behavior while also
   rejecting multiline code spans, `pre`/`script`/`style`/`textarea` raw HTML
   blocks, block quotes, and list containers.
2. Expose no positional target on either production executable. Both
   `pnpm astryx:agents` and `pnpm astryx:agents:check` operate only on
   `apps/github.io/AGENTS.md`; custom targets remain internal to exported
   functions and tests.
3. Require the production guide to exist before refresh. This prevents a
   deleted handwritten guide from being recreated as generated-only content.
4. Do not snapshot, restore, or otherwise write repository-root `AGENTS.md`.
   Verify with a real installed-CLI integration test that the explicit
   `--agent-docs-path` branch touches only the app guide.
5. After a zero-exit CLI refresh, run the same checker/generator comparison as
   the freshness command. Missing, malformed, or stale output is a refresh
   failure and retains the underlying diagnostic.
6. When generation and temporary cleanup both fail, retain both errors and
   recursively render aggregate errors with the primary generation failure
   first.
7. Keep the inline-style prohibition as a reviewed handwritten app supplement
   outside the managed block. The CLI owns only the marker-delimited block and
   must never rewrite surrounding instructions.

Each behavior above requires a focused failing test observed before the minimum
production change, followed by the focused passing run. The final verification
contract is the command block in Task 2 Step 7; no positional-target fixture
command is part of the public interface.

---

## Completion Review

After both task commits:

1. Use `/review` or `compound-engineering:ce-code-review` against the approved
   design spec and this plan.
2. Resolve all valid findings and rerun the relevant focused verification.
3. Confirm `git status --short --branch` is clean on
   `chore/astryx-codex-agent-docs`.
4. Stop in the repository's awaiting-handoff state. Do not push, open a PR,
   merge, or deploy until the user explicitly requests handoff.
