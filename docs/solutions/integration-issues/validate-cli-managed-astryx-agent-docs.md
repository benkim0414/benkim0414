---
title: Validate CLI-managed Astryx agent documentation
date: 2026-08-13
category: integration-issues
module: Astryx agent documentation tooling
problem_type: integration_issue
component: tooling
symptoms:
  - A byte-current Astryx block could pass while its markers were in a Markdown context that made the guidance inoperative
  - Refresh could accept an unintended target or recreate a deleted production guide without its handwritten rules
  - A zero-exit Astryx CLI run could leave output missing, malformed, or stale
  - Temporary cleanup failures could obscure the primary generation failure
root_cause: missing_validation
resolution_type: code_fix
severity: medium
related_components:
  - development_workflow
  - documentation
  - assistant
tags:
  - astryx
  - agents-md
  - commonmark
  - managed-docs
  - postcondition-validation
  - target-containment
  - cleanup-errors
---

# Validate CLI-managed Astryx agent documentation

## Problem

A CLI-managed block in an app-level `AGENTS.md` can appear current while still
being unusable or unsafe to refresh. Byte equality and a zero exit status do
not prove that the markers are active top-level Markdown, that the intended
file was the only target, or that the CLI produced the expected postcondition.

## Symptoms

- The freshness check passes even though the marker pair is inside a block
  quote, list item, code span, fenced or indented code block, or raw HTML block,
  so Markdown consumers do not see the generated guidance as active top-level
  instructions.
- A successful CLI process leaves the target missing, malformed, or stale, yet
  the refresh command reports success.
- A caller can redirect a production refresh or check to another repository
  file.
- Refresh recreates a missing guide instead of preserving the handwritten
  contract that should surround the managed block.
- A cleanup failure hides the generation or comparison failure that caused the
  command to fail.

## What Didn't Work

Counting one start string and one end string is necessary, but it validates
only delimiter cardinality and order. It does not establish the Markdown
context in which those strings occur. In CommonMark, a visually standalone
comment can still belong to a container or leaf block, and boundary rules vary
by construct: a list can retain lazy continuation state, type-7 HTML starts
only outside an active paragraph, and headings or thematic breaks can terminate
paragraph state.

Checking only fenced and four-column-indented code is also incomplete. It
misses block quotes, list nesting, multiline code spans, the seven raw-HTML
block families, and paragraph boundaries. Conversely, treating every
HTML-looking line as a block start creates false rejections because a complete
custom tag can continue an existing paragraph.

Finally, treating `status === 0` as the refresh contract confuses process
completion with application success. A CLI can exit successfully without
writing the requested file or replacing its stale block. Restoring another
file after the CLI runs also widens the mutation surface and masks unintended
writes instead of preventing them.

## Solution

Make the repository wrapper a fail-closed, single-target transaction whose
success condition is independently recomputed.

1. Fix the executable commands to `apps/github.io/AGENTS.md` and reject
   positional target arguments. The checker and refresher define that production
   target, and their executable entry points reject extras
   (`scripts/check-astryx-agent-docs.mjs:18`,
   `scripts/check-astryx-agent-docs.mjs:702`,
   `scripts/refresh-astryx-agent-docs.mjs:15`, and
   `scripts/refresh-astryx-agent-docs.mjs:77`). Internal function parameters
   remain injectable for isolated tests, but the user-facing commands cannot
   redirect production writes.
2. Resolve every target within the repository, rejecting absolute paths,
   lexical traversal, and existing or dangling symlink escapes
   (`scripts/check-astryx-agent-docs.mjs:574`). Require the production guide to
   exist before invoking the CLI so refresh cannot silently replace its
   handwritten surroundings (`scripts/refresh-astryx-agent-docs.mjs:21`).
3. If marker text already exists, validate the complete managed span before
   mutation (`scripts/refresh-astryx-agent-docs.mjs:27`). This prevents refresh
   from guessing how to repair orphaned, duplicated, or crossed markers.
4. Invoke the installed Astryx executable with its explicit
   `--agent-docs-path` and fail on startup or non-zero status
   (`scripts/refresh-astryx-agent-docs.mjs:31`). Do not snapshot and rewrite the
   repository-root `AGENTS.md`; containment belongs in the explicit target and
   path checks.
5. After the CLI exits successfully, run the same independent freshness checker
   used by CI (`scripts/refresh-astryx-agent-docs.mjs:64`). The checker asks the
   installed CLI to generate a fresh block in a repository-local temporary file
   and compares that extracted block byte for byte with the checked-in block
   (`scripts/check-astryx-agent-docs.mjs:650`). Missing, malformed, and stale
   results therefore fail the refresh postcondition.
