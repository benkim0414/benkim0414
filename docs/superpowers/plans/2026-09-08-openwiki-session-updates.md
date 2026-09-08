# OpenWiki Session Updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The user's standing instructions preselect this execution mode.

**Goal:** Initialize a real OpenWiki for this monorepo and maintain it through Codex before implementation-session handoff.

**Architecture:** Repository-scoped OpenWiki integration uses the active Codex session. Authored scope and session guidance remain separate from generated wiki pages and Claims. No CI or separate model authentication is involved.

**Tech Stack:** OpenWiki 0.5.0 (published release observed 2026-09-08), Codex MCP integration, Node 24, pnpm 11.16.0, Markdown.

**Spec:** docs/superpowers/specs/2026-09-08-openwiki-session-updates-design.md

## Global Constraints

- All writes occur in .worktrees/openwiki-session-updates on feat/openwiki-session-updates.
- Use OpenWiki's repository-scoped Codex integration.
- No GitHub Actions, private runner, automatic publishing, guaranteed shutdown hook, external knowledge connectors, global agent configuration changes, application feature changes, or automatic merge.
- Credentials and local runtime state must not enter commits.
- A configuration-only result is not a completed initial wiki.
- Preserve existing instructions, managed blocks, unrelated edits, and commit-approval rules.
- Non-GitHub shell network access needs direct user approval under the user's standing contract. Registry download approval is pending at plan creation; unaffected local documentation can proceed.
- Explicit-path staging and conventional local commits only. No push or PR.

## File responsibilities

- AGENTS.md: concise trigger pointing to the maintenance procedure.
- docs/agents/openwiki.md: setup, session lifecycle, recovery, and known operational limitations.
- openwiki/INSTRUCTIONS.md: authored scope and priorities, preserved by generation.
- .openwikiignore: source-discovery exclusions.
- package.json and pnpm-lock.yaml: exact local OpenWiki dependency and CLI commands.
- pnpm-workspace.yaml: only package-specific build approval proven necessary by installation.
- .codex/config.toml and .agents/skills/: repository-scoped integration output, verified against the actual release installer; accept only files actually used by Codex.
- .gitignore: ignore only demonstrated local runtime output introduced by this integration.
- openwiki/: genuine generated pages, Claims, and required versioned metadata.
- CLAUDE.md: inspect only if OpenWiki creates its managed wiki pointer; preserve other contents.

## Task 1: Establish wiki scope and session maintenance instructions

**Files:** Modify AGENTS.md; create docs/agents/openwiki.md, openwiki/INSTRUCTIONS.md, .openwikiignore.

**Interfaces:** Consumes existing repository conventions and approved spec. Produces authored inputs for Task 2; docs name `pnpm openwiki:status`, `pnpm openwiki:setup`, and `pnpm openwiki:visualize` as the commands Task 2 will supply. Initialization/update happen through the host integration, not a standalone provider command.

