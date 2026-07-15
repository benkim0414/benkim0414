# Skill Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the existing skill UI into focused components: `SkillList`, `SkillListItem`, `SkillAvatar`, and existing `SkillRating`.

**Architecture:** Preserve the current feature folder and behavior. Move single-row rendering out of `SkillList`, rename `SkillLogo` to `SkillAvatar`, keep `SkillRating`, and add focused stories/tests for each visual component.

**Tech Stack:** React 19, TypeScript, Nx 23, Vitest, Testing Library, Storybook 10, Astryx components.

## Global Constraints

- Do not wire the skill components into `AppShell` yet.
- Do not create a full page-level `SkillsSection` yet.
- Do not change the skill data model or categories.
- Preserve Astryx component usage.
- Preserve existing search/filter behavior while separating render components.
- Keep `SkillRating` as the name of the level component.

---

### Task 1: Split Render Components

**Files:**
- Rename: `apps/github.io/src/app/skills/skill-logo.tsx` to `apps/github.io/src/app/skills/skill-avatar.tsx`
- Rename: `apps/github.io/src/app/skills/skill-logo.spec.tsx` to `apps/github.io/src/app/skills/skill-avatar.spec.tsx`
- Create: `apps/github.io/src/app/skills/skill-list-item.tsx`
- Create: `apps/github.io/src/app/skills/skill-list-item.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-list.tsx`
- Modify: `apps/github.io/src/app/skills/skill-list.spec.tsx`

**Interfaces:**
- `SkillAvatar({ skill }: { skill: Skill })`
- `SkillListItem({ skill }: { skill: Skill })`
- `SkillList` maps filtered skills to `SkillListItem`.

- [ ] Rename `SkillLogo` files and exported function to `SkillAvatar`.
- [ ] Update all imports from `skill-logo` to `skill-avatar`.
- [ ] Create `SkillListItem` that renders the existing Astryx `ListItem` row with `SkillAvatar`, `Badge`, and `SkillRating`.
- [ ] Update `SkillList` to remove row markup and map to `SkillListItem`.
- [ ] Add a `SkillListItem` test for name, category, avatar image/fallback presence, and rating text.
- [ ] Update existing tests for renamed avatar component.
- [ ] Run `PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx test github.io --skip-nx-cache`.
- [ ] Commit with `refactor(github.io): split skill list item`.

---

### Task 2: Add Separate Stories and Verify

**Files:**
- Create: `apps/github.io/src/app/skills/skill-avatar.stories.tsx`
- Create: `apps/github.io/src/app/skills/skill-list-item.stories.tsx`
- Create: `apps/github.io/src/app/skills/skill-rating.stories.tsx`
- Modify: `apps/github.io/src/app/skills/skill-list.stories.tsx`

**Interfaces:**
- Storybook titles:
  - `GitHub.io/Skills/Skill Avatar`
  - `GitHub.io/Skills/Skill List Item`
  - `GitHub.io/Skills/Skill Rating`
  - Existing `GitHub.io/Skills/Skill List`

- [ ] Add focused stories for `SkillAvatar`, `SkillListItem`, and `SkillRating`.
- [ ] Keep existing `SkillList` stories working.
- [ ] Run `PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx test github.io --skip-nx-cache`.
- [ ] Run `PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx lint github.io --skip-nx-cache`.
- [ ] Run `PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx build github.io --skip-nx-cache`.
- [ ] Run `PATH=/tmp/corepack-shims:$PATH NX_DAEMON=false corepack pnpm nx build-storybook github.io --skip-nx-cache`.
- [ ] Commit with `feat(github.io): add skill component stories`.

---

## Final Review

- Run full verification: test, lint, app build, Storybook build.
- Request code review.
- Fix any Critical or Important findings before completion.
