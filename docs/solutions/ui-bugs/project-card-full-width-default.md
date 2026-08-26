---
title: ProjectCard defaults to full-width Astryx Card surface
date: 2026-08-26
category: ui-bugs
module: apps/github.io projects
problem_type: ui_bug
component: tooling
symptoms:
  - ProjectCard rendered narrower than sibling card components unless callers passed isFullWidth
  - The component kept a local fixed StyleX width policy after moving to an Astryx Card surface
root_cause: logic_error
resolution_type: code_fix
severity: low
related_components:
  - github.io App
  - Astryx Component Contract
  - Astryx Styling Boundary
  - ProjectCard
  - StyleX
tags:
  - github-io
  - projects
  - project-card
  - full-width
  - astryx-card
  - stylex
---

# ProjectCard defaults to full-width Astryx Card surface

## Problem

`ProjectCard` in `apps/github.io` did not behave like the other card surfaces by default: it kept a fixed StyleX width unless a caller remembered to pass `isFullWidth`. That made project cards caller-dependent even though comparable Astryx card surfaces in the app pass `width="100%"` directly to `Card`, such as `DoraCapabilityCard` in [dora-capability-card.tsx](../../../apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx) and the skill metadata card in [skill-detail-page.tsx](../../../apps/github.io/src/app/skills/skill-detail-page.tsx).

## Symptoms

- A default `<ProjectCard project={project} />` did not occupy the available card container width.
- `ProjectCardProps` still includes `isFullWidth?: boolean` for caller compatibility in [project-card.tsx](../../../apps/github.io/src/app/projects/project-card.tsx), but the render path now ignores that prop and renders `<Card padding={4} width="100%" xstyle={styles.root}>`.
- The regression test renders `ProjectCard` without `isFullWidth` and asserts that the Astryx card surface receives `--x-width: 100%` in [project-card.spec.tsx](../../../apps/github.io/src/app/projects/project-card.spec.tsx).

## What Didn't Work

Keeping width policy in StyleX was the wrong layer. The old implementation put the default fixed size on `styles.root` and added a conditional `styles.fullWidth` override only when `isFullWidth` was true:

```tsx
const styles = stylex.create({
  root: {
    display: 'block',
    width: {
      default: `calc(${spacingVars['--spacing-12']} * 7)`,
      '@media (max-width: 640px)': `calc(${spacingVars['--spacing-12']} * 5)`,
    },
  },
  fullWidth: {
    width: '100%',
  },
});

<Card
  padding={4}
  xstyle={[styles.root, isFullWidth && styles.fullWidth]}
>
```

That preserved the narrow default and made full width an opt-in behavior. Changing the default value of `isFullWidth` to true would still have left the existing conditional width branch in place.

## Solution

Move the card width to the Astryx `Card` API and make full width unconditional for `ProjectCard`. The fixed StyleX width declarations are removed, `styles.root` only keeps the display rule, and the `Card` receives `width="100%"`:

```tsx
const styles = stylex.create({
  root: {
    display: 'block',
  },
});

export function ProjectCard({
  project,
}: ProjectCardProps): ReactElement {
  return (
    <Card
      padding={4}
      width="100%"
      xstyle={styles.root}
    >
      {/* project content */}
    </Card>
  );
}
```

Leave `isFullWidth?: boolean` in `ProjectCardProps` for source compatibility. Existing callers such as `SkillDetailPage`, which still renders `<ProjectCard key={project.id} isFullWidth project={project} />`, can still pass the prop because it remains in `ProjectCardProps`; the render path no longer reads it.

Add a focused regression test that locks the behavior at the rendered Astryx surface:

```tsx
it('uses a full-width card surface by default', () => {
  const { container } = render(<ProjectCard project={project} />);

  const cardSurface = container.querySelector('.astryx-card');

  expect(cardSurface).toBeInstanceOf(HTMLElement);
  expect((cardSurface as HTMLElement).style.getPropertyValue('--x-width')).toBe(
    '100%',
  );
});
```

## Why This Works

Neighboring card components already use the Astryx `Card` width prop for full-width surfaces. `DoraCapabilityCard` passes `width="100%"` directly, and `SkillDetailPage` does the same for the muted metadata card.

Putting `width="100%"` on `ProjectCard`'s `Card` makes the default behavior match those established call sites. Removing the StyleX fixed widths also removes the old override race: there is no default fixed card size left to beat, and there is no conditional full-width branch that depends on each caller remembering a prop.

Keeping `isFullWidth` in the props interface avoids a source-breaking API cleanup while still making the runtime layout unambiguous. The public shape remains compatible, but the card's width behavior is now owned by the component.

## Prevention

- Prefer the design-system component API for card sizing when the component already exposes a width prop. For Astryx cards that should fill their container, pass `width="100%"` on `Card` instead of encoding the width in a local StyleX root rule.
- When replacing opt-in layout props with a new default, add a test that renders the component through its default path. The useful assertion here is not that `isFullWidth` still works; it is that `<ProjectCard project={project} />` produces a full-width card surface.
- Keep compatibility props only when they protect existing callers, and avoid continuing to use those props internally once the intended behavior is unconditional. The prop can be removed later in a deliberate breaking cleanup, but the bug fix should not require coordinated caller changes.

## Related Issues

- [DORA capability cards fill mobile content width](./dora-card-full-width-mobile-layout.md)
- [Distinguish Muted Skill Detail Card Surface](./distinguish-muted-skill-detail-card-surface.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
