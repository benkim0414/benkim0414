# Historical commit scope repair rehearsal

This runbook prepares a recoverable local backup and, only after direct approval of an exact package, rehearses message-only history changes in an isolated repository. It never pushes, updates source refs, or authorizes publication.

## Permission boundary

The automated tests use disposable repositories under the system temporary directory. Their success does not authorize running `prepare` or `rehearse` against repository history. A real run belongs to the later freeze-and-approval task and requires direct approval of the generated executable, arguments, paths, frozen tips, input digests, backup digest, signature policy, and any exact signature allowlist.

An approval boolean is not evidence. Populate `approvalEvidence` only from the user's explicit response to the exact generated package:

```json
{
  "kind": "direct-user-approval",
  "statement": "<the user's approval of this exact package>",
  "approvalDigest": "<the approvalDigest from this exact package>"
}
```

The tool recomputes the canonical digest of every immutable package field and requires the evidence to identify that exact digest. This includes the full signature allowlist, its digest, and protected copied path when signature removal is selected. This binding records which package was approved, but does not authenticate the human statement by itself; the controller must record the user's actual approval. Do not reuse approval after any source ref, worktree set or state, input, signature authorization, path, executable, argument, or backup changes.

## Prepare a backup

Start with a complete, resolved inventory and ledger. Choose a new empty protected run directory outside Git storage. A source-local path is permitted only at `.history-repair/<run-id>`; canonical Git-directory descendants, symlink aliases, and unsafe ancestor paths are rejected before writes. The prepare command persists canonical input copies, `backup.bundle`, a restored bare repository, and `approval.json`:

```text
node scripts/commit-history/cli.mjs prepare \
  --source <absolute-source-path> \
  --inventory <inventory.json> \
  --ledger <ledger.json> \
  --run-directory <empty-run-directory> \
  --output <run-directory>/approval.json
```

The default signature policy is `reject`. To prepare the narrowly enumerated
`remove-approved` policy, add `--signature-allowlist <allowlist.json>`. The file
is a JSON array whose entries contain exactly these fields:

```json
[
  {
    "oid": "<original-full-commit-oid>",
    "header": "gpgsig",
    "sha256": "<sha256-of-exact-raw-header-record>"
  }
]
```

`header` may be only `gpgsig` or `gpgsig-sha256`. The hashed record is the
header name, one ASCII space, and the complete header value including
continuation-line leading spaces and internal LF bytes, but excluding the
record's trailing LF. Duplicate, malformed, unknown, mismatched, and unused
entries are rejected. Preparation validates every tuple against the source
objects and the ancestry/message changes predicted by the ledger before it
creates the run directory or backup. It then writes the exact validated array
to the protected `signature-allowlist.json` inside the run directory.

Preparation validates the ledger, freezes every inventoried target/tracking/preserve ref, verifies the bundle, fetches every direct ref explicitly into `restored.git`, recreates symbolic tracking refs, runs strict fsck, verifies every exact tip, and proves every inventoried commit can be read back. Recovery refs such as `refs/stash` and `refs/original/*` remain exact old OIDs.

Detached worktree history with no containing ref is rejected before backup creation. The tool will not create a temporary source ref. Resolve that condition deliberately, then generate a new inventory and ledger.

Git bundles exclude tracked and untracked worktree changes. The approval package records each worktree's porcelain state, but those files must be preserved separately before any later reconciliation. The tool never stashes, cleans, resets, or deletes them.

## Inspect and approve

Before requesting approval, inspect:

```text
git -C <absolute-source-path> bundle verify <run-directory>/backup.bundle
git -C <run-directory>/restored.git fsck --full --strict
git -C <run-directory>/restored.git for-each-ref --sort=refname
```

Compare `approval.json` with the final inventory, ledger, and protected signature allowlist. Confirm the fixed destination is empty and differs from both the source and its common Git directory. Annotated tags require a separate approved policy and are rejected by this workflow. Direct commit signatures fail closed if a rewrite would change the signed commit identity unless every signature record on that changed identity has one exact `remove-approved` tuple. Unchanged signed identities retain their signature headers byte-for-byte. Mergetag-bound parent remaps remain fail closed.

## Run an approved rehearsal

After direct approval has been recorded without changing any other package field, run only the exact `executable` and `argv` from `approval.json`. Rehearsal compares the normalized actual invocation—including inventory, ledger, approval, backup, destination, and output paths—with those approved arguments. Its rendered form is:

```text
node scripts/commit-history/cli.mjs rehearse \
  --backup <run-directory>/backup.bundle \
  --destination <run-directory>/rewritten.git \
  --inventory <run-directory>/inventory.json \
  --ledger <run-directory>/ledger.json \
  --approval <run-directory>/approval.json \
  --output <run-directory>/report.json
```

For `remove-approved`, the exact frozen invocation also ends with:

```text
  --signature-allowlist <run-directory>/signature-allowlist.json
```

The rehearsal restores the verified bundle into a second bare repository, writes raw transformed commit objects, independently verifies the full mapping, and updates only inventoried target/tracking refs in one guarded local transaction. The verifier independently derives every removed signature tuple from the original and destination objects, rejects any other metadata change, and records the exact removals and allowlist digest in the report. It refuses to overwrite a pre-existing report. Preserve refs retain their old OIDs. Symbolic tracking refs retain their exact targets. The source's refs and worktree state are checked before and after.

There is no remote or push option. Publication and source-history changes require later, separate gates.

## Failure and restoration

Do not delete or repair a failed real rehearsal automatically. Preserve the run directory and diagnostics for review. Never weaken a failed digest, tip, signature, tag, graph, or source-state check.

The verified backup can be inspected or restored into another new empty bare repository without touching the source:

```text
git init --bare <new-restore-path>
git -C <new-restore-path> fetch --no-tags <run-directory>/backup.bundle <exact-ref>:<exact-ref>
git -C <new-restore-path> fsck --full --strict
```

Repeat the fetch once for each direct ref listed in `approval.json`, then recreate each recorded symbolic ref with `git symbolic-ref`. Verify every restored tip against the approval package before considering it a recovery copy.
