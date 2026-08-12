---
title: Keep Skill Selection Transition in AppShell
date: 2026-08-12
category: design-patterns
module: github.io home skill selection
problem_type: design_pattern
component: frontend_stimulus
severity: medium
applies_when:
  - "A command-palette selection must show a deliberately minimal detail destination"
  - "A landing page should preserve its content composition after a selection"
  - "A temporary detail transition does not justify URL routing"
related_components:
  - AppShell
  - HomePage
  - CommandPalette
  - SkillDetailPage
tags:
  - app-shell
  - command-palette
  - skill-selection
  - detail-transition
  - home-page
  - state-ownership
---

# Keep Skill Selection Transition in AppShell

## Context

A mobile home page can keep its command-palette results text-only while still
treating a chosen result as a transition to a minimal destination. For the
`github.io` App, that transition is intentionally in memory: `AppShell` stores
the selected `Skill` and chooses between `HomePage` and `SkillDetailPage`
(`apps/github.io/src/app/app-shell.tsx:9`).

This boundary matters when the destination is deliberately incomplete. The
skill detail surface currently renders only a constrained `main` region and
the selected skill name as its level-one heading
(`apps/github.io/src/app/skills/skill-detail-page.tsx:11`). It does not yet
establish URL, refresh, history, or deep-link behavior.

## Guidance

Keep temporary page-selection state at the boundary that can replace the
page. Let the home page translate its command-palette value into a domain
object and notify that boundary through a callback:

```tsx
// AppShell owns the temporary transition.
const [selectedSkill, setSelectedSkill] = useState<Skill>();

return selectedSkill ? (
  <SkillDetailPage skill={selectedSkill} />
) : (
  <HomePage onSkillSelect={setSelectedSkill} />
);
```

`AppShell` uses that exact conditional ownership pattern
(`apps/github.io/src/app/app-shell.tsx:10`). `HomePage` exposes the callback in
its public props and keeps the palette's selected ID local
(`apps/github.io/src/app/skills/home-page.tsx:41`,
`apps/github.io/src/app/skills/home-page.tsx:52`).

```tsx
onValueChange={(skillId) => {
  setSelectedSkillId(skillId);
  const selectedSkill = skillCommandItems.find(
    (item) => item.id === skillId,
  )?.auxiliaryData.skill;

  if (selectedSkill) onSkillSelect?.(selectedSkill);
}}
```

This bridge uses the selected ID to recover the existing `Skill` object before
notifying the shell (`apps/github.io/src/app/skills/home-page.tsx:109`).
`HomePage` supplies no `renderItem`, and its tests assert that the Terraform
option has no image; selection therefore does not require a custom result
renderer or a `SkillAvatar`.

Do not add a router solely to support this placeholder transition. Add routing
when the product needs a URL contract, browser history, refresh persistence,
or deep links. Likewise, keep the placeholder page free of speculative detail
content until that content has its own requirements.

## Why This Matters

Result presentation and result behavior are separate contracts. A text-only
result can still lead somewhere, and removing its visual customization must
not silently remove its selection effect. The page-level test protects both
contracts by checking that the Terraform result has no image and that choosing
it calls `onSkillSelect` with the matching skill
(`apps/github.io/src/app/skills/home-page.spec.tsx:273`).

The application-level test then protects the complete handoff: after choosing
Terraform, its level-one heading appears and the accessible Home region is no
longer rendered (`apps/github.io/src/app/app.spec.tsx:83`). This exercises the
cross-component handoff that the callback-only component test does not
exercise.

Keeping page replacement in `AppShell` means `HomePage` need not mutate its
carousel or DORA capability content to imitate navigation. The home page
continues to own search mechanics and content composition, while the shell
owns which page is active.

## When to Apply

- A selection must visibly lead somewhere, but the destination is intentionally
  limited to an identity heading or another small placeholder.
- The selected object is already available in the command source, so the child
  can pass it to its owner without fetching it again.
- A parent shell already owns the presentation boundary and can conditionally
  replace the landing page.
- Deep links, browser history, refresh persistence, and shareable URLs are not
  yet requirements.

## Examples

Keep the destination as small as its current contract:

```tsx
export function SkillDetailPage({ skill }: { skill: Skill }) {
  return (
    <VStack as="main" padding={4}>
      <Heading level={1}>{skill.name}</Heading>
    </VStack>
  );
}
```

Test the shell transition as a user-visible journey rather than inferring it
from state:

```tsx
fireEvent.click(terraformOption);

expect(getByRole('heading', { level: 1, name: 'Terraform' })).toBeTruthy();
expect(queryByRole('main', { name: 'Home' })).toBeNull();
```

The focused detail-page test separately verifies its accessible heading
contract (`apps/github.io/src/app/skills/skill-detail-page.spec.tsx:8`).

## Related

- [Mirror App Shell Ownership in Mobile Storybook Pages](mirror-app-shell-ownership-in-mobile-storybook-pages.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
