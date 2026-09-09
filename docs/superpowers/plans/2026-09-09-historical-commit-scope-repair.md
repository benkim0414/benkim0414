# Historical Commit Scope Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. This is the user's standing execution selection; do not offer inline execution. Steps use checkbox syntax for tracking.

**Goal:** Correct every approved historical scope mistake across repository domains, preserve historical trees and topology, and prevent new scope mismatches.

**Architecture:** First produce a complete commit decision ledger and a verified backup. A small Node/Git utility rewrites approved messages into an isolated object database and independently verifies the resulting graph. Separate ordinary commits repair operational SHA dependencies and add scope validation; publication remains an explicitly approved handoff.

**Tech Stack:** Existing Node 24, Git CLI, node:test, pnpm, commitlint 19, and Nx 23.0.2. No new rewrite framework, package installation, or production dependency is required for the history tools.

**Spec:** [Approved design](../specs/2026-09-09-historical-commit-scope-repair-design.md).

## Global constraints

- “The ledger is the sole transformation input; a broad scope alias or keyword rule cannot authorize a rewrite.”
- “For every mapped pair, preserve tree object, ordered mapped parents, author and committer identities, and their timestamps.”
- “Keep root count and commit count unchanged.”
- “The message rewrite itself must preserve every file tree. Operational code/config updates are separate ordinary commits whose diffs are independently reviewable.”
- “Do not implicitly stash, reset, delete, or discard user work.”
- “Direct user approval is required for force publication.”
- “Do not use a mirror push, unconditional force, remote deletion, or broad automatic branch cleanup.”
- “Bootstrap/deployment is a separate handoff with a new immutable target/version pair.”
- Scope vocabulary and historical exceptions come from the spec, including all historical projects and nonreleasing documentation/tooling.
- Execute inside the existing linked worktree on docs/commit-scope-audit unless session context requires a different isolated worktree. Preserve unrelated changes.
- Explicit-path staging, conventional subjects, diff inspection, focused verification, and local commits only. Use workflow as the scope for history-migration tooling, commitlint for commit validation, and github.io for its bootstrap compatibility change.
- No actual source-history rewrite, force push, merge-to-main, or worktree reset is authorized by this plan. Obtain direct approval of the concrete rehearsal command and targets at Task 7; publishing has a separate gate in Task 8.

## Execution order and checkpoints

Tasks 1–3 build and test migration tooling using disposable fixtures. Task 4 applies the audit to real history without rewriting it. Tasks 5–6 prepare ordinary source changes. Task 7 freezes the final source snapshot and performs the approved rehearsal. Task 8 is a manual handoff. Do not stop merely because Tasks 1–3 are implemented: the per-commit review is a required deliverable.

The initial 1,635-commit audit is orientation, not a fixed count. Include later planning/implementation commits when freezing the final snapshot. Keep generated final inventory, backup, ledger, and migration map outside tracked inputs in a protected worktree-local `.history-repair/<run-id>/` directory. Commit the tools and explanatory docs first, then freeze exact source tips. This avoids a self-referential cycle in which committing a ledger changes the history it claims to inventory. Never discard this worktree while it contains the only backup.

Map these tasks to Hermes Kanban at execution if its interface is available; do not substitute GitHub Issues or send external messages. Each task below supplies target files, blockers, checks, acceptance, and handoff boundaries. If the board is unavailable, retain task status in this plan and report the tracker limitation without blocking local work.

## File map