- [ ] Read the approved spec, repository AGENTS.md, CONCEPTS.md headings, and existing agent-document checks. Use writing-for-agents to keep the always-loaded trigger short.
- [ ] Add an AGENTS.md section with this intent: after relevant implementation and verification, before the final handoff message, follow docs/agents/openwiki.md to update the wiki in the current linked worktree; report updated, unchanged, or blocked. Read-only sessions do not trigger writes.
- [ ] Write docs/agents/openwiki.md with setup/status/visualization command names above, the native prompts `Initialize this repository's OpenWiki from the current source and tests.` and `Update this repository's OpenWiki for changes since its last successful run.`, and a numbered maintenance procedure. Require scope/exclusion review before native tool reads, completed page-job finalization before success, generated-diff review, and no implicit source commit or shipping permission. Explain that shutdown/interruption can leave work pending. Describe restart and uncommitted-baseline behavior as release checks to resolve in Task 2, not guarantees.
- [ ] Write openwiki/INSTRUCTIONS.md prioritizing workspace setup, github.io architecture, domain/evidence flows, design system, validation and release workflows. Use source/tests and canonical CONCEPTS.md/docs as evidence. Limit the initial wiki to about six focused pages plus index/log; avoid exhaustive file inventories, historical feature-branch claims, and copied agent policy.
- [ ] Write .openwikiignore with globs supported by upstream: .git/, .worktrees/, **/node_modules/, **/dist/, **/coverage/, .nx/, .superpowers/, **/.env, **/.env.*, and **/*.tsbuildinfo. Preserve safe tracked example environment files using explicit negation if any exist. Inspect actual generated/cache/asset locations before adding further rules; do not exclude authored source or relevant tests.
- [ ] Run `node --test scripts/check-astryx-agent-docs.test.mjs`, `node scripts/check-astryx-agent-docs.mjs`, and `git diff --check`. Check local Markdown links resolve and inspect new instructions for contradiction with existing handoff rules. No implementation-mirroring tests for prose/config.
- [ ] Inspect unstaged/staged diffs and create one local commit with explicit paths and subject `docs(openwiki): define session maintenance workflow`. Report command results and any limitations in the assigned task report.

## Task 2: Install host integration and initialize the real wiki

**Files:** Modify package.json, pnpm-lock.yaml, docs/agents/openwiki.md; conditionally pnpm-workspace.yaml and .gitignore. Create the release's repository-scoped Codex configuration/skill files and generated openwiki/ pages/metadata. Inspect generated AGENTS.md/CLAUDE.md changes.

**Interfaces:** Consumes Task 1's scope, exclusions, and maintenance procedure. Produces working local commands, usable host integration, and a finalized initial wiki. The authored INSTRUCTIONS.md must survive generation unchanged.

- [ ] Confirm direct npm access approval before downloads. Inspect the OpenWiki 0.5.0 tarball's package metadata, integration installer and bundled skill before executing installation. Determine exact generated paths, relative executable resolution, native exclusions, and source baseline handling. Report any release/spec incompatibility to the controller.
- [ ] Run an exact pnpm workspace development install, with the store inside the writable workspace or /tmp:

```sh
pnpm add --workspace-root --save-dev --save-exact openwiki@0.5.0
```

Keep build-script approvals package-specific and based on observed native dependency needs. Avoid changing unrelated dependency versions intentionally.

- [ ] Supply these root scripts, adjusting only the setup CLI argument ordering if the release's help requires it:

```json
{
  "openwiki:setup": "openwiki integrations install codex --project .",
  "openwiki:status": "openwiki integrations list --project .",
  "openwiki:visualize": "openwiki visualize openwiki"
}
```

- [ ] Execute the project-scoped installer only after inspecting its writes. Preserve existing project configuration. Make committed launch configuration use the pinned local executable with portable worktree-relative resolution. If the generated output points to a global executable, correct that narrowly and document why. Do not write user-global configuration.
- [ ] Verify `pnpm exec openwiki --version`, `pnpm openwiki:status`, and CLI help. Exercise setup idempotency in a disposable directory under /tmp rather than overwriting working integration files. Check execution from this linked worktree and a fresh disposable checkout without committing machine paths.
- [ ] Resolve any MCP activation restart requirement. If the current host can load the integration, use its genuine begin/plan/page-submit/finish lifecycle to initialize the wiki with current-source evidence. If activation requires restart, finish all independent setup and validation, document the exact restart/initialize prompt, and report generation blocked; never fabricate completed metadata or silently substitute standalone model generation.
- [ ] Verify native tools honor source exclusions or enforce the scope explicitly in the host guidance. Test baseline semantics with a disposable source fixture: successful initial run, relevant uncommitted edit, relevant committed edit, and unchanged-source update. Use the installed package's real lifecycle or backend operations; no paid standalone model calls. If host activation is unavailable, perform deterministic lifecycle probes that do not claim actual repository generation.
- [ ] Finalize docs/agents/openwiki.md with observed restart, recovery, and baseline behavior. If uncommitted edits are not automatically detected, give an explicit host update procedure that evaluates current evidence or reports blocked; do not introduce automatic commits.
- [ ] Validate generated links, Claims finalization, and required metadata if initialization ran. Run `pnpm openwiki:status`, `node --test scripts/check-astryx-agent-docs.test.mjs`, `node scripts/check-astryx-agent-docs.mjs`, and `git diff --check`. Run `NX_DAEMON=false pnpm exec nx show projects` to confirm workspace tooling still resolves. Run focused additional checks only for changed behavior.
- [ ] Inspect all diffs for credential/runtime leakage and changes outside approved paths. Commit tooling/config separately from generated documentation using explicit paths and conventional subjects. Report actual outcomes, blockers, and exact resume steps.

## Completion review

- [ ] Controller obtains task-level spec/quality review after each task, fixes important findings through its implementer, and records outcomes in the plan ledger.
- [ ] Controller obtains a final whole-branch review, using Codex /review if exposed; otherwise report its absence and use the available independent Codex reviewer.
- [ ] Hand off locally with verification evidence, wiki generation status, restart requirements if any, and no push/merge/deploy.
