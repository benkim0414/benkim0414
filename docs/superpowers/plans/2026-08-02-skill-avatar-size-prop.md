# Skill Avatar Size Prop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `size` prop to `SkillAvatar`, default it to Astryx `medium`, and use `tiny` for command-palette skill results.

**Architecture:** Reuse Astryx `AvatarSize` as the prop type so the local wrapper follows Astryx's documented values. Keep `SkillListItem` on the default `medium` size and override only the command-palette result renderer with `size="tiny"`.

**Tech Stack:** React, TypeScript, Astryx `Avatar`, Vitest, Testing Library, Nx.

## Global Constraints

- Work in `/home/benkim0414/workspace/benkim0414/.worktrees/skill-card-logo-avatar-design`.
- Stage explicit paths only; do not use `git add .`, `git add -A`, or `git add -u`.
- Use conventional commits.
- Astryx uses `medium`, not `md`, as the valid named avatar size.
- `SkillCard` must not render `SkillAvatar`.

---

### Task 1: Add SkillAvatar Size Prop

**Files:**

- Modify: `apps/github.io/src/app/skills/skill-avatar.tsx`
- Modify: `apps/github.io/src/app/skills/skill-avatar.spec.tsx`
- Modify: `apps/github.io/src/app/skills/mobile-skills-page.tsx`
- Modify: `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`

**Interfaces:**

- Consumes: `SkillAvatar({ skill }: { skill: Skill })`
- Produces: `SkillAvatar({ skill, size = 'medium' }: SkillAvatarProps)` where `size?: AvatarSize`

- [ ] Update `skill-avatar.spec.tsx` so the default size test expects `data-size="medium"` and 48px inner dimensions.
- [ ] Update `mobile-skills-page.spec.tsx` so command-palette result tests continue to expect `data-size="tiny"` and 20px inner dimensions.
- [ ] Import `type AvatarSize` from `@astryxdesign/core/Avatar` in `skill-avatar.tsx`.
- [ ] Add `SkillAvatarProps` with `skill: Skill` and `size?: AvatarSize`.
- [ ] Default the `SkillAvatar` `size` prop to `medium` and pass it through to Astryx `Avatar`.
- [ ] Pass `size="tiny"` from `SkillCommandResult`.
- [ ] Run `pnpm vitest run apps/github.io/src/app/skills/skill-avatar.spec.tsx apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`.
- [ ] Run `pnpm nx test github.io --skip-nx-cache`, `pnpm nx lint github.io --skip-nx-cache`, `pnpm nx build github.io --skip-nx-cache`, and `git diff --check`.
- [ ] Commit with `fix(github.io): add skill avatar size prop`.
