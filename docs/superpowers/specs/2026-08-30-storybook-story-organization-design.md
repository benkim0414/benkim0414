# Storybook story organization design

## Goal

Make the GitHub.io Storybook sidebar a clear review surface for both public
screens and reusable UI without changing the application's route structure.

## Information architecture

Organize Storybook by review purpose, using explicit CSF titles:

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
  Projects/
  Certifications/
  DevOps Roadmap/
  DevOps Capability Evidence/
```

`Pages` is a Storybook navigation group, not a required new source directory.
Stories remain colocated with the screen or reusable component they document.

## Story responsibilities

Every public route has one canonical page story:

| Route | Story title |
| --- | --- |
| `/` | `Pages/Home` |
| `/skills` | `Pages/Skills` |
| `/skills/:skillId` | `Pages/Skill Detail` |
| `/roadmap` | `Pages/Roadmap` |
| unmatched route | `Pages/Not Found` |

Page stories verify the composed screen in its route context. They may include
only meaningful screen-level variants, such as an empty catalogue or a selected
skill fixture. Reusable component stories remain independently reviewable in
`Components/<domain>/*`; component states must not be mechanically duplicated
under `Pages`.

`Navigation/Global Navigation` and `Navigation/Footer` remain separate because
they describe shared shell behavior rather than a particular route's content.

## Routing and shared context

Continue using the global Storybook preview decorator for shared providers,
including the theme, link adapter, and router. Page stories use the established
route parameter and router setup to render the canonical URL. Add story-level
decorators only for page-specific fixtures or route overrides.

The global navigation stories retain coverage of shell state across routes. They
do not replace the canonical page stories, particularly for Skill Detail.

## Naming and ordering

Use slash-separated, explicit titles consistently, and UpperCamelCase named
exports for states such as `Default`, `Empty`, and `EnrichedKubernetes`.
Configure `storySort` only when needed to guarantee the review journey:
`Pages`, then `Navigation`, then `Components`, with alphabetical ordering within
each group.

Because Storybook derives IDs and URLs from titles and export names, treat title
changes as an intentional URL migration. Update title- or ID-sensitive tests and
visual-review links in the same change.

## Implementation boundaries

In scope:

- Rename/reclassify existing story titles according to this taxonomy.
- Add canonical route-aware page stories where the current direct-render story
  does not cover route behavior.
- Add or adjust focused Storybook routing tests and Storybook build checks.

Out of scope:

- Moving production application files into a physical `pages/` directory.
- Changing production routes, navigation behavior, UI design, or application
  data.
- Creating page stories for every reusable component state.

## Validation

- Confirm the Storybook sidebar contains the agreed top-level groups and page
  entries.
- Verify each canonical page story renders its intended route, including a
  concrete skill-detail URL and the not-found fallback.
- Run focused app tests that assert routing/story metadata, then build
  Storybook through the Nx `github.io` target.

## Risks

The main risk is silently breaking bookmarked, embedded, or test-referenced
Storybook URLs when titles change. Inventory current titles before edits and
update corresponding expectations atomically.
