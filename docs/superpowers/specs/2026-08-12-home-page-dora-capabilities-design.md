# Home Page DORA Capabilities Design

## Goal

Turn the mobile skills landing surface into the app home page. Keep the five
highlighted skills and searchable skill reference, then replace the full skills
list with an introduction to DORA and the existing evidence-backed DORA
capability cards.

## Scope

- Rename `MobileSkillsPage` and its companion test and Storybook files to
  `HomePage`.
- Update `AppShell` and all remaining references to use `HomePage`.
- Add the visible label `Top skills` above the five-skill carousel.
- Remove `SkillAvatar` from command-palette skill results and render each result
  as its skill name only.
- Remove the selected-skill page state and controlled picker props. Selecting a
  result may perform the command palette's built-in selection and dismissal,
  but it must not navigate, filter, or otherwise mutate home-page content.
- Replace the full skills list below the carousel with a `DORA capabilities`
  section.
- Introduce that section with an Astryx informational banner and an external
  link to the official DORA capabilities catalog.
- Render all ten existing evidence-backed DORA capability cards in canonical
  order.

The following are out of scope:

- A skill-detail page or any new route.
- Navigation changes beyond removing page-level skill selection behavior.
- Changes to skill data, highlighted-skill selection, or carousel card design.
- DORA capability-card redesign.
- DORA evidence, scoring, descriptions, or canonical ordering changes.
- A broader desktop or responsive-shell redesign.

## Page Structure

`HomePage` preserves the existing constrained mobile frame and viewport
ownership:

1. A persistent `TopNav` with the skill-search action.
2. A fixed `Top skills` heading followed by the five-card skill carousel.
3. A scrollable main region headed `DORA capabilities`.
4. An Astryx `Banner` that explains DORA and links to the official catalog.
5. The ten existing `DoraCapabilityCard` components.

The fixed top-skills region stays outside the scrollable main region, matching
the existing carousel/list boundary. The main region continues to own the
remaining vertical space and scrolling so the longer capability-card collection
does not move the navigation or carousel shell.

The semantic heading hierarchy is:

- A visually hidden `Home` level-one heading naming the page.
- Visible level-two headings for `Top skills` and `DORA capabilities`.
- The existing level-three headings owned by each `DoraCapabilityCard`.

## Skill Search Behavior

The search button and modal `CommandPalette` remain available. The palette
continues to bootstrap the skill catalog, group results under `Skills`, and
match names, descriptions, categories, and keywords.

Results use the command palette's standard text rendering rather than a custom
`SkillCommandResult`. `SkillAvatar`, `HStack`, and the custom result component
are removed from `HomePage`. The page also removes `selectedSkillId`,
`visibleSkills`, `value`, and `onValueChange` because the home page is no longer
a skill picker.

Keyboard navigation and the command palette's built-in result selection and
dismissal remain intact. A result selection has no downstream application
effect: it does not navigate, filter DORA cards, create a detail page, or change
the carousel.

An empty skill catalog preserves the existing command-palette `No skills`
messages. An empty highlighted-skill collection preserves the carousel's
existing empty state beneath the `Top skills` label.

## DORA Information Banner

Use Astryx `Banner` rather than `TopNavMegaMenuFeaturedCard` or unframed text.
`Banner` is the design-system surface for persistent contextual information and
supports an end-aligned action. `TopNavMegaMenuFeaturedCard` is reserved for a
promotional featured slot inside a mega menu and would give page content the
wrong navigation semantics.

The banner uses `status="info"` and its default card container. It is not
dismissable because the explanation provides enduring context for the section.
Its copy is:

> DORA capabilities are technical, process, and cultural practices associated
> with stronger software delivery and organizational performance. Each card
> connects a capability to supporting experience, certifications, and technical
> skills.

The end action is an Astryx `Link` with the descriptive text
`Learn more about DORA`, `href="https://dora.dev/capabilities/"`, and external
link behavior. The capabilities catalog is the canonical destination for this
section and covers the capabilities shown by the app.

## DORA Card Composition and Data Flow

`HomePage` maps `doraCapabilityDefinitions` in its existing order. Every
definition renders one `DoraCapabilityCard` with:

- `description` from `doraCapabilityDescriptions[capability.key]`.
- The shared `devOpsCapabilityEvidenceItems` catalog.
- The shared `curatedDevOpsCapabilityRadarScores` collection.

The card already selects the evidence rows and score summary associated with
its capability key. The page must not duplicate that projection logic or build
a second home-specific DORA view model.

The DORA collection is canonical app content rather than a new configurable
`HomePage` prop. Consequently, no DORA empty-state API is added. Existing
`skills` and `highlightedSkills` props remain available to keep the home-page
story and focused tests configurable.

## Component Boundaries

- `AppShell` supplies the Astryx theme and renders `HomePage`.
- `HomePage` owns the mobile frame, search-dialog state, section labels,
  informational banner, and composition of existing data-backed surfaces.
- `SkillCarousel` continues to own carousel and highlighted-skill empty-state
  behavior.
- `DoraCapabilityCard` continues to own capability presentation and the
  evidence/score projection for a single capability.
- Existing skill and DORA data modules remain the only data sources.

No new reusable component is required unless implementation shows that the
page file becomes difficult to understand. Any extraction must preserve these
ownership boundaries and remain local to this feature.

## Validation

Focused tests and Storybook coverage will verify:

- No `MobileSkillsPage` file, export, story title, test description, import, or
  app-shell reference remains; `HomePage` is the app root.
- The hidden `Home` page title and visible `Top skills` and
  `DORA capabilities` headings produce the intended document outline.
- The carousel remains above the scrollable main region and renders the five
  configured highlighted skills.
- Command-palette results render skill names without skill avatars.
- Choosing a command result does not change the carousel or DORA-card content.
- Empty skill and highlighted-skill inputs retain their respective search and
  carousel empty states.
- The informational banner contains the approved copy and an external
  `Learn more about DORA` link to `https://dora.dev/capabilities/`.
- Exactly ten DORA cards render in the canonical definition order.
- Cards receive the existing descriptions, evidence catalog, and curated
  scores, preserving evidence-backed summaries and rows.
- The mobile viewport frame, persistent top navigation, fixed carousel region,
  and scrollable main-region boundaries remain intact.

Implementation validation must include:

- `pnpm nx lint github.io`
- `pnpm nx test github.io`
- `pnpm nx build github.io`
- Focused Storybook visual review at the existing mobile page viewport,
  checking heading spacing, banner/link wrapping, card overflow, and scroll
  behavior.

The UI design was checked against the official Astryx documentation for
layout, `Banner`, `TopNavMegaMenuFeaturedCard`, `CommandPalette`, `Link`, and
`Heading`. Implementation must re-check the relevant component contracts before
changing UI code, as required by the app instructions.