| File | Responsibility |
| --- | --- |
| scripts/commit-history/git.mjs | Binary-safe Git reads/writes through argument arrays |
| scripts/commit-history/inventory.mjs | Ref/worktree/object snapshot and commit evidence |
| scripts/commit-history/ledger.mjs | Complete decision validation, no inferred rewrites |
| scripts/commit-history/objects.mjs | Raw commit parsing and approved message/parent substitution |
| scripts/commit-history/rewrite.mjs | Topological isolated transformation, map generation |
| scripts/commit-history/verify.mjs | Independent graph, metadata, message, and ref verification |
| scripts/commit-history/cli.mjs | Read-only inventory/check commands and explicit isolated rehearsal command |
| scripts/commit-history/*.test.mjs | Focused unit and disposable Git integration tests |
| scripts/test-support/commit-history-fixture.mjs | Temporary fixture repositories and synthetic graphs |
| scripts/commit-scope-policy.mjs | Canonical vocabulary and ownership diagnostics |
| scripts/check-commit-scopes.mjs | Staged, range, and PR-title validation using common policy |
| scripts/commit-scope-policy.test.mjs | Domain classification and exception tests |
| scripts/check-commit-scopes.test.mjs | Local/CI invocation and range tests |
| docs/agents/commit-scopes.md | Scope rules, evidence-based review, examples |
| docs/runbooks/historical-commit-scope-repair.md | Inventory, backup, rehearsal, approvals, publication and rollback procedure |
| .github/workflows/commit-scopes.yml | Read-only PR/push validation |
| scripts/commit-scope-workflow.test.mjs | CI event/permission/checkout boundary assertions |
| .gitignore | Ignore protected local migration artifacts |
| commitlint.config.mjs, .husky/commit-msg, package.json | Integrate existing authoring/lint tools and focused test scripts |
| scripts/github-io-release.mjs and release tests | Bootstrap boundary independent of pre-rewrite SHA |
| AGENTS.md | Link repository scope contract without weakening general instructions |

## Shared data contracts

Store JSON with explicit schemaVersion: 1. Reject unexpected enum values and required-field omissions. All OIDs are full-length IDs for the repository's object format, obtained from Git; no abbreviated IDs in approval artifacts.

```js
// Inventory
{
  schemaVersion: 1,
  objectFormat: 'sha1',
  refs: [{ name, oid, role, reason }], // role: target | tracking | preserve
  worktrees: [{ path, head, branch, statusPorcelain }],
  commits: [{ oid, tree, parents, messageBase64, containingRefs, paths,
    signed, specialHeaders }]
}
// Ledger row: one per inventoried commit, including explicit keep rows
{
  oid, decision, // keep | change | manual-review
  originalMessageBase64, replacementMessageBase64, // null unless change
  domain, reason, evidence: [{ path, explanation }],
  changeKind, // none | scope | separately-approved-message-change
  releaseEffect, containingRefs
}
// Successful rehearsal report
{
  schemaVersion: 1, inventoryDigest, ledgerDigest, backupDigest,
  mapping: [{ oldOid, newOid }],
  refs: [{ name, oldOid, newOid }],
  verification: { commitCount, rootCount, treesEqual, parentsEqual,
    messagesEqual, metadataEqual },
  signaturePolicy: 'reject' // default; explicit accepted exception required
}
```

Approval artifacts include exact executable, argv, source/destination directories, selected ref tips, input digests, signature policy, and backup verification. They record the user's actual approval; a boolean generated by an agent is not approval.

### Task 1: Read-only inventory and validated decision ledger

**Target:** repository history tooling. **Blockers:** none.
**Files:** Create git.mjs, inventory.mjs, ledger.mjs, cli.mjs and corresponding inventory.test.mjs/ledger.test.mjs under scripts/commit-history/; create scripts/test-support/commit-history-fixture.mjs; modify package.json and .gitignore.

**Interfaces:** `git(cwd, args, input?) -> Buffer`; `snapshot(cwd) -> Inventory`; `validateLedger(inventory, rows, { requireResolved }) -> Map<oid, row>`; CLI `inventory --source PATH`, `check-ledger --inventory FILE --ledger FILE`. These commands never rewrite refs.

- [ ] Export `repositoryFixture(t)` from scripts/test-support/commit-history-fixture.mjs using mkdtempSync, git init, local fixture identity, and controlled files/commits. Return `{ cwd, commit(subject), git(...args) }`. Disable hooks only inside synthetic fixture repositories, never in the user's repo. Register cleanup only for the exact temporary directory created by that test. Tests import node:test as test, node:assert/strict as assert, and the named interfaces from the files assigned to each task.
- [ ] Add failing inventory/ledger tests. Include a branch sharing a root and a stash ref; enumerate distinct objects once and preserve all containing refs. Include unknown SHA, duplicate row, missing row, changed original bytes, change-without-reason, and unresolved manual-review cases.

```js
test('a syntactically valid header is not a complete decision ledger', () => {
  const original = Buffer.from('feat(skills): add search\n').toString('base64');
  const inventory = { schemaVersion: 1, objectFormat: 'sha1', refs: [],
    worktrees: [], commits: [{ oid: '1'.repeat(40), messageBase64: original }] };
  assert.throws(() => validateLedger(inventory, [], { requireResolved: true }),
    /missing decision/);
  assert.throws(() => validateLedger(inventory, [{
    oid: '1'.repeat(40), decision: 'manual-review',
    originalMessageBase64: original, replacementMessageBase64: null,
    domain: 'github.io', reason: 'ownership unresolved', evidence: [],
    changeKind: 'none', releaseEffect: 'unreviewed', containingRefs: []
  }], { requireResolved: true }), /unresolved/);
});
```

- [ ] Run `node --test scripts/commit-history/inventory.test.mjs scripts/commit-history/ledger.test.mjs`; verify a meaningful failure before implementation.
- [ ] Implement the binary-safe Git adapter and snapshot. Use for-each-ref with explicit separators, worktree list --porcelain, rev-list --topo-order --reverse over exact tips, cat-file commit, and root-aware diff-tree. Record merge paths per parent, never mistake an empty combined diff for no change. Inspect signed commits and embedded mergetag headers. Symbolic tracking HEAD is inventory metadata, not an independent rewrite target.

```js
export function git(cwd, args, input) {
  const result = spawnSync('git', args, { cwd, input, maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.toString('utf8'));
  return result.stdout;
}
```

- [ ] Implement ledger validation as set equality against inventory commit OIDs plus original-byte checks. Scope-only changes must preserve the body bytes and the parsed type, description, and breaking marker. Any wider difference requires changeKind separately-approved-message-change and explicit approval evidence before rehearsal. Reject unrecognized message encoding instead of lossy decoding.
- [ ] Expose only inventory/check-ledger commands initially. Add `test:commit-history` running `node --test scripts/commit-history/*.test.mjs`. Add `.history-repair/` to .gitignore in the linked worktree and document that it contains retained recovery material.
- [ ] Run the tests and CLI help/error cases. Inspect diff and staged diff, stage these exact task paths, and commit `feat(workflow): inventory commit scope decisions`.

**Acceptance/handoff:** Read-only snapshot and a fail-closed ledger checker work on synthetic histories. Unresolved real decisions remain visible; no source-history mutation.

### Task 2: Byte-preserving message transformation and independent verification

**Target:** repository history tooling. **Blocker:** Task 1.
**Files:** Create scripts/commit-history/objects.mjs, rewrite.mjs, verify.mjs, objects.test.mjs, rewrite.test.mjs, verify.test.mjs.

**Interfaces:** `parseCommit(raw) -> { headers, message }`; `transformCommit(raw, { parentMap, replacementMessage, signaturePolicy }) -> Buffer`; `rewriteObjects({ cwd, inventory, ledger }) -> mapping`; `verifyMapping({ source, destination, inventory, ledger, mapping }) -> verification`.

- [ ] Add a raw-object test that proves body and author bytes survive while the approved subject and parent ID change.

```js
test('changes only approved message and mapped parent bytes', () => {
  const oldParent = '1'.repeat(40), newParent = '2'.repeat(40);
  const header = `tree ${'3'.repeat(40)}\nparent ${oldParent}\n` +
    'author A <a@example.test> 1 +1030\ncommitter B <b@example.test> 2 -0700\n';
  const raw = Buffer.from(header + '\nfeat(skills): search\n\nBody stays.\n');
  const rewritten = transformCommit(raw, {
    parentMap: new Map([[oldParent, newParent]]),
    replacementMessage: Buffer.from('feat(github.io): search\n\nBody stays.\n'),
    signaturePolicy: 'reject'
  });
  assert.deepEqual(rewritten, Buffer.from(
    header.replace(oldParent, newParent) + '\nfeat(github.io): search\n\nBody stays.\n'));
});
```

- [ ] Add tests for multiple parents in order, empty messages/commits, unchanged identity, non-ASCII UTF-8, explicit encoding headers, gpgsig/gpgsig-sha256, embedded mergetag, missing parent mapping, and malformed headers. Default behavior rejects signature-bearing rewrites. Any later signature-removal mode must enumerate exact approved headers; unknown headers are preserved or explicitly rejected, never silently discarded.
- [ ] Run `node --test scripts/commit-history/objects.test.mjs scripts/commit-history/rewrite.test.mjs scripts/commit-history/verify.test.mjs`; verify failures.
- [ ] Implement raw parsing by locating the first double newline in the Buffer and preserving header records including continuation lines. Replace only parent header values and the approved message. Do not rebuild author/committer fields from parsed dates. Do not call commit-tree with ambient identity/date defaults.
- [ ] Implement topological object creation in the isolated destination. All source objects must already be available there. Reuse old OIDs for byte-identical commits; otherwise write raw commit bytes with hash-object. Do not update refs yet.

```js
const rewritten = transformCommit(original, {
  parentMap: mappedParents,
  replacementMessage: row.decision === 'change'
    ? Buffer.from(row.replacementMessageBase64, 'base64') : null,
  signaturePolicy: 'reject'
});
const newOid = rewritten.equals(original) ? oldOid :
  git(destination, ['hash-object', '-t', 'commit', '-w', '--stdin'], rewritten)
    .toString('ascii').trim();
```

- [ ] Implement the verifier independently of transformCommit. Compare read-back trees, ordered mapped parents, unchanged raw metadata, expected messages, complete map coverage, uniqueness, roots, and counts. Add negative tests that corrupt each invariant separately. Verify keep rows can still map to new identities when their ancestors changed.
- [ ] Run all commit-history tests. Commit the six new files with `feat(workflow): verify message-only history transformations`.

**Acceptance/handoff:** Synthetic graph transformations preserve every required invariant and signatures fail closed. No real-history object/ref rewrite has run.

### Task 3: Recoverable backup and guarded rehearsal command

**Target:** repository history tooling. **Blockers:** Tasks 1–2.
**Files:** Modify scripts/commit-history/cli.mjs; create scripts/commit-history/rehearsal.mjs and rehearsal.test.mjs; create docs/runbooks/historical-commit-scope-repair.md.

**Interfaces:** `prepareRehearsal({ source, runDirectory, inventory, ledger }) -> approvalPackage`; `rehearse({ backup, destination, inventory, ledger, approval }) -> report`. CLI adds `prepare` and `rehearse`, both with explicit source/input/output arguments; neither accepts a remote push command.

- [ ] Write integration tests using a disposable repository: a verified bundle restores all target/tracking/preserve tips; refusal on dirty source assumptions, mismatched ledger digest, moved tips, nonempty destination, missing approval evidence, or destination equal to source/common Git directory. The source status and ref listing must be byte-identical before and after a rehearsal fixture.
- [ ] Run `node --test scripts/commit-history/rehearsal.test.mjs`; verify failures.
- [ ] Implement prepare: validate inventory and resolved ledger; capture selected refs plus protected recovery refs in a bundle; run bundle verify; initialize a separate repository and fetch every inventoried ref explicitly from the bundle, including stashes and local-only refs; run fsck and check exact restored tips. A clone's default branch set is not proof all refs were restored. Hash inputs and backup; persist a concrete approval package. Record worktree porcelain status and warn that the bundle excludes uncommitted files.
- [ ] Implement rehearse: verify the approved input digests and exact frozen tips, reject unapproved signatures/tags, then call rewriteObjects and verifyMapping in a second isolated copy. After verification, install only target refs in one local update-ref transaction guarded by expected old tips. Preserve recovery refs at old OIDs and map tracking refs only as explicitly inventoried. Re-verify all tip mappings after the transaction.

```js
const transaction = [
  'start',
  ...targetRefs.map(({ name, oid }) => `update ${name} ${map.get(oid)} ${oid}`),
  'prepare', 'commit', ''
].join('\n');
git(destination, ['update-ref', '--stdin'], Buffer.from(transaction));
```

- [ ] Add a structured report containing full map, preserved refs, counts, input hashes, signature handling, verification results, and failures. Never clean up a failed real rehearsal automatically. Document explicit source/destination validation and restoration steps in the runbook; distinguish source-history permissions from fixture tests.
- [ ] Run commit-history tests and verify no network invocation is reachable from the CLI. Commit exact task files with `feat(workflow): prepare recoverable history rehearsals`.

**Acceptance/handoff:** Backup restoration and source immutability are tested; the real rehearsal still requires direct approval of its concrete package.

### Task 4: Complete the repository-wide historical decision ledger

**Target:** every inventoried repository domain. **Blockers:** Tasks 1 and 3.
**Files/artifacts:** Worktree-local .history-repair/preliminary/inventory.json, ledger.json, review.md; update docs/research/2026-09-09-commit-scope-audit.md with reviewed findings only. Generate artifacts through approved file-write tools; do not hand-edit generated OpenWiki.

**Interfaces:** Inventory/Ledger schemas from Task 1; output is a validated complete ledger, not a scope replacement regex.

- [ ] Refresh read-only GitHub refs/releases and local branches/worktrees/stashes. Fetch missing GitHub objects only through permitted Git commands with per-command approval when needed. Record inspection time and exact tips. Do not print credentials or unrelated uncommitted content.
- [ ] Run `node scripts/commit-history/cli.mjs inventory --source .`; save the structured output as the preliminary inventory. Keep a distinct disposition for stash/root/merge/generated deployment metadata.
- [ ] Partition review by disjoint full-SHA sets for subagent-driven execution: app implementation; app documentation; repository tooling/release/dependencies; historical projects and special commits. Require each reviewer to inspect change purpose and historical content, not only subject keywords. The main agent owns the merged ledger and duplicate/coverage checks.
- [ ] Resolve every row as keep/change/manual-review with evidence. Review all 23 existing scopes and unscoped messages; github.io is not a preapproved keep category. Include docs(README), app docs(openspec), concepts, version-control, unscoped Nx docs, the Astryx tooling candidates, and off-main date-interval. Keep legitimate OpenSpec/Nx/profile/tooling scopes. Resolve mixed ownership individually.
- [ ] For scope-only proposals, construct replacementMessageBase64 by replacing only the scope span in the header and preserving the rest of the original Buffer. Check type/description/body/breaking markers using validateLedger. Record type/description changes separately and leave them manual-review until explicitly accepted.
- [ ] Run `node scripts/commit-history/cli.mjs check-ledger --inventory .history-repair/preliminary/inventory.json --ledger .history-repair/preliminary/ledger.json`. Review coverage by ref and domain, accepted corrections, manual-review rows, and release/nonrelease effects. Do not claim completion while any selected ref has unresolved rows.
- [ ] Present the exact correction set for user acceptance where judgment or message changes need approval. Continue independent tooling and policy tasks while those decisions are pending. Update the audit with final counts and evidence, then commit only that tracked document as `docs(workflow): record repository-wide scope decisions`.

**Acceptance/handoff:** Every preliminary object has a substantive disposition and all proposed changes are reviewable. Generated ledger files remain recovery artifacts; the final snapshot is frozen after Tasks 5–6 and their documentation commits.

### Task 5: Bootstrap discovery that survives rewritten ancestry

**Target:** github.io release coordinator. **Blocker:** Task 1 contracts; independent of actual rewrite.
**Files:** Modify scripts/github-io-release.mjs, scripts/github-io-release.test.mjs, scripts/github-io-release-config.test.mjs and affected workflow fixtures if they assert the literal bootstrap SHA; modify docs/runbooks/github-pages-artifact-release.md.

**Interfaces:** Export `findGithubIoIntroduction({ target, cwd }) -> fullOid`; retain `bootstrapRelease({ target, start?, cwd })`, with undefined start resolved by discovery. Existing explicit start overrides remain supported and must be validated on target's first-parent ancestry.

- [ ] Add a failing disposable-history test whose root and introduction IDs have no relationship to 8acdd81. Introduce apps/github.io/project.json with its verified Nx name, integrate it via a real merge, and assert discovery returns the first-parent integration. Add a direct-introduction case, absent project, ambiguous remove/re-add case, and invalid explicit start case.

```js
test('bootstrap discovers the introduction in a fresh unrelated history', (t) => {
  const f = repositoryFixture(t);
  f.commit('chore: seed');
  f.write('apps/github.io/project.json', '{"name":"github.io"}\n');
  const introduction = f.commit('feat(github.io): scaffold app');
  f.commit('fix(github.io): correct label');
  assert.equal(findGithubIoIntroduction({ target: 'HEAD', cwd: f.cwd }), introduction);
  assert.equal(bootstrapRelease({ target: 'HEAD', cwd: f.cwd }).newVersion, '0.1.1');
});
```

- [ ] Extend the fixture from Task 1 with `write(path, text)` if needed, keeping it confined to its temporary directory. Run `node --test scripts/github-io-release.test.mjs`; verify the new assertions fail.
- [ ] Implement chronological first-parent tree inspection at the target: locate the first transition from absent project to valid apps/github.io/project.json with name github.io. Verify a single introduction lineage; removal/reintroduction or conflicting identity requires an explicit reviewed start. Traverse the target's history, not HEAD or all refs. Include the introduction integration in replay. Handle an introduction at the root without assuming start^ exists.
- [ ] Remove both default literal 8acdd81 uses in the API and CLI. Keep current bump rules and true-merge introduced-commit handling. Update tests/runbook to explain discovery and explicit reviewed overrides. Use Git blob reads, not executing historical project files.
- [ ] Run `pnpm test:release:github.io` with dependencies available in the execution worktree; never download packages as an implicit fallback. If setup is required, use the repo's pnpm workflow. Inspect the project graph before any app-level changes; this task should remain coordinator-only.
- [ ] Commit exact affected files with `fix(github.io): discover bootstrap boundaries from ancestry`.

**Acceptance/handoff:** A fresh clone containing only rewritten reachable history can bootstrap without old objects. Prior prepared release identities are inspected later; they are not automatically migrated by this fix.

### Task 6: Scope validation shared by local hooks and CI

**Target:** commit authoring/validation across the monorepo. **Blockers:** Task 4's scope decisions; no history rewrite required.
**Files:** Create scripts/commit-scope-policy.mjs, scripts/check-commit-scopes.mjs, their tests, scripts/commit-scope-workflow.test.mjs, docs/agents/commit-scopes.md, .github/workflows/commit-scopes.yml. Modify commitlint.config.mjs, .husky/commit-msg, package.json, AGENTS.md.

**Interfaces:** `SCOPES: string[]`; `checkScope({ subject, paths }) -> { errors: string[], review: string[] }`; CLI `--staged --message-file PATH`, `--base OID --head OID`, `--pr-title TITLE --base OID --head OID`. All modes reuse the same vocabulary and ownership function. Review diagnostics report domains needing human judgment; they do not fabricate approvals.

- [ ] Read the writing-for-agents skill before editing AGENTS.md, as required for agent instructions. Document exact canonical examples, legitimate unscoped cases, historical project scopes, mixed/root ownership, and the reviewer responsibility for documentation domains.
- [ ] Write failing tests covering app-only feat(skills), docs(README), valid feat(github.io), valid docs(profile), chore(nx), chore(openspec), dependencies, historical apps, date-interval, unscoped repo cleanup, and mixed docs/root changes needing review. Confirm app-specific root release scripts and Astryx checker scripts have distinct owners.

```js
test('checks ownership in addition to allowed scope syntax', () => {
  assert.ok(checkScope({ subject: 'feat(nx): add search',
    paths: ['apps/github.io/src/app/skills/search.tsx'] }).errors.length);
  assert.deepEqual(checkScope({ subject: 'docs(profile): update introduction',
    paths: ['README.md'] }).errors, []);
  assert.ok(checkScope({ subject: 'docs(github.io): document a decision',
    paths: ['docs/research/mixed-domain-study.md'] }).review.length);
});
```

- [ ] Run `node --test scripts/commit-scope-policy.test.mjs scripts/check-commit-scopes.test.mjs scripts/commit-scope-workflow.test.mjs`; verify the new tests fail before implementation.
- [ ] Implement vocabulary from the spec and historical-domain-aware ownership. For a single unambiguous owner require that scope; dependency-only and general workflow rules have explicit tests. Documentation paths alone produce review guidance unless ownership is established by a specific maintained rule. Reject invented or retired app subdomain scopes with suggested headers. Preserve Conventional Commit body/breaking handling through commitlint.

```js
// scripts/commit-scope-policy.mjs
export const SCOPES = [
  'github.io', 'github-pages', 'gh-pages', 'date-interval', 'profile',
  'nx', 'openwiki', 'openspec', 'codex', 'commitizen', 'commitlint',
  'astryx', 'deps', 'deps-dev', 'release', 'workflow'
];
```

```js
// commitlint.config.mjs
import { SCOPES } from './scripts/commit-scope-policy.mjs';
export default {
  extends: ['@commitlint/config-conventional'],
  rules: { 'scope-enum': [2, 'always', SCOPES] }
};
```

- [ ] Keep the hook's existing commitlint command and add the staged ownership check with a safely quoted message-file argument. The CLI must use Git argument arrays and validate OIDs, never interpolate PR titles or commit content into shell commands. Treat renames with both paths and root commits explicitly.
- [ ] Define new-commit range behavior: PR checks compare the PR base/head graph and validate both the proposed squash title and introduced commit subjects. Push checks compare event before/after tips. If before is absent, unreachable after a rewrite, or all-zero for a new branch, emit an actionable adoption diagnostic rather than silently linting all legacy history; require a documented explicit baseline for that exceptional run. Ordinary merge headers are allowed, but introduced scoped commits are checked. This may be stricter than squash-only policy and must be documented.
- [ ] Add read-only pull_request and push CI, permissions contents: read, full history, no persisted checkout credentials, no pull_request_target, and no secrets. Reuse checkout/setup-node/pnpm action SHAs already pinned in release-github-io.yml. Pass event data through environment variables or read GITHUB_EVENT_PATH as JSON; do not embed expression text into shell scripts. Install with the frozen pnpm lockfile, run commitlint plus the common checker, and surface review diagnostics in job output.
- [ ] Add package scripts `test:commit-scopes` for the three test files and `check:commit-scopes` for the CLI. Update AGENTS.md with a link to docs/agents/commit-scopes.md and product-scope examples; preserve the general domain-based rule and existing approvals.
- [ ] Run policy/CLI/workflow tests, validate representative headers with installed commitlint, and review workflow permissions, range semantics, and injection handling. Commit exact task files as `feat(commitlint): enforce repository scope ownership`.

**Acceptance/handoff:** New commits receive consistent local/CI diagnostics without retroactive blanket failures. Human review remains explicit for genuinely ambiguous documentation; the policy does not claim path-only semantic certainty.

### Task 7: Freeze, approve, and verify the real rehearsal

**Target:** exact reviewed repository refs in an isolated copy. **Blockers:** Tasks 1–6, resolved decisions, required code review.
**Artifacts:** .history-repair/<run-id>/inventory.json, ledger.json, backup.bundle, approval.json, report.json, release-comparison.json, review.md; isolated restored and rewritten repositories inside the same protected run directory.

**Interfaces:** Task 3 prepare/rehearse plus Task 5 bootstrap API. Final artifacts are tied to exact digests and tips; preliminary artifacts are not execution approval.

- [ ] Run `pnpm test:commit-history`, `pnpm test:commit-scopes`, and `pnpm test:release:github.io`. Complete the required Codex review and resolve findings. Follow docs/agents/openwiki.md for verified implementation changes and report updated/unchanged/blocked. Finish any resulting ordinary docs commits before freezing source tips.
- [ ] Refresh all refs and re-inventory. Carry forward decisions only when original OID/message matches; review every new commit and any new ref. Freeze final source tips after tool/docs changes. Verify complete ledger coverage again.
- [ ] Prepare and restore-verify the backup. Inspect GitHub prepared artifacts/releases and signed objects; record explicit retain/migrate/reject decisions for any old source identity or signature. If artifact inspection is unavailable, leave publication blocked rather than claiming no prepared state exists.
- [ ] Present concrete source/destination paths, exact target refs and tips, correction count/list, signature policy, input hashes, and the exact rehearsal invocation for direct user approval. Do not run the real rewrite command while approval is pending. This is required by the approved spec and user's history-rewrite contract, not an optional execution-mode question.
- [ ] After approval, execute only the approved rehearsal. Verify every mapped tree/parent/message/metadata field and all refs, and retain the full report and failure output. Read the active repository's refs/status again to prove it stayed unchanged.
- [ ] Create a fresh verification clone containing only the mapped target histories; confirm old IDs are not being consulted for bootstrap. Run the corrected coordinator at mapped main. Compare ordered integrations and versions to the old snapshot, annotate changes from every approved scope/type decision, and report actual results rather than hardcoding 0.152.3.
- [ ] Prepare a concise migration review artifact with backup restoration evidence, exact old/new refs, map location, scope corrections, test/review status, release comparison, worktree implications, and remaining publication gates. Do not commit this artifact into the frozen input history; keep it alongside the protected run artifacts until handoff.

**Acceptance/handoff:** A fully verified real rehearsal exists and is reviewable. Active repository history, remotes, releases, and deployments are unchanged. Move to awaiting handoff.

### Task 8: Explicit publication and recovery handoff

**Target:** only directly approved GitHub refs and local worktrees. **Blockers:** Task 7 and explicit handoff/force-push approval. **Files:** use docs/runbooks/historical-commit-scope-repair.md; record execution receipts alongside frozen artifacts.

- [ ] Refresh exact remote tips and compare them against the frozen expected values. Any difference invalidates the publication package; re-inventory/rehearse affected history rather than weakening leases. Check remote tags/releases/prepared artifacts again.
- [ ] Present an argv array built from exact approved ref names and OIDs: git push --atomic, one explicit --force-with-lease=<ref>:<oldOid> per updated remote ref, the verified GitHub remote, and one <newOid>:<ref> refspec per target. Never publish local-only/stash refs or delete refs. Ask for direct approval of this exact operation; auto-review may not approve force pushes under the user's contract.
- [ ] After approval, publish from the verified isolated repository with atomic explicit leases. If the remote rejects atomic updates, stop and prepare a separately approved partial-publication strategy. Do not retry without atomicity automatically.
- [ ] Verify remote ref equality to the map. Reconcile local tracking/branch/worktree state one workspace at a time, preserving uncommitted changes and obtaining any additional permission needed for destructive local transitions. Never use a broad reset or cleanup command.
- [ ] Retain old tips and backup. The rollback proposal uses oldOid:newRef with leases expecting the actually observed rewritten tips, again requiring direct approval. Explain changed commit links and PR implications.
- [ ] If the user separately requests bootstrap/deployment, review a new immutable source/version pair and use the established release workflow. Verify tag, release record, artifact metadata, and live footer agree. Do not infer deployment permission from rewrite approval.

**Acceptance/handoff:** Approved remote/local refs are reconciled, recovery remains available, and no unapproved ref deletion or deployment occurred. If handoff has not been requested, stop with the verified package ready.

## Plan self-review and execution status

Spec coverage: inventory/ledger → Tasks 1/4; raw preservation/signatures → Task 2;
backup/rehearsal → Tasks 3/7; operational SHA and release compatibility → Tasks 5/7;
future validation → Task 6; protected publication/worktrees/rollback → Task 8.
Task interface names and schemas are defined above; any implementation refinement
must keep consumers synchronized. No actual ledger verdict, signature approval,
remote force command, or bootstrap version is fabricated by this plan.

Execution has not started. Use subagent-driven development when execution is
requested; the plan does not offer an alternative execution mode. The first
required external decision during execution is any unresolved ledger judgment,
followed by approval of the concrete real-history rehearsal package.
