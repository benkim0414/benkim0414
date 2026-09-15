---
type: operational-workflow
title: Guarded historical commit repair
description: How commit history is inventoried, reviewed, backed up, and verified in an isolated rehearsal without publishing rewritten refs.
tags: [git, conventional-commits, history-repair, verification]
verified:
  - by: openwiki/0.5.0
    at: 2026-09-15T10:54:57.218Z
sources:
  - id: openwiki-source-e119253b3c3737247dc63f2a
    resource: repo://.openwikiignore
  - id: openwiki-source-cdda5d4e7c9cf1bdd3f5a61c
    resource: repo://docs/runbooks/historical-commit-scope-repair.md
  - id: openwiki-source-b8e270ffd646a5e85c13d336
    resource: repo://scripts/commit-history/inventory.mjs
  - id: openwiki-source-ba7ac881f6811a0a2a8a53ad
    resource: repo://scripts/commit-history/ledger.mjs
  - id: openwiki-source-98fa4304b8b544f1bcc850d6
    resource: repo://scripts/commit-history/rehearsal.mjs
  - id: openwiki-source-9b2a282b958514f27a3b0a3f
    resource: repo://scripts/commit-history/verify.mjs
  - id: openwiki-source-c86e8e2ae13bb4da0db6f627
    resource: repo://scripts/commit-history/verify.test.mjs
generated: { by: "codex", at: "2026-09-10T11:47:00.605Z" }
---

# Guarded historical commit repair

The history tooling under `scripts/commit-history/` separates deciding what a
message should say from constructing and verifying a replacement Git graph.
Use the [canonical runbook](../../docs/runbooks/historical-commit-scope-repair.md)
for operational commands and approval requirements. Passing fixture tests is
not permission to rewrite repository history.

## Inventory and decisions

`inventory` reads refs and linked-worktree heads, deduplicates their reachable
commits, and records original message bytes, tree IDs, ordered parents,
containing refs, and per-parent changed paths. This makes shared ancestry and
merge ownership explicit. Ref records are split as raw bytes before decoding,
so valid non-ASCII ref names are preserved; names that cannot be represented
losslessly as UTF-8 are rejected rather than silently altered.

`check-ledger` requires exactly one decision for every inventoried commit and
rejects missing, duplicate, unknown, or unresolved rows. A scope-only correction
must retain the original type, description, breaking marker, and body bytes.
Wider message changes use a separate evidence-bearing decision kind; an allowed
scope or a valid schema alone is not human approval of the proposed edit.

## Backup and approval boundary

`prepare` validates the inputs and frozen source state before creating a bundle
and restoring its exact refs into a bare repository. It verifies the bundle,
restored tips, and availability of every inventoried commit. Detached-only
history without a containing ref is rejected instead of creating source refs
implicitly. Bundles do not save uncommitted worktree files; preserve those
separately before any later reconciliation.

The approval package binds the executable, arguments, input and backup digests,
source refs, worktree state, and destination. The recorded human statement must
refer to that package's digest. This records the approved package but does not
authenticate a human statement: the operator must obtain actual direct approval.
A changed input or source state requires a newly reviewed package.

## Isolated transformation and verification

An approved `rehearse` restores the backup into a second bare repository, writes
replacement commit objects, and independently reads the resulting graph back.
Verification checks complete one-to-one mapping coverage, root counts, identical
trees, ordered mapped parents, expected message bytes, and unchanged metadata
and header placement. Only after verification does a guarded local transaction
install mapped target/tracking refs. Recovery refs retain their original IDs;
the source refs and worktree set/state are checked before and after the operation.

The default signature policy is **reject**: a signed commit whose identity would
change stops preparation or rehearsal. The opt-in `remove-approved` policy
requires an exact allowlist of original commit ID, signature header name, and
SHA-256 of the raw header record without its trailing LF. Preparation checks
every entry against the source and approved message/ancestry changes before
creating a backup, then binds the protected allowlist copy and digest into the
approval package and exact invocation. Unknown, duplicate, mismatched, or unused
entries fail closed; there is no blanket stripping or re-signing.

The independent verifier derives removal eligibility from the approved message
and ordered mapped parents, not from a supplied destination ID. An otherwise
unchanged signed commit must retain its signature. Removed headers are recorded
as exact tuples in the verification report; the original signed objects remain
in the backup and retained recovery history. Even an unchanged message acquires
a new commit ID when its parent changes, so signature handling must consider
ancestry, not just edited messages. Mergetag-bound parent remaps and annotated
tags still require unsupported handling and are rejected. Existing report files
are protected against overwrite.

## Failure, recovery, and downstream release checks

Keep failed run artifacts and diagnostics for inspection; do not weaken checks
or automatically remove recovery data. The CLI has no remote or push mode.
Publishing rewritten refs, reconciling other worktrees, and deploying releases
remain separate decisions. Local `.history-repair/` artifacts are excluded from
OpenWiki evidence.

After an approved successful rehearsal, validate the mapped history through the
[release coordinator](releases.md) and compare replayed integrations and versions.
Its bootstrap introduction discovery avoids relying on an old fixed commit ID.
See [validation](../workflows/validation.md) for fixture suites and future-commit
scope enforcement; those checks complement, but do not replace, per-commit review.
