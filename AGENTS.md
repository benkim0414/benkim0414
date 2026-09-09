# Agent instructions for benkim0414

This repository is the project-specific source of truth for agent behavior. Keep Hermes profiles general; do not put repo-specific assumptions into profile names, profile memory, or profile skills.

## Repository

- GitHub repo: `benkim0414/benkim0414`
- Workspace type: Nx monorepo using pnpm workspace files.
- Package manager: pnpm is preferred when available because `pnpm-lock.yaml` and `pnpm-workspace.yaml` are present.
- Current default branch may be sparse. Verify the active branch and project graph before implementing.
- GitHub Pages app work should target the app/branch requested by the task. Observed remote branches include app candidates such as `origin/feat/github-pages` with `apps/github-pages/` and `origin/feat/gh-pages` with `apps/gh-pages/`; confirm the intended target before changing app code.

## General profile workflow

Use these general Hermes profiles; they are intentionally not repo-specific:

1. `triage`
   - Clarify the request.
   - Inspect this repo for facts instead of guessing.
   - Use mattpocock/skills such as `triage`, `to-spec`, `to-tickets`, `grilling`, `research`, and `wayfinder`.
   - Produce specs and Kanban-ready tickets.
   - Do not implement app code.
   - Do not push or deploy.

2. `implement`
   - Build the agreed ticket.
   - Use mattpocock/skills such as `implement`, `tdd`, `diagnosing-bugs`, `prototype`, and `resolving-merge-conflicts`.
   - Use OpenAI Codex / Codex CLI where useful.
   - Work in a branch or worktree.
   - Run focused checks regularly and final relevant checks before completing.
   - Do not push or deploy.

3. `code-review`
   - Review diffs against the originating spec/ticket and this repo's standards.
   - Use mattpocock/skills such as `code-review`, `grilling`, `grill-with-docs`, `domain-modeling`, and `improve-codebase-architecture`.
   - Approve, block, or request changes.
   - Do not push or deploy.

4. `handoff`
   - Manual final gate only.
   - Verify review approval and test/build status.
   - Prepare handoff summary, commit, push, PR, or deploy only after explicit user approval.
   - This is the only profile allowed to push or deploy.

## State flow

Feature request -> `triage` -> Kanban tickets -> `implement` -> `code-review` -> awaiting handoff -> user explicitly prompts `handoff`.

Do not auto-push, auto-merge, or auto-deploy. Stop in an awaiting-handoff state until the user explicitly asks for handoff/shipping.

## Kanban/issue tracker policy

- Hermes Kanban is the local agent task board for this workflow unless a task explicitly names GitHub Issues or another tracker.
- Use `docs/agents/issue-tracker.md` for the tracker mapping expected by mattpocock/skills.
- `docs/solutions/` contains documented solutions to past bugs, design patterns, workflow issues, and best practices, organized by category with YAML frontmatter such as `module`, `tags`, and `problem_type`.
- `CONCEPTS.md` contains shared project vocabulary relevant when orienting to the codebase or discussing domain concepts.
- Tickets should be vertical slices where possible.
- Each implementation ticket should include acceptance criteria, blockers, target app/package, validation commands, and handoff criteria.

## Nx workflow

Before implementing:

1. Check branch and working tree:
   - `git status --short --branch`
   - `git branch --show-current`
2. Inspect workspace/project configuration:
   - `package.json`
   - `nx.json`
   - project-level `project.json` files
   - `pnpm-workspace.yaml`
3. Discover projects with the repo's installed dependencies. Prefer:
   - `pnpm nx show projects`
   - or `pnpm exec nx show projects`
   - fall back to `npx nx show projects` only if pnpm is unavailable and the task allows network/package installation.

Use focused Nx checks when possible, for example:

- `pnpm nx lint <project>`
- `pnpm nx test <project>`
- `pnpm nx build <project>`
- `pnpm nx affected -t lint,test,build`

Do not assume a project name. Verify it from Nx/project files.

## Git rules

- Keep diffs small and ticket-scoped.
- Follow [commit scope ownership](docs/agents/commit-scopes.md): use product scopes such as `github.io` and `date-interval`, tool scopes such as `nx` and `commitlint`, and leave genuinely repository-wide commits unscoped. Documentation and mixed-root ownership require explicit reviewer judgment.
- Use branches/worktrees for implementation work.
- Commit messages should follow the repo's commitlint/conventional-commit setup.
- `implement` may create local commits if useful, but must not push.
- `handoff` is the only profile allowed to push/open PR/deploy, and only after explicit user approval.

## OpenWiki maintenance

After relevant implementation and verification, follow
[`docs/agents/openwiki.md`](docs/agents/openwiki.md) before the final handoff
message. Report the wiki as updated, unchanged, or blocked. Read-only sessions do
not trigger wiki writes.

## Herdr usage

Use Herdr as the live terminal/workspace multiplexer, not as the durable source of truth. The durable source of truth is Kanban plus repo files.

Recommended Herdr workspace label for this repo: `benkim0414`.

Typical panes/agents:

- `triage`
- `implement`
- `codex`
- `code-review`
- `handoff`
- optional dev-server/build-log pane

## Skill policy

For v1, use mattpocock/skills only for this workflow. Do not introduce addyosmani/agent-skills into this repo workflow unless the user explicitly changes the v1 policy.

<!-- OPENWIKI:START -->

## OpenWiki

This repository has a generated `openwiki/` evidence index. It is optional just-in-time context, not required startup reading.

- Treat source code and tests as authoritative. A brief's unknowns and review items are verification gaps, not automatic requirements.
- Prefer the narrowest quiet validation that proves the changed behavior. Preserve complete failure output.

The scheduled OpenWiki GitHub Actions workflow refreshes the repository wiki. Do not hand-edit generated OpenWiki pages unless explicitly asked; prefer updating source code/docs and letting OpenWiki regenerate.

<!-- OPENWIKI:END -->
