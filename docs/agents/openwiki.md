# OpenWiki session maintenance

Use this repository-scoped workflow when verified implementation changes may
affect documented behavior, architecture, configuration, workflows, or evidence.
OpenWiki is not installed yet: the commands and native prompts below are the
interface that the tooling task will provide and validate against a pinned
release.

## Commands and native prompts

- `pnpm openwiki:status` checks whether the repository integration is available.
- `pnpm openwiki:setup` installs or repairs the repository-scoped integration.
- `pnpm openwiki:visualize` opens the generated wiki visualization.
- Initialize through the host integration with: `Initialize this repository's OpenWiki from the current source and tests.`
- Update through the host integration with: `Update this repository's OpenWiki for changes since its last successful run.`

Initialization and updates run through the host integration and its authenticated
model session, not a standalone provider command. Do not configure provider
credentials as a fallback.

## Maintenance procedure

1. Decide whether the verified implementation affects wiki evidence or subjects.
   Read-only sessions do not write the wiki. For implementation changes, account
   for changed source evidence and stale Claims even when page prose appears
   unchanged; record an irrelevant change as unchanged.
2. Run `pnpm openwiki:status`. If the integration is unavailable, use
   `pnpm openwiki:setup` once the tooling task supplies it. Stop and report the
   exact blocker if setup, authentication, trust, or restart requirements prevent
   native tool use.
3. Before any native OpenWiki tool reads repository content, review
   [`openwiki/INSTRUCTIONS.md`](../../openwiki/INSTRUCTIONS.md) and
   [`.openwikiignore`](../../.openwikiignore). Confirm the intended subjects and
   exclusions still match the current worktree. Keep credentials, local runtime
   state, dependencies, caches, build output, and sibling worktrees out of scope.
4. Use the initialization prompt only when no usable generated wiki exists. For
   an existing wiki, use the incremental update prompt. Allow only one writer for
   this worktree at a time. Honor `.openwikiignore` during native reads, and leave
   generated metadata and integration-managed setup blocks to OpenWiki's tools.
5. Follow the native lifecycle: begin the run and accept a no-op result when
   returned; otherwise submit the plan, request each assigned page, write it,
   submit it, and explicitly finish the run. Treat an update as successful only
   after every required page job and finalization complete with durable source
   Claims. A shutdown or interruption can leave work pending; preserve
   inspectable progress and report it as blocked rather than reinitializing.
6. Review the complete generated diff for evidence quality, scope, unexpected
   rewrites, recursive metadata-only churn, credentials, and machine-specific
   paths. Run applicable documentation checks and fix or report every issue found.
7. Before the final handoff message, report exactly one result: **updated** when
   generation and finalization succeeded, **unchanged** when evaluation found no
   relevant update, or **blocked** with the precise resume step.

## Release checks still pending

The tooling task must verify the lifecycle above against pinned release `0.5.0`,
establish its restart behavior, and determine how its incremental update baseline
treats uncommitted changes. Until those checks are complete, do not promise that
setup activates without a Codex restart or that uncommitted source is detected.
Never create an implicit source commit to make change detection work; preserve
the repository's normal commit approval and handoff rules.

Wiki maintenance stays in the current feature worktree and branch. It does not
authorize a source commit, push, merge, PR, release, deployment, or invocation of
the handoff profile.