6. Treat marker operability as a Markdown parsing problem. The scanner
   classifies paragraph, heading, thematic-break, list-item, fenced-code,
   indented-code, raw-HTML, and block-quote state
   (`scripts/check-astryx-agent-docs.mjs:189`,
   `scripts/check-astryx-agent-docs.mjs:238`, and
   `scripts/check-astryx-agent-docs.mjs:275`). A marker is accepted only as a
   standalone comment line with at most three leading spaces, outside an active
   code span and outside list containers; active fenced-code and raw-HTML leaves
   reject embedded marker text (`scripts/check-astryx-agent-docs.mjs:439` and
   `scripts/check-astryx-agent-docs.mjs:546`).
7. Always attempt temporary-directory cleanup, but retain the primary generation
   or comparison error. If cleanup also fails, aggregate both errors and render
   nested failures primary-first (`scripts/check-astryx-agent-docs.mjs:48` and
   `scripts/check-astryx-agent-docs.mjs:661`).

The critical postcondition is deliberately explicit:

```js
if (result.status !== 0) {
  throw new Error(`Astryx CLI failed (${result.status}).`);
}

checkAstryxAgentDocs({ repoRoot, targetRelativePath });
```

The first check covers process failure; the second proves that the requested
guide contains the same operable managed block that a fresh CLI generation
produces (`scripts/refresh-astryx-agent-docs.mjs:55` and
`scripts/refresh-astryx-agent-docs.mjs:64`).

## Why This Works

The wrapper separates four properties that are easy to conflate:

- **Target integrity:** Repository-relative resolution and symlink checks keep
  the write inside the repository, while the executable interface fixes the
  production target.
- **Document integrity:** Exactly one ordered marker pair is required before
  the block is extracted (`scripts/check-astryx-agent-docs.mjs:350`).
- **Markdown operability:** Marker lines must be top-level leaf nodes, not
  merely matching substrings. Modeling container paths and leaf boundaries
  prevents both false acceptance inside Markdown containers and false rejection
  after a genuine boundary.
- **Content freshness:** The checked-in block is compared with a fresh
  installed-CLI generation rather than a hand-maintained version string or
  cached fixture (`scripts/check-astryx-agent-docs.mjs:615` and
  `scripts/check-astryx-agent-docs.mjs:650`).

Because refresh calls the independent checker after the write, a zero-exit CLI
is only an intermediate event. Success is reported only after target, structure,
Markdown context, and generated content satisfy the repository contract.
Cleanup remains outside that correctness decision, so a secondary filesystem
error cannot erase the primary diagnosis.

## Prevention

- Keep production commands argument-free and test that extra target arguments
  fail without changing either the production or requested custom file
  (`scripts/check-astryx-agent-docs.test.mjs:365` and
  `scripts/check-astryx-agent-docs.test.mjs:501`).
- Test false-success CLI behavior explicitly: exit zero while deleting output,
  writing malformed markers, or leaving stale content must still fail
  (`scripts/check-astryx-agent-docs.test.mjs:428`,
  `scripts/check-astryx-agent-docs.test.mjs:450`, and
  `scripts/check-astryx-agent-docs.test.mjs:475`).
- Exercise marker placement as a CommonMark context matrix, not as a few
  indentation examples. Cover block quotes and lists, raw HTML types, code
  spans, fenced and indented code, lazy continuations, headings, thematic
  breaks, and paragraph-to-HTML transitions
  (`scripts/check-astryx-agent-docs.test.mjs:85`,
  `scripts/check-astryx-agent-docs.test.mjs:128`,
  `scripts/check-astryx-agent-docs.test.mjs:171`,
  `scripts/check-astryx-agent-docs.test.mjs:230`, and
  `scripts/check-astryx-agent-docs.test.mjs:270`).
- Preserve the boundary between generated and handwritten guidance with an
  assertion that repository-specific supplements remain outside the extracted
  managed block (`scripts/check-astryx-agent-docs.test.mjs:651`).
- Verify path containment for traversal, file symlinks, ancestor symlinks, and
  dangling symlinks (`scripts/check-astryx-agent-docs.test.mjs:546`).
- Inject cleanup failure in tests and assert that both errors are present with
  the primary failure rendered first
  (`scripts/check-astryx-agent-docs.test.mjs:819`).
- Run the focused contract suite through `pnpm test:astryx-agents`, then
  exercise both `pnpm astryx:agents` and `pnpm astryx:agents:check`; these are
  the checked-in package interfaces (`package.json:7-9`).

## Related Issues

- [Verify Astryx component API contracts](../best-practices/astryx-component-api-contracts.md)
  applies the same verify-the-installed-contract principle to UI components.
- [Scaffold an Nx React Astryx app with pnpm](../workflow-issues/scaffold-nx-react-astryx-with-pnpm.md)
  shows another generator workflow that needs an independent semantic check.
