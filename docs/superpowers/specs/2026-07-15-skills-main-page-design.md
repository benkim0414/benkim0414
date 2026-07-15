# Skills Main Page Design

Date: 2026-07-15

## Summary

Implement the first real `github.io` page as a skills-first experience. The page should remove the generic app-shell placeholder content and render only the searchable skill list as the main content.

## Goals

- Make `SkillSection` the primary page content.
- Place `SkillSearch` directly above `SkillList`.
- Keep the page heading accessible but visually hidden.
- Remove the visible app bar, hero, placeholder sections, and footer from the current main page.
- Keep the layout responsive for phones, tablets, and desktop browsers.
- Follow Astryx design guidelines first, and use Material Design guidance only where Astryx has no applicable pattern.

## Non-Goals

- Do not add portfolio, project, note, contact, or landing-page content.
- Do not add app bar branding or navigation yet.
- Do not redesign the existing skill item components.
- Do not change the skill data model or skill categories.

## Architecture

`AppShell` remains the app-level composition boundary. It should keep the Astryx `Theme` wrapper and render a single `main` element for the skills page.

The main element should contain:

- an accessible `h1` for `Skills` hidden with Astryx `VisuallyHidden`;
- `SkillSection`, wired to `sampleSkills`;
- no visible top bar, hero intro, placeholder sections, or footer.

`SkillSection` continues to own search state and filtering. `SkillSearch` remains a controlled PowerSearch wrapper. `SkillList` remains responsible for empty state handling and list rendering.

Placeholder components that are no longer used by the app shell can be removed in this implementation pass, together with their tests and stories, as long as unrelated skill components remain intact.

## Layout

Use a constrained content column rather than a full-width list or a decorative panel. The current page width pattern can be reused, with a skills-specific page class for vertical spacing.

The first visible control should be the search field, followed by the list. The search field belongs to the page content because it filters only the skills list; it should not live in a global app bar.

On phones, spacing should tighten while preserving touch-friendly controls and readable list rows. On tablets and desktop browsers, the column should stay narrow enough for scanning skill names, categories, and ratings without long row travel.

## Accessibility

The page must keep a semantic `main` landmark and a single page `h1`, even though the heading is visually hidden. The list heading should not create a duplicate visible title above the search field; add a small `SkillList` option such as `isHeadingHidden` so this page can hide the list heading while preserving the list's accessible name.

Existing accessible labels should remain in place:

- `SkillSearch` has a hidden label for PowerSearch.
- `SkillRating` exposes hidden text such as `4 out of 5`.
- `SkillAvatar` keeps initials/text fallback when a supported icon is unavailable.

## Testing

Update focused tests:

- `App` renders the skills-first page.
- `App` no longer renders the generic hero, placeholder sections, app bar, or footer.
- `SkillList` or `SkillSection` covers hidden heading behavior if a prop is added.

Run these checks after implementation:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx lint github.io
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx build github.io
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx build-storybook github.io
```

## Storybook

Keep the `AppShell` story in fullscreen mode and update it to show the skills-first page. Existing component stories for `SkillSearch`, `SkillList`, `SkillListItem`, `SkillAvatar`, `SkillRating`, and `SkillCategory` should remain separate so components can still be inspected individually on iPad.
