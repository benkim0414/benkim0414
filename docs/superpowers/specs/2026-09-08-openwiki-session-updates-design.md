# OpenWiki updates before coding-session handoff

## Goal and accepted direction

Maintain a source-grounded wiki for this Nx/pnpm monorepo through the active Codex session. After relevant implementation changes and verification, update the wiki before the agent's final handoff message. The user selected this local workflow instead of GitHub Actions automation.

This is an agent-instruction workflow, not a guaranteed process-exit hook. Interrupted sessions may leave updates pending. The final message must accurately report whether the wiki was updated, unchanged, or blocked.

## Repository context

The inspected baseline is main at 7f12626. Installed tooling reported Node 24.18.0 and pnpm 11.16.0. Nx discovered github.io and benkim0414; application source is under apps/github.io. Existing AGENTS.md governs agent behavior, CONCEPTS.md defines vocabulary, and docs/solutions contains durable learnings. These remain authoritative inputs to the wiki.

All changes, including this spec, live in the linked worktree .worktrees/openwiki-session-updates on feat/openwiki-session-updates. No push, PR, deployment, or merge is part of this implementation.

## Approach and alternatives

Use OpenWiki's repository-scoped Codex integration. Codex performs research and authors pages using its active authenticated model session; OpenWiki manages page jobs, evidence Claims, validation, and finalization. Do not configure OpenWiki's standalone model-provider login as part of this setup or copy session credentials.

Alternatives considered were standalone CLI generation with separately configured credentials and automated GitHub Actions generation. Local integration matches the user's subscription preference and avoids maintaining CI authentication. A private automation repository and runner are out of scope.

## Components

1. Reproducible local tooling: pin a published OpenWiki release compatible with Node 24, using the repository's pnpm conventions. Inspect the release's actual integration installer before accepting its output. Provide documented local setup, integration-status, and visualization commands. Generation must use the Codex integration, not a script that silently launches a separately authenticated model.
2. Repository-scoped integration: install only the required OpenWiki MCP/skill configuration in the feature worktree, preserving existing configuration. Avoid machine-specific absolute paths in committed files. Document any required Codex restart or project trust step. Validate resolution from a linked worktree and a fresh checkout.
3. Scope brief: add user-authored openwiki/INSTRUCTIONS.md covering workspace setup, application architecture, important domain flows, validation, and existing development/release workflows. Prefer a small set of linked, evidence-backed pages over exhaustive file listings. Cite canonical docs rather than duplicate their policy.
4. Source exclusions: add .openwikiignore for linked worktrees, dependency directories, build output, caches, credentials, and irrelevant generated assets. Retain source, tests, configuration, and relevant authored docs. Verify exclusion behavior for the installed host integration; do not assume the standalone CLI's enforcement automatically applies to Codex's native tools.
5. Session instructions: add a concise AGENTS.md section directing Codex to inspect relevant wiki context and maintain it at implementation completion. Preserve existing instructions and any other managed blocks. Inspect OpenWiki-generated AGENTS.md/CLAUDE.md changes before accepting them.
6. Generated wiki: initialize openwiki/ through OpenWiki's real page-job lifecycle. Version required Claims and maintenance metadata with Markdown. Do not manufacture successful-run metadata or label manually drafted pages as OpenWiki-verified.

## Session lifecycle

1. Work in the isolated feature worktree and perform relevant implementation verification.
2. Check whether changes affect documented behavior, architecture, configuration, workflows, or evidence. For relevant changes, request an incremental OpenWiki update through its Codex integration.
3. Use the current worktree's source and tests as evidence. Implementation must verify how OpenWiki handles uncommitted edits and source baselines. Never silently create source commits merely to make update detection work. If the release requires committed input, report the limitation and preserve the existing commit-approval rules.
4. Complete OpenWiki's page queue and finalization, review generated diffs, and run applicable documentation checks. Keep generated changes in the same feature branch.
5. Report wiki status in the final handoff message. This maintenance step neither invokes the repository's shipping profile nor grants push/merge permission.

Read-only conversations do not authorize automatic wiki writes. Irrelevant changes may skip generation, but changed source evidence or existing stale Claims require evaluation even if the apparent prose would remain unchanged. Avoid repeated self-triggering updates caused only by generated metadata.

## Failure and recovery

If the integration is unavailable, authentication fails, a session is interrupted, or validation cannot finish, preserve inspectable progress and report the update as incomplete. Never fall back to an API key or another model provider without user direction. Explain the exact resume step; do not use reinitialization as a routine recovery operation because it replaces generated wiki state.

Only one writer updates a given worktree's wiki at a time. Separate feature worktrees can evolve independently, with wiki conflicts reviewed during ordinary integration. Credentials and local runtime state must not enter commits.

## Validation and acceptance

- Resolve the pinned CLI and verify repository-scoped integration status without requiring standalone provider credentials.
- Initialize a real wiki with completed page jobs and durable source Claims; verify finalization succeeds.
- Exercise an incremental update against a controlled relevant source change and establish committed/uncommitted baseline semantics.
- Check unchanged-source behavior for unnecessary page rewrites and recursive updates.
- Verify linked-worktree path resolution, exclusion behavior, preservation of existing agent instructions, and absence of credentials or machine paths in the diff.
- Validate Markdown links and generated diagrams with applicable installed tooling. Run focused existing agent-document checks if their managed files are affected; use Nx checks if application or workspace behavior changes.
- Confirm failure reporting describes pending work without claiming successful wiki generation.

A configuration-only result is not a completed initial wiki. If installing the integration requires restarting Codex, complete all independent setup and report the restart as the remaining activation step.

## Boundaries

No GitHub Actions, private runner, automatic publishing, guaranteed shutdown hook, external knowledge connectors, global agent configuration changes, application feature changes, or automatic merge. The wiki describes the checkout being worked on, not all remote feature branches.

## Research sources

Checked 2026-09-08:

- https://github.com/langchain-ai/openwiki#coding-agent-integrations — host-driven lifecycle, repository-scoped installation, and use of the host model session.
- https://github.com/langchain-ai/openwiki#how-it-stays-yours — scope brief, managed agent-document blocks, and versioned evidence.
- https://github.com/langchain-ai/openwiki — ignore rules, visualization, initialization, and incremental maintenance.

The README describes upstream main. Implementation must confirm these behaviors against the pinned published release before depending on them.
