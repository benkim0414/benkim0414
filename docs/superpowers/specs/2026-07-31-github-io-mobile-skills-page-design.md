# GitHub.io Mobile Skills Page Design

## Goal

Reshape the `github.io` app into a mobile-only skills page that renders the same mobile layout at every viewport size. The first screen should prioritize a minimal search bar, a fixed top-five skill carousel, and a searchable full skills list. The skill data stays local for now and should be easy to replace with an API response later.

## Current Context

The app is an Nx React/Vite application using Astryx, StyleX, Tailwind utilities backed by Astryx tokens, and Vitest. The current `AppShell` renders a hidden `Skills` page title and a full `SkillSection` using `sampleSkills`. The skills area already has reusable `SkillCard`, `SkillCarousel`, `SkillSection`, `SkillSearch`, `SkillList`, and `SkillListItem` components.

The existing public evidence catalog in `devops-capability-evidence.data.ts` is the source for choosing the initial highlighted skills. It stores public-safe interview-derived evidence rather than raw interview answers.

## Scope

In scope:

- Render the `github.io` app as a mobile layout at all viewport sizes.
- Add a minimal top bar containing only search.
- Place a fixed top-five `SkillCarousel` directly under the top bar.
- Filter only the full skills list below the carousel.
- Keep the top-five carousel fixed while search input changes.
- Store skills locally in the app in a shape compatible with existing `SkillCard`.
- Make the local data boundary straightforward to replace with an API later.
- Update focused tests and Storybook stories for the changed shell and skill page behavior.

Out of scope:

- Building an API, API client, loader state, or remote data fetching.
- Desktop-specific navigation or desktop layout behavior.
- Ranking top skills dynamically at runtime.
- Reworking the existing `SkillCard` visual contract beyond what mobile fit requires.
- Adding new app dependencies or a new styling system.

## Recommended Approach

Use a single mobile-first page shell for every viewport. The layout should be a centered mobile content frame, not a responsive desktop page. On large screens, the frame can remain mobile-width inside the viewport so visual QA only targets one layout mode.

Move search ownership up from `SkillSection` into the app-level skills page shell. The top bar owns the search filters and passes them only to the full list section. The top-five carousel receives a fixed `highlightedSkills` array derived from local data and selected IDs, so it never changes during search.

Keep the existing presentational components:

- `SkillSearch` remains the search control.
- `SkillCarousel` renders highlighted cards.
- `SkillList` renders filtered results.
- `SkillCard` remains the card contract for carousel items.
- `SkillSection` can be kept for generic section usage or refactored only if needed to avoid duplicated filtering state.

## Initial Top Five Skills

The initial highlighted skills should be selected from the existing public evidence catalog:

1. `Kubernetes`
   - Description should emphasize cloud-native workload operations, troubleshooting, and infrastructure capability.
   - Evidence basis: CNCF Kubernetes certification, workloads, kubectl troubleshooting, cluster operations, image digest deployments, IRSA, and Terraform IAM.
   - Categories: `Container`, `Cloud`.
   - Level: `4`.

2. `GitHub Actions`
   - Description should emphasize CI/CD workflow ownership across integration, delivery, and deployment automation.
   - Evidence basis: GitHub Actions CI workflow ownership and team delivery workflow ownership.
   - Categories: `CI/CD`.
   - Level: `4`.

3. `Nx`
   - Description should emphasize monorepo quality gates for lint, build, test, and type-check workflows.
   - Evidence basis: Nx affected quality gates and portfolio repository work.
   - Categories: `Build`, `Tooling`.
   - Level: `4`.

4. `Terraform`
   - Description should emphasize reproducible infrastructure and scoped IAM policy management.
   - Evidence basis: Terraform-managed scoped IAM policies and IRSA service account migration.
   - Categories: `IaC`, `Cloud`.
   - Level: `4`.

5. `Docker`
   - Description should emphasize packaging, delivery workflows, and immutable image deployment practices.
   - Evidence basis: Docker delivery workflow support and immutable image digest deployments.
   - Categories: `Container`, `Runtime`.
   - Level: `4`.

`TypeScript` and `React` remain important full-list skills, but they are not in the initial top-five carousel because the current public evidence catalog is stronger for DevOps platform skills.

## Data Design

Create or reshape local skill data around two exports:

- `skills`: all locally stored skills shown in the searchable list.
- `highlightedSkillIds`: ordered IDs for the fixed carousel.

Derive `highlightedSkills` by matching `highlightedSkillIds` against `skills`. Missing IDs should be handled deterministically in code or tested as a data integrity rule so the carousel cannot silently drift from the catalog.

The `Skill` interface remains the primary card/list shape:

- `id`
- `name`
- `description`
- `categories`
- `level`
- `iconSlug`
- `keywords`
- optional `certifications`

The future API should be able to return this same shape or a thin adapter should normalize API records into this shape.

## Layout And Interaction

The app shell should contain:

1. A visually labelled page root for accessibility.
2. A compact top bar with only search.
3. A fixed highlighted skills carousel.
4. A full skills list filtered by the search filters.

Search behavior:

- Empty search shows the full skills list.
- Matching search filters the full list by the existing `skillMatchesFilters` behavior.
- No-match search shows the existing filtered empty state.
- The carousel remains unchanged for every search state.

Mobile-only behavior:

- Use the same mobile frame at all viewport sizes.
- Do not add desktop nav items, desktop grids, or alternate desktop placement.
- Keep text and controls within mobile width constraints.

## Accessibility

The top search must retain an accessible label. The carousel should retain its non-visible accessible label, such as `Highlighted skills`, without adding visible instructional copy. The full list should remain a labelled section for screen reader navigation.

The page should preserve a single logical page title through a visually hidden heading. Search, carousel, and list regions should be reachable by role or label in tests.

## Styling

Use Astryx components and tokens first. Use StyleX for component-specific structure and Tailwind only for wrapper-level layout where consistent with the app's current Astryx/Tailwind boundary. Keep the existing scoped `.skill-carousel` CSS height alignment unless implementation evidence shows it conflicts with the new page shell.

Do not introduce arbitrary colors, decorative gradients, rounded marketing cards, or a desktop landing-page composition. The result should feel like a compact mobile portfolio tool.

## Testing And Validation

Focused automated checks should cover:

- App shell renders mobile-only search, highlighted carousel, and full skills list.
- Top search filters the full list.
- Top search does not filter the highlighted carousel.
- Highlighted skill IDs resolve to exactly five skills in the intended order.
- Empty and no-match list states remain correct.

Recommended validation commands:

- `pnpm nx test github.io`
- `pnpm nx lint github.io`
- `pnpm nx build github.io`

Because this is a visual UI change, implementation should also include Storybook or browser verification at mobile dimensions and at a large viewport that still renders the mobile frame.

## Risks

- The existing `SkillSection` owns search state today, so moving search to the top bar may require a small component boundary change.
- Highlighted skill descriptions need to stay public-safe and evidence-backed; avoid copying raw interview details into the app.
- Mobile-only at all viewport sizes is intentional and should be protected by tests or visual review so future responsive work does not accidentally reintroduce a desktop layout.
