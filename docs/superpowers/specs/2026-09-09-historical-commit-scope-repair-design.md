# Repository-wide historical commit scope repair

Date: 2026-09-09
Status: approach approved; written spec awaiting review

## Goal

Correct inaccurate historical commit scopes throughout this repository, including
documentation and tooling changes that do not affect releases. Preserve the
contents and structure of history while making its messages consistent with
domain ownership and the existing Conventional Commit release contract. Add
validation that prevents the same errors in new commits.

The user approved this approach after clarifying that they are the sole developer
and that the scope includes every repository domain, not only github.io.
Publication, force operations, and changes to existing active branch history
require the separate direct approvals defined below.

## Evidence and audit boundary

The [audit and proposal](../../research/2026-09-09-commit-scope-audit.md) records
the initial inspection at main fba4865083a81ea3d4fd2124ba0d25ed1ddfeb75.
It screened 1,635 reachable commits, including 1,165 reachable from main, across
23 named scopes. This was header/path screening with focused candidate review,
not a completed semantic decision ledger for every commit.

At inspection, remote main matched and GitHub exposed no tags or releases.
These are snapshot observations. Refresh the inventory before execution; include
new commits and changed refs rather than treating this document's counts as fixed.

The original release bootstrap calculated 0.142.3. A scope-only comparison for
the 32 main app-scope candidates calculated 0.152.3. Neither result approves a
future release. All accepted corrections and the final target determine the
version to review before bootstrap.

## Scope contract

Scope identifies the affected product, package, tool, or domain. It is not chosen
from the file extension, documentation directory, generator, or planning tool.

| Change purpose | Scope policy |
| --- | --- |
| github.io app, app-specific design/docs, or dedicated release/deploy behavior | github.io |
| Historical React github-pages app | github-pages |
| Historical Astro gh-pages app | gh-pages |
| date-interval package | date-interval when the package dominates the change |
| GitHub profile introduction/contact content | profile |
| Nx workspace configuration and migration | nx |
| OpenWiki integration, operation, or generated evidence | openwiki |
| OpenSpec tooling/configuration | openspec |
| Codex integration/MCP configuration | codex |
| Commit authoring or validation tooling | commitizen or commitlint respectively |
| Astryx agent-document maintenance tooling | astryx |
| Dependency-only maintenance | deps or deps-dev as appropriate |
| Repository-wide release research/tooling | release when it is the affected domain |
| Repository-wide working practices | workflow, or no scope when no domain dominates |

For github.io, put home/skills/experience/navigation/roadmap subdomains in the
description or body. Domain-based app docs follow the same product ownership.
For example, docs(README) describing personal contact links becomes docs(profile),
while docs(openspec) describing app filtering becomes docs(github.io).
Actual OpenSpec configuration retains openspec.

This is an evidence-based vocabulary, not a blanket string replacement table.
App integration fixes mentioning Astryx may belong to github.io, whereas fixes
to its agent-document checker may belong to astryx. Existing github.io subjects
must receive the same ownership review as other scopes. Mixed changes require
an explicit dominant-domain decision; do not invent multiple owners from paths.

Missing scopes are allowed for genuinely repository-wide changes. Ordinary merge
subjects, legacy root commits, generated deployment history, reverts, and stash
metadata receive explicit dispositions rather than automatic normalization.

## Deliverables and responsibilities

### 1. Ref inventory and per-commit decision ledger

Inventory local branches, advertised remote branches, tags, linked worktrees,
and stash refs. Identify distinct commit objects reachable from their tips.
Classify each ref as a rewrite target, a mapped tracking ref, or preserved
recovery metadata. Include off-main and historical projects in the review;
they are not excluded merely because github.io does not release them.

The inventory records full ref names, exact old tips, remote association,
worktree association and cleanliness, and inclusion rationale. Stash containers
remain protected recovery metadata. Unreachable/reflog-only objects and unfetched
PR refs are outside the initial inventory; do not claim they were reviewed.

Every inventoried commit receives a ledger disposition: keep, change, or manual
review. Record full SHA, original subject, proposed subject when changed, domain,
evidence paths and reasoning, containing refs, and release effect separately.
Inspect candidate diffs and documentation content, using the historical context
at the commit rather than assuming today's directory ownership always applied.
Repeated subjects do not imply duplicate logical changes or permission to remove
commits. Resolve every manual-review row affecting a selected ref before rewrite.

Scope changes preserve type, description, bodies, and breaking markers by default.
Potential type/description mistakes, such as feat: temp or test-only fix commits,
are separate proposals requiring explicit acceptance in the reviewed ledger.

Validate full SHAs, unique rows, exact original-message matches, complete coverage,
and a reason for every changed message. The ledger is the sole transformation
input; a broad scope alias or keyword rule cannot authorize a rewrite.

### 2. Backup and isolated rewrite

Capture all selected refs in a recoverable backup, including refs that retain
objects needed by local branches and stashes. Verify object integrity and restore
the backup into a separate location before proceeding. A Git bundle does not
capture uncommitted files: inspect worktrees individually and preserve their
tracked and untracked changes separately before any later reconciliation.
Do not implicitly stash, reset, delete, or discard user work.

Prepare the exact isolated rewrite command and target list for direct approval.
Run the approved transformation in a separate copy; do not move the active
repository's existing branch tips during rehearsal. Disable empty-commit pruning,
merge simplification, and other incidental history changes. Generate a complete
old-to-new commit map for all commits reachable from selected refs.

