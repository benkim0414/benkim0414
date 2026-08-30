# Storybook story organization for the GitHub.io app

## Recommendation

Organize the sidebar by **review purpose**, with two top-level areas:

```text
Pages/
  Home
  Skills
  Skill Detail
  Roadmap
  Not Found
Navigation/
  Global Navigation
  Footer
Components/
  Skills/
    Skill Card
    Skill List
    Skill Search
    ...
  Projects/
    Project Card
  Certifications/
    Certification Citation
  DevOps Roadmap/
    Timeline
  DevOps Capability Evidence/
    DORA Capability Card
    Radar
    Capability Evidence
```

Each route-worthy screen should have its own **page story**—including Home,
Skills, Skill Detail, Roadmap, and Not Found—while reusable parts retain their
own **component stories**. This is not duplication: a page story validates the
composed screen and its route context; component stories make each reusable
unit and its interesting states quick to inspect. Storybook explicitly supports
stories from atomic components through composed pages, and says stories should
capture the interesting states a component supports. [Building pages with
Storybook](https://storybook.js.org/docs/writing-stories/build-pages-with-storybook)
[What’s a story?](https://storybook.js.org/docs/get-started/whats-a-story)

Use explicit CSF titles for this sidebar. They are a stable, visible
information architecture, not a substitute for colocating a story file beside
the component it documents. Storybook recommends colocating story files with
their components and recommends a sidebar nesting scheme that mirrors the
component filesystem hierarchy; when the desired review hierarchy differs from
the current source layout, use explicit titles consistently and consider later
aligning source folders where it brings clarity. [How to write
stories](https://storybook.js.org/docs/writing-stories/index) [Sidebar &
URLs](https://storybook.js.org/docs/configure/user-interface/sidebar-and-urls)

## Why a `Pages` group is appropriate

`Pages` is an intentional boundary for whole screens, not a claim that the
repository must introduce a physical `pages/` directory. It makes it obvious
where a reviewer goes to assess the deployed routes, while `Components` remains
an inventory of reusable UI. Storybook’s own hierarchy guidance uses a `Pages`
section in its custom sorting example, and identifies category, folder,
component, and individual story as separate levels in the sidebar. [Naming
components and hierarchy](https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy)

For this app, the page group should contain one canonical default for each
public route plus only meaningful alternative screen states (for example,
empty Skills or enriched/basic Skill Detail). Avoid making every component
state a page story. This keeps the page area an effective route-review surface
rather than a duplicate component catalogue.

## Route-aware pages

Use the existing `MemoryRouter` decorator and its `appRoute` story parameter
for stories that should exercise application routing, including a canonical
route story for `/skills/:skillId`. Keep provider setup (theme, link adapter,
and router) at the global preview level because those dependencies are shared
across most stories; use a story-level decorator only for a page-specific
fixture or a route-specific override. Storybook documents decorators as the
mechanism for wrapping stories with rendering context and supports global,
component, and story-level decorators. [Decorators](https://storybook.js.org/docs/writing-stories/decorators)

Where a page is data-connected, prefer a presentational page plus a thin route
or container wrapper, or mock the page’s data/providers at the boundary. The
Storybook page guidance specifically recommends keeping connected logic outside
presentational pages when practical, and describes mocking imports, API
services, and providers when that separation is not possible. [Building pages
with Storybook](https://storybook.js.org/docs/writing-stories/build-pages-with-storybook)

## Tailoring to the current stories

The current project already has the necessary screen stories, but the sidebar
mixes routes and reusable components under domain roots such as `GitHub.io/Skills`
and `GitHub.io/DevOps Roadmap`. It also has two different route-review patterns:

- `HomePage`, `SkillsPage`, `SkillDetailPage`, `RoadmapPage`, and `NotFoundPage`
  render page components directly;
- `GlobalNavigationLayout` uses `appRoute` stories for `/`, `/roadmap`,
  `/skills`, and `/skills/kubernetes`.

Keep direct page stories for component-state inspection, but add or rename a
small set of canonical route stories under `Pages` so the public route is
tested with the application router. Do not treat `GlobalNavigationLayout` as
the only route surface: its job is navigation-shell coverage, while a page
story should express a screen’s content and state. This makes Skill Detail a
first-class page alongside Home and Roadmap.

Suggested titles (illustrative):

| Existing subject | Suggested title |
| --- | --- |
| `HomePage` | `Pages/Home` |
| `SkillsPage` | `Pages/Skills` |
| `SkillDetailPage` | `Pages/Skill Detail` |
| `RoadmapPage` | `Pages/Roadmap` |
| `NotFoundPage` | `Pages/Not Found` |
| global navigation layout | `Navigation/Global Navigation` |
| skill reusable units | `Components/Skills/<Component>` |
| roadmap reusable timeline | `Components/DevOps Roadmap/Timeline` |

## Naming and sorting rules

- Keep one predictable separator-based convention (`Pages/…`,
  `Components/<domain>/…`); Storybook groups sidebar entries by common title
  prefixes separated by `/`. [Sidebar &
  URLs](https://storybook.js.org/docs/configure/user-interface/sidebar-and-urls)
- Use descriptive UpperCamelCase named story exports for states such as
  `Default`, `Empty`, `EnrichedKubernetes`, and `BasicSkill`; Storybook
  recommends UpperCamelCase exports. [How to write
  stories](https://storybook.js.org/docs/writing-stories/index)
- Add `storySort` only if the default ordering does not preserve the intended
  reviewer journey. It can explicitly place `Pages` before `Navigation` and
  `Components`, with alphabetical sorting within each area. Storybook supports
  both an order array and a custom sort function. [Naming components and
  hierarchy](https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy)
- Do not rely on title changes as a cosmetic-only refactor: Storybook derives
  story identifiers and URLs from the component title and story name by
  default, so preserve or deliberately migrate any bookmarked visual-test URLs.
  [Sidebar & URLs](https://storybook.js.org/docs/configure/user-interface/sidebar-and-urls)

## Scope for a follow-up change

This research recommends a taxonomy and route-coverage policy only. A follow-up
implementation should inventory every story, map its current title to its new
title, decide which page stories should run through `appRoute`, update any
tests that assert titles or IDs, and build Storybook to catch broken metadata.
