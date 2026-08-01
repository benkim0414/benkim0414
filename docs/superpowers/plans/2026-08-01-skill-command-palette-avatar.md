# Skill Command Palette Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove avatars from `SkillCard` and render small rounded-rectangle skill avatars in command-palette skill results.

**Architecture:** Keep `SkillAvatar` on Astryx `Avatar size="xsmall"` and add a narrow shape prop for command-palette logo tiles. Use `CommandPalette`'s `renderItem` hook in `MobileSkillsPage` to render a leading rectangular `SkillAvatar` beside each skill name.

**Tech Stack:** React, TypeScript, Astryx `Avatar`, Astryx `CommandPalette`, Astryx `Layout`, Vitest, Testing Library, Storybook.

## Global Constraints

- Work in `/home/benkim0414/workspace/benkim0414/.worktrees/skill-card-logo-avatar-design`.
- Stage explicit paths only; do not use `git add .`, `git add -A`, or `git add -u`.
- Use conventional commits.
- `SkillCard` must not render `SkillAvatar`.
- Command-palette skill results must render a 24px rounded-rectangle `SkillAvatar` before the skill label.
- Preserve existing command-palette search, grouping under `Skills`, and selected-skill filtering.
- Do not add new skill data, API work, light/dark mode, desktop-specific layouts, or custom avatar primitives.

---

### Task 1: Move Skill Logos To Command Palette

**Files:**

- Modify: `apps/github.io/src/app/skills/skill-avatar.tsx`
- Modify: `apps/github.io/src/app/skills/skill-avatar.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-avatar.stories.tsx`
- Modify: `apps/github.io/src/app/skills/skill-card.tsx`
- Modify: `apps/github.io/src/app/skills/skill-card.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-card.stories.tsx`
- Modify: `apps/github.io/src/app/skills/mobile-skills-page.tsx`
- Modify: `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`

**Interfaces:**

- Keep `SkillAvatar({ skill, shape = 'circle' }: { skill: Skill; shape?: 'circle' | 'rectangle' })` as the shared 24px avatar.
- Add command-palette `renderItem={(item) => <SkillCommandResult skill={item.auxiliaryData.skill} />}` inside `MobileSkillsPage`.

- [ ] Remove the `variant` prop and card-specific rectangular styling from `SkillAvatar`.
- [ ] Remove card-variant tests and stories from `skill-avatar`.
- [ ] Remove the `SkillAvatar` import/header rendering from `SkillCard`.
- [ ] Update `SkillCard` tests so they assert title/rating/description ordering without a card header logo and assert no skill-logo image appears in the card.
- [ ] Add a small command-result renderer in `mobile-skills-page.tsx` using `HStack gap={2} vAlign="center"`, `<SkillAvatar skill={skill} shape="rectangle" />`, and visible skill name text.
- [ ] Update `mobile-skills-page.spec.tsx` to open the command palette, verify a skill result contains an avatar named after the skill, and verify the avatar uses `data-size="xsmall"` with 24px inner dimensions and `radiusVars['--radius-element']`.
- [ ] Run `pnpm vitest run apps/github.io/src/app/skills/skill-avatar.spec.tsx apps/github.io/src/app/skills/skill-card.spec.tsx apps/github.io/src/app/skills/mobile-skills-page.spec.tsx`.
- [ ] Run `pnpm nx test github.io --skip-nx-cache`, `pnpm nx lint github.io --skip-nx-cache`, `pnpm nx build github.io --skip-nx-cache`, and `git diff --check`.
- [ ] Commit with `fix(github.io): move skill logos to command palette`.
