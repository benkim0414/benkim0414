---
title: Keep Review Fixes Atomic With Targeted Fixup Commits
date: 2026-07-15
category: workflow-issues
module: Git commit workflow
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - "A review fix spans files introduced by several earlier commits"
  - "A branch should preserve atomic historical commits before merge or PR review"
  - "A mixed follow-up commit needs to be folded into the commits that own the behavior"
tags: [git, commits, fixup, autosquash, code-review]
---

# Keep Review Fixes Atomic With Targeted Fixup Commits

## Context

During the skill-list component review, the review fixes initially landed as one mixed commit. That commit touched runtime components, tests, and Storybook stories across several earlier changes. The branch was functionally correct, but the history was not atomic: future readers would have to connect a generic review-fix commit back to the commits that introduced each affected behavior.

The better result was to amend history so each fix lived with the commit that owned the component boundary it corrected.

## Guidance

When review fixes cross commit boundaries, split the follow-up patch by ownership before finalizing the branch:

1. Reset only the mixed follow-up commit back into the worktree.
2. Inspect the diff in small file groups and map each group to the commit that introduced or last reshaped that behavior.
3. Stage explicit paths for one group at a time.
4. Create targeted `fixup!` commits with `git commit --fixup=<target>`.
5. Run `git rebase -i --autosquash <base>` from before the earliest target commit included in the rewrite.
6. Verify that no `fixup!` commits remain, then rerun the relevant checks.

For this branch, the ownership split was:

- `SkillAvatar` accessibility changes belonged with the commit that split avatar/list-item responsibilities.
- `SkillListItem` Storybook composition belonged with the commit that introduced component stories.
- `SkillSection` empty-message behavior and its stories belonged with the commit that split search wiring from presentational list rendering.
- `SkillList` empty-state behavior also belonged with the search split once later refactors had moved empty-state ownership into the presentational list boundary.

That last point is the main judgment call. A first autosquash attempt targeted the original searchable-list commit and produced conflicts because the code had since been reshaped. The conflict was evidence that the target was too early, not that autosquash was the wrong tool. Retargeting the fixup to the later split-search commit preserved the final behavior without forcing an unrelated historical conflict.

## Why This Matters

Atomic commits make review and rollback easier. A commit named `refactor(github.io): split skill search` should contain the prop contract and empty-state behavior that make the split correct. A separate generic review-fix commit hides that relationship and leaves future archaeology worse than necessary.

Autosquash also keeps review feedback from becoming permanent noise in feature history. The visible history tells the story of the feature, while the temporary fixup commits remain only as an implementation technique.

## When to Apply

- A reviewer finds issues in code that was introduced by more than one earlier commit.
- A follow-up fix commit has a broad subject such as "address review findings".
- The branch has not been shared in a way that makes history rewriting unsafe.
- The user or repo workflow expects atomic commits before merge.

## Examples

Start by uncommitting the mixed review-fix commit:

```bash
git reset --mixed HEAD~1
```

Then stage and commit each ownership group separately:

```bash
git add apps/github.io/src/app/skills/skill-avatar.tsx \
  apps/github.io/src/app/skills/skill-avatar.spec.tsx
git commit --fixup=<commit-that-introduced-skill-avatar>
```

After all groups are fixup commits, autosquash from the parent of the earliest affected commit:

```bash
GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <base-before-earliest-target>
```

If a fixup remains visible after autosquash, check whether its target commit was outside the rebase range or whether it was aimed at the wrong historical owner. Retargeting the fixup subject can be enough:

```bash
git commit --amend -m "fixup! refactor(github.io): split skill search"
GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <correct-base>
```

Finish with explicit history and verification checks:

```bash
git log --oneline --grep='^fixup!'
git status --short
NX_DAEMON=false NX_ANALYTICS=false corepack pnpm nx test github.io
NX_DAEMON=false NX_ANALYTICS=false corepack pnpm nx lint github.io
NX_DAEMON=false NX_ANALYTICS=false corepack pnpm nx build github.io
NX_DAEMON=false NX_ANALYTICS=false corepack pnpm nx build-storybook github.io
```

## Related

- `docs/solutions/workflow-issues/scaffold-nx-react-astryx-with-pnpm.md`
