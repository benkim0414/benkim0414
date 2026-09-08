# OpenWiki session maintenance

Use this repository-scoped workflow when verified implementation changes may
affect documented behavior, architecture, configuration, workflows, or evidence.
The repository pins OpenWiki 0.5.0 as a development dependency. The Codex
integration is project-scoped and uses the local package through `pnpm exec`;
it does not require OpenWiki provider credentials.

## Commands and native prompts

- `pnpm openwiki:status` checks whether the repository integration is available.
- `pnpm openwiki:setup` installs or repairs the repository-scoped integration.
- `pnpm openwiki:visualize` opens the generated wiki visualization.
- Bootstrap through the host integration with: `Create this repository's first OpenWiki from the current source and tests, using update mode so no scheduled workflow is created.`
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
   `pnpm openwiki:setup`, then restart Codex in this repository so it reloads
   `.codex/config.toml` and `.agents/skills/openwiki`. Stop and report the exact
   blocker if setup, trust, or restart requirements prevent native tool use.
3. Before any native OpenWiki tool reads repository content, review
   [`openwiki/INSTRUCTIONS.md`](../../openwiki/INSTRUCTIONS.md) and
   [`.openwikiignore`](../../.openwikiignore). Confirm the intended subjects and
   exclusions still match the current worktree. Keep credentials, local runtime
   state, dependencies, caches, build output, and sibling worktrees out of scope.
4. Use update mode even when no generated wiki exists. Release 0.5.0 init mode
   creates a scheduled GitHub workflow, which is outside this repository's local
   workflow. For an existing wiki, use the incremental update prompt. Allow only
   one writer for this worktree at a time. Honor `.openwikiignore` during native
   reads, and leave generated metadata and integration-managed setup blocks to
   OpenWiki's tools.
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

## Release 0.5.0 behavior and recovery

The installer writes the skill under `.agents/skills/openwiki` and a managed MCP
block under `.codex/config.toml`. Its published default is a global `openwiki`
command, so this repository narrows the managed command and install receipt to
`pnpm exec openwiki mcp --host codex`. This keeps resolution local and portable
across linked worktrees and fresh installs. The repository setup script calls the
published installer API with that override, preserves unrelated Codex TOML, and
is safe to rerun when installing or repairing the integration.

Codex must restart after installation or repair before native tools appear. A
single MCP process must remain connected for the complete begin, plan, page, and
finish sequence because active run state is process-local; durable run files let
a later process resume only by calling `openwiki_begin` again.

Release 0.5.0 fingerprints current tracked and untracked content as well as Git
HEAD. Relevant uncommitted edits therefore invalidate a plan and force update
evaluation; relevant commits are found from the stored per-page Git baseline.
Ignored paths and generated `openwiki/` state are removed from changed-path
windows. An unchanged clean checkout may return `status: "noop"`. Never create
an implicit source commit to make detection work. If an update is interrupted,
keep its files and resume with `openwiki_begin`; routine reinitialization can
replace generated state.

The release's generic managed agent-document snippet mentions scheduled GitHub
Actions even when a run uses update mode. That sentence is not this repository's
policy: no OpenWiki workflow is installed here, and maintenance remains a local
pre-handoff step governed by this guide and the repository AGENTS.md.

For a local stdio client, start `pnpm exec openwiki mcp --host codex` from the
repository root, initialize MCP, and call the six tools in order:
`openwiki_begin` with `mode: "update"`, `openwiki_submit_plan`, repeated `openwiki_next_page` and
`openwiki_submit_page` calls (with `openwiki_inspect_page_claims` only when
needed), then `openwiki_finish`. Keep the same connection open throughout.

Wiki maintenance stays in the current feature worktree and branch. It does not
authorize a source commit, push, merge, PR, release, deployment, or invocation of
the handoff profile.
