## Context

The app has shadcn/ui initialized with the `new-york` style, Tailwind v4, CSS variables enabled, and app-local aliases. The only app-local shadcn primitive currently present under `apps/github.io/src/components/ui` is `Button`; theme and toggle components sit outside that UI primitive directory.

The user wants shadcn components used as much as possible, but also said not to create a new one. That means implementation should prefer existing primitives, not run the shadcn CLI or copy registry code into the repo.

Relevant shadcn references:

- `https://ui.shadcn.com/docs/components`
- `https://ui.shadcn.com/docs/components-json`

## Goals / Non-Goals

**Goals:**

- Make existing shadcn primitives the preferred option for matching interactions.
- Keep the implementation compatible with shadcn's CSS-variable theming model.
- Preserve native semantics for search input, fieldsets, checkboxes, labels, result articles, and simple text blocks when no app-local shadcn primitive exists.

**Non-Goals:**

- Do not run `shadcn add`, `shadcn init`, or `shadcn add --all`.
- Do not create app-local `Input`, `Card`, `Badge`, `Checkbox`, `Label`, `Toggle`, or other shadcn component files.
- Do not restyle the app as part of this change; theme work belongs to `apply-github-io-design-theme`.
- Do not change search algorithms, URL synchronization, skill data, or deployment behavior.

## Decisions

- Use `Button` for actionable buttons and links that visually behave like actions, including icon-plus-label contact actions where the app needs that treatment.
- Keep `ThemeToggle` built on `Button`, because that already matches the local shadcn setup.
- Use semantic HTML directly for form and content structures that do not have local shadcn primitives. Styling those elements with Tailwind semantic tokens is acceptable because shadcn itself relies on those tokens.
- Treat `components.json` as the source of truth for shadcn configuration. Its `cssVariables: true`, `style: "new-york"`, and local aliases should remain unchanged unless a future change explicitly revisits shadcn setup.

## Risks / Trade-offs

- Using semantic HTML for missing primitives may look less uniform than generated shadcn components. Mitigation: rely on the shared theme tokens and consistent Tailwind state classes.
- Avoiding new shadcn components limits how much can be standardized in this pass. Mitigation: this keeps the change aligned with the user's explicit constraint and prevents registry churn.
- Future implementers may be tempted to create local wrappers for every chip or card. Mitigation: the spec requires no new UI component files for this change.
