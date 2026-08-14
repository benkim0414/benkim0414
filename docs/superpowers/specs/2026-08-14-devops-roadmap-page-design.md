# DevOps Roadmap Page Design

## Goal

Add a public `/roadmap` page to the `github.io` app that presents the existing
DevOps roadmap component as a structured overview of the portfolio owner's
DevOps skills and certifications. The page must explain the reference framework
professionally, attribute roadmap.sh, and leave the underlying roadmap data and
component behavior unchanged.

## Context

Local `main` already provides `DevOpsRoadmap`, its static roadmap.sh-derived
topic data, skill tokens, certification citations, tests, and Storybook stories.
This feature composes that existing component into a route-level page rather
than creating another roadmap implementation.

Navigation is being developed separately. This feature registers the route so
that navigation can link to it later, but it does not add or modify any navbar,
top-nav item, shared shell, or skill-detail navigation.

## Design-system hierarchy

Apply this UI decision hierarchy throughout implementation:

1. Use an Astryx component when one is available.
2. Preserve the Astryx component's default style and anatomy as the first
   priority.
3. When composition needs additional direction, follow Astryx design guidance
   and use Astryx semantic tokens and supported component props.
4. Fall back to Material Design 3 guidance only when Astryx provides neither a
   suitable component nor applicable guidance.

Custom styling must be limited to necessary mobile page composition. It
must not override Astryx component anatomy or replace supported Astryx props.
The implementation must inspect the installed version's official Astryx
component documentation before using or modifying each Astryx component.

## Route and page composition

Register `/roadmap` in `AppRoutes` and render a dedicated `RoadmapPage`.
`RoadmapPage` owns page-level composition only. It renders, in order:

1. A visible level-one heading: `DevOps roadmap`.
2. An informational Astryx `Banner`.
3. The existing `DevOpsRoadmap` with its default props and local-main data.

Use Astryx layout and typography components where available. The page uses the
full available mobile width with the existing page padding and no maximum-width
constraint. It uses normal document-level vertical scrolling, with no nested
page scroller. The roadmap diagram is centered horizontally, and its React Flow
background pattern is omitted so the normal page surface remains visible. The
roadmap otherwise retains its existing node layout and static React Flow
behavior. Tablet and desktop composition are intentionally deferred.

## Banner content and action

The banner is not dismissible and uses the standard Astryx informational
treatment.

- Title: `About this roadmap`
- Description: `This roadmap presents my DevOps capabilities using the learning
path published by roadmap.sh as a reference framework. Each topic highlights
relevant skills and certifications, providing a structured overview of my
experience across the DevOps discipline.`
- Action label: `Learn more`
- Action destination: `https://roadmap.sh/devops`

Follow the established DORA capability banner pattern: place an Astryx `Button`
with `variant="secondary"` in the banner's supported end-content slot. The link
opens in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.
Preserve the default Banner styling and the Button's default styling within its
supported secondary variant rather than introducing page-specific overrides.

## Component boundaries and data flow

`RoadmapPage` depends on `DevOpsRoadmap` through its existing public component
contract. It does not import, transform, filter, duplicate, or own the roadmap
item dataset.

The data flow remains one-way and static:

`AppRoutes` -> `RoadmapPage` -> `DevOpsRoadmap` -> existing default roadmap data

The roadmap component continues to own node construction, measured layout,
skills, certifications, edges, and accessibility labeling. This separation
allows roadmap data to be updated later without changing the page.

## Behavior and accessibility

- The route renders one visible `h1` for page identity.
- The existing roadmap labelled group and semantic node headings remain intact.
- The page adds no roadmap dragging, zooming, selection, filtering, editing, or
  progress state.
- The external action has an unambiguous accessible name and safe new-tab link
  attributes.
- Static local content requires no loading, empty, or error state at the page
  level.
- Keyboard and screen-reader behavior rely on the supported Astryx component
  contracts and the existing non-interactive roadmap semantics.

## Testing and visual review

Add focused tests that verify:

- `RoadmapPage` renders the `DevOps roadmap` level-one heading.
- The banner renders its approved title and description.
- `Learn more` targets `https://roadmap.sh/devops` and includes the safe new-tab
  attributes.
- The existing `DevOpsRoadmap` is composed without replacement or data
  overrides.
- The roadmap omits the React Flow background pattern.
- `AppRoutes` renders the page for `/roadmap`.

Add a default `RoadmapPage` Storybook story for isolated visual review. Verify
the implementation at a mobile viewport, ensuring full-width composition, a
horizontally centered roadmap diagram, normal vertical scrolling, readable
banner content, and no horizontal overflow.

Run the focused `github.io` tests plus its lint, build, and Storybook build
targets. The implementation baseline is 59 passing test files and 578 passing
tests on local `main`.

## Out of scope

- Adding or changing navbar links, top navigation, or an application shell.
- Updating roadmap topics, skill mappings, or certifications.
- Adding editing, filtering, search, completion state, or persistence.
- Changing `DevOpsRoadmap` interactions, graph layout, or visual styling beyond
  removing the background pattern and centering the diagram horizontally.
- Reproducing the roadmap.sh site or the Astryx marketing homepage.
- Introducing new design-system abstractions or a Material Design dependency.
- Adding tablet or desktop layout constraints, breakpoints, or presentation.

## Risks and safeguards

- **Concurrent navbar work:** keep page and route changes independent of navbar
  composition so the other session can integrate without overlapping files
  beyond the route table if necessary.
- **Design-system drift:** verify installed Astryx contracts and preserve default
  component styles before adding any local layout styling.
- **Nested scrolling or overflow:** use document scrolling and test the mobile
  layout with the full roadmap dataset.
- **Accidental data changes:** page tests should prove default roadmap
  composition; data files and the existing roadmap component are not part of
  this feature's implementation scope.
