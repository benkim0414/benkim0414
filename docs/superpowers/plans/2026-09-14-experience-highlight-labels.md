# Experience Highlight Labels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the experience disclosure's combined outcome/skill sentence with clear `Highlights` and `Relevant skills` labels, each paired with the existing neutral count badge.

**Architecture:** Keep `SkillExperienceCardShell` responsible for the shared disclosure trigger and responsive state. Each experience renderer remains responsible for its relevant-skills section and adds the shared `CountBadge` beside that section label.

**Tech Stack:** React, TypeScript, Astryx Design System, StyleX, Vitest, Testing Library, Nx

**Spec:** `docs/research/2026-09-14-experience-disclosure-label.md`

## Global Constraints

- The disclosure trigger copy is exactly `Highlights`.
- The trigger displays only the highlight count through the existing `CountBadge` component.
- The expanded relevant-skills label remains exactly `Relevant skills` and displays its own count through `CountBadge`.
- Preserve the current small-screen collapsed and large-screen expanded defaults.
- Preserve user-controlled disclosure state across viewport changes.
- Do not add new dependencies or custom badge styling.

---

### Task 1: Label and count the experience details

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-experience-card-shell.tsx`
- Modify: `apps/github.io/src/app/skills/skill-experience-card-list.tsx`
- Modify: `apps/github.io/src/app/skills/skill-experience-list.tsx`
- Test: `apps/github.io/src/app/skills/skill-experience-card-list.spec.tsx`
- Test: `apps/github.io/src/app/skills/skill-experience-list.spec.tsx`

**Interfaces:**
- Consumes: `CountBadge({ count }: { count: number })` from `apps/github.io/src/app/count-badge.tsx`.
- Produces: a `Highlights` disclosure trigger whose accessible name includes its count, and a `Relevant skills` label followed by its count badge.

- [ ] **Step 1: Write failing tests for the approved labels and counts**

Update the compact-state assertions so the disclosure is found by the accessible name `Highlights 2` or `Highlights 1`. Assert that the old `outcome`/`skill` summary sentence is absent. In both renderers, assert that the relevant-skills section contains the expected count badge adjacent to its label.

- [ ] **Step 2: Run focused tests to verify they fail**

Run: `pnpm nx test github.io --runInBand --testPathPatterns='skill-experience-(card-list|list)\.spec\.tsx'`

Expected: FAIL because the trigger still renders the combined outcome/skill sentence and the relevant-skills labels do not yet include count badges.

- [ ] **Step 3: Implement the shared trigger label and badges**

In `SkillExperienceCardShell`, import `HStack` and `CountBadge`, remove the formatted count sentence and unused singularization helper, and render this trigger structure:

```tsx
<HStack gap={2} vAlign="center">
  <Text type="supporting" color="secondary">
    Highlights
  </Text>
  <CountBadge count={outcomeCount} />
</HStack>
```

Keep the existing `hasDetails`, `defaultIsOpen`, and card hierarchy behavior.

In each relevant-skills section, replace the standalone label with:

```tsx
<HStack gap={2} vAlign="center">
  <Text type="supporting" color="secondary">
    Relevant skills
  </Text>
  <CountBadge count={relevantSkills.length} />
</HStack>
```

Use the corresponding resolved relevant-skill array in each renderer.

- [ ] **Step 4: Run focused tests to verify they pass**

Run: `pnpm nx test github.io --runInBand --testPathPatterns='skill-experience-(card-list|list)\.spec\.tsx'`

Expected: PASS.

- [ ] **Step 5: Run project verification**

Run:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
```

Expected: all commands exit successfully.

- [ ] **Step 6: Commit the implementation**

Stage only the five source/test paths and commit with:

```text
feat(github.io): clarify experience detail labels
```
