# Codex and OpenSpec Workflow

This repo uses OpenSpec as the planning and requirements layer for Codex-assisted work. OpenSpec helps keep intent in versioned specs, while the normal repository workflow still controls edits, verification, commits, and merges.

## Setup Shape

- Repo OpenSpec state lives in `openspec/`.
- Codex OpenSpec skills live in `.codex/skills/openspec-*/`.
- Codex slash prompts live in `${CODEX_HOME:-~/.codex}/prompts/opsx-*.md`.
- The OpenSpec CLI is installed as a dev dependency and can be run with `pnpm exec openspec` or `pnpm openspec`.

## Daily Flow

1. Start from a clean Codex context and confirm `git status` and the current branch.
2. Create or enter an isolated worktree branch before changing tracked files.
3. Start planning with one of these commands:
   - `/opsx:propose "describe the change"` for a full proposal from a request.
   - `/opsx:new change-name` followed by `/opsx:ff` when the change name is already clear.
   - `/opsx:explore "question or problem"` when the scope needs investigation before a proposal.
4. Review the generated change artifacts before implementation:
   - `openspec/changes/<change>/proposal.md`
   - `openspec/changes/<change>/design.md`
   - `openspec/changes/<change>/tasks.md`
   - `openspec/changes/<change>/specs/**/spec.md`
5. Implement with `/opsx:apply` after the proposal, design, tasks, and spec deltas match the intended outcome.
6. Verify with `/opsx:verify` and the repository checks listed in the change tasks.
7. Archive with `/opsx:archive` after implementation is complete so living specs under `openspec/specs/` are updated and the completed change is preserved under `openspec/changes/archive/`.

## Repository Rules Still Apply

OpenSpec does not replace the existing Codex git workflow.

- Do not edit tracked files directly on `main`.
- Use isolated worktree branches for implementation.
- Stage files selectively by name.
- Use conventional commits.
- Run the no-PR review loop before merging.
- Merge back to `main` with a merge commit.
- Push with `git push origin HEAD:main`.

For implementation work in this repo, prefer pnpm and Nx validation:

```sh
pnpm install --frozen-lockfile
pnpm nx report
git diff --check
```

Add more focused checks to the OpenSpec task list when a change touches a concrete app, package, or workflow.

## Maintaining OpenSpec

After upgrading `@fission-ai/openspec`, refresh generated Codex/OpenSpec instructions:

```sh
pnpm exec openspec update
```

Then review generated changes before committing. OpenSpec may update both repo-local skill files and global Codex prompt files under `${CODEX_HOME:-~/.codex}/prompts/`.