For every mapped pair, preserve tree object, ordered mapped parents, author and
committer identities, and their timestamps. Keep root count and commit count
unchanged. Messages must equal the ledger's approved replacements or their
original bytes. Leave unchanged ancestry untouched where no rewritten ancestor
requires a new identity. Detect signed commits/tags before transformation:
signature invalidation must be reported and its removal/re-signing policy approved,
not silently presented as preserved metadata.

Fail before ref installation if the ledger, original messages, backup, object
verification, or graph comparison disagrees. Preserve diagnostic output and the
isolated copy for inspection. Never repair a failed rehearsal by modifying the
source repository or weakening verification.

### 3. Operational compatibility and release validation

The message rewrite itself must preserve every file tree. Operational code/config
updates are separate ordinary commits whose diffs are independently reviewable.
This distinction permits exact tree verification while fixing consumers of old
commit identities.

The release coordinator's bootstrap default currently references 8acdd81. An
earlier rewritten ancestor can change that commit's identity even if its message
does not change. Replace or resolve the operational introduction boundary against
the rewrite map and verify it on the rewritten main ancestry. The strategy must
work in a fresh clone that does not retain the old objects.

Inspect other operational SHA references, workflow artifacts, prepared release
records, signatures, and branch consumers. Do not silently reuse a prepared release
whose source identity belongs to old history. If such state exists, report its
concrete recovery/migration decision before publication. Historical citations may
retain old SHAs as provenance accompanied by the migration map; do not recursively
edit every historical document.

Keep the normal exact-scope classifier and bump rules. No permanent historical
alias adapter is needed when the messages themselves are repaired. Produce an
ordered replay report with mapped integrations, original/corrected contributors,
one highest bump per integration, and explained version transitions. Ordinary
merge headers and introduced commits must follow the coordinator's actual rules.

### 4. Prevention for future commits

Document the scope vocabulary and align commitlint, local hooks, commit prompts,
CI, and repository agent guidance. Validate the messages that the actual merge
method introduces: PR titles for squash where applicable, introduced commits for
true merges, and direct commit messages. An allowed scope can still be the wrong
scope, so add project/tool ownership checks where changed paths establish it.

Documentation and mixed root-file changes can need human domain review; provide
actionable diagnostics and a documented review path rather than pretending a
directory-to-scope rule is sufficient. Allow legitimate repository-wide unscoped
commits. Define an explicit enforcement boundary for new commits; do not make CI
fail indefinitely on historical keep decisions or recovery metadata.

## Verification and acceptance

- Inventory and ledger cover every commit reachable from selected refs, with no
  unresolved disposition, duplicate SHA, or unverified original message.
- Backup integrity and restoration pass before transformation.
- Each old/new tree matches, parents match through the map in order, and metadata
  differs only by approved messages and explicitly approved signature handling.
- All target tips map correctly; unrelated refs and active worktrees remain intact.
- Synthetic histories cover root commits, branches sharing ancestors, true merges,
  squash/direct commits, repeated subjects, empty commits, reverts, and signatures.
- Negative fixtures cover unknown SHAs, mismatched messages, incomplete ledgers,
  incorrect mappings, changed trees, and a remote tip moving after approval.
- Fresh-clone bootstrap resolves the mapped introduction boundary and produces
  the reviewed chronological version calculation. Prepared old-identity release
  state cannot be silently treated as a release of rewritten history.
- Commit validation accepts legitimate project/tool/docs/unscoped examples and
  rejects the audited wrong-scope patterns with clear correction guidance.
- Run the focused history/validation tests, the full pnpm test:release:github.io
  suite for release changes, and required Codex review of nontrivial implementation.
  Run app checks only if ordinary implementation commits affect app behavior.

## Publication and worktree reconciliation

Before publication, refresh remote tips, tags, releases, prepared artifacts, and
worktree states. A new ref or changed tip requires inventory/ledger/verification
refresh; elapsed time is not approval. Present exact old/new tips, target refs,
backup location, SHA map, changed messages, validation, and release impact.

Direct user approval is required for force publication. Use explicit named refs
and expected-old-SHA leases. Do not use a mirror push, unconditional force, remote
deletion, or broad automatic branch cleanup. Preflight checks alone do not replace
server-side lease checks. If multiple approved refs cannot be updated atomically,
report the partial-publication strategy and obtain approval before publishing.

Reconcile local branches and linked worktrees individually only after protecting
their uncommitted work. Do not infer approval to reset a dirty worktree from the
approval to rewrite history. Explain affected PRs and commit links, and keep the
backup until the user accepts the migration. Document rollback using saved old
tips; any rollback publication also requires approval and current-tip checks.

Bootstrap/deployment is a separate handoff with a new immutable target/version
pair. Verify tag, release record, artifact metadata, and live footer agree.

## Boundaries and workflow gates

This work does not redesign release semantics, consolidate historical projects,
reorder/squash/drop commits, or change historical code contents. It does not
automatically rename branches, delete refs, move worktree work, or publish releases.

Approval of this written spec authorizes detailed planning. The implementation
plan uses subagent-driven development as required by the standing instructions.
Actual history rewrite and force-publication operations remain subject to direct
approval of concrete targets and commands under the user's approval contract.

After implementation and verification, evaluate OpenWiki using the repository's
maintenance procedure. This design-only change leaves the generated wiki unchanged.
