# DevOps Roadmap Timeline Design

Date: 2026-07-17

## Summary

Build a standalone `DevOpsRoadmap` React component that represents the core DevOps knowledge path from the roadmap.sh DevOps diagram/PDF as a read-only vertical timeline. The component uses React Flow for node and edge rendering, follows Astryx design guidance, and keeps the existing skills list untouched.

## Goals

- Render only the yellow core knowledge nodes from the roadmap.sh DevOps diagram/PDF.
- Preserve the roadmap.sh diagram order from top to bottom.
- Show each core node title as the primary node label.
- Show only the purple-ticked roadmap recommendation/opinion items as chips under the matching core node.
- Use React Flow through the current `@xyflow/react` package.
- Keep the component read-only: no dragging, connecting, editing, or node selection workflows.
- Allow callers to render the timeline in reverse order through a component prop, without adding in-component controls in v1.
- Follow Astryx design guidance, components, and theme tokens before introducing local styling.
- Ship the roadmap as an isolated reusable component with focused tests and Storybook coverage.

## Non-Goals

- Do not replace the current skills list page or remove existing skills components.
- Do not render the full roadmap.sh DevOps graph.
- Do not include non-core nodes, unticked items, or user-defined chips outside the roadmap.sh purple-ticked items.
- Do not add page routing, navigation, persistence, filtering, search, or editing in v1.
- Do not add a visible reverse-order button, toggle, segmented control, or other runtime ordering control in v1.
- Do not reuse implementations from existing roadmap-related worktrees.

## Source Data

The source of truth for v1 content is the roadmap.sh DevOps diagram/PDF as accessed on 2026-07-17. Implementation should transcribe the yellow core nodes and their purple-ticked recommendation/opinion items into a local typed data module.

Each roadmap item should contain:

- `id`: stable kebab-case identifier.
- `title`: visible core node title from roadmap.sh.
- `skills`: ordered list of purple-ticked chip labels under that core node.

The local data should intentionally omit full-roadmap metadata until it is needed. If a core node has no purple-ticked skills in the source diagram, render the node title without chips rather than inventing content.

## Architecture

Add a new roadmap feature area under the `github.io` app, separate from the existing `skills` feature. A likely structure is:

- `devops-roadmap.data.ts` for typed roadmap data.
- `devops-roadmap.types.ts` for exported item and component prop types.
- `devops-roadmap.tsx` for React Flow composition.
- `devops-roadmap-node.tsx` for the custom node body.
- colocated tests and Storybook stories.

`DevOpsRoadmap` should accept an optional `items` prop for testability and future reuse, defaulting to the transcribed DevOps roadmap data. It should also accept an optional reverse-order prop so callers can render bottom-to-top order while keeping the source data unchanged. It should convert the derived ordered items into fixed React Flow nodes and edges. Positions can be deterministic, using a consistent vertical gap and a single x-coordinate, because the v1 layout is a timeline rather than an editable graph.

Use React Flow custom node types so the visual node body can use Astryx-compatible markup and styling. The React Flow wrapper should disable interactive editor behavior with the available props, including node dragging, connecting, element selection, pane dragging where appropriate, zoom-on-scroll if it harms page scroll, and keyboard deletion/editing affordances.

## UI and Layout

The roadmap should appear as a compact vertical timeline. Each node should be an information surface with:

- a strong title;
- optional chips for purple-ticked skills;
- enough spacing to scan vertically without oversized card styling.

Use Astryx tokens for color, spacing, typography, borders, and radius wherever the installed theme exposes them. Purple should be reserved for recommendation/opinion chips so the roadmap meaning stays clear. Core nodes should not become a one-note purple UI; use neutral surfaces and text with restrained emphasis.

The component should be responsive. On small screens, nodes should remain readable without horizontal scrolling. The React Flow viewport may use a fixed computed height based on node count, or another stable responsive constraint, so nodes and edges do not overlap.

## Accessibility

`DevOpsRoadmap` should expose a semantic section with an accessible heading. React Flow is visual, so the component should also keep the roadmap understandable through rendered text content:

- each node title is visible text;
- each chip label is visible text;
- edges are decorative and must not be the only way to understand order;
- tests should be able to query node titles and chip labels through the DOM.

If React Flow internals add keyboard behavior that implies editing, disable it where supported. The read-only roadmap should not expose controls that suggest modification.

## Testing

Add focused tests for:

- rendering roadmap items in source order;
- rendering purple-ticked chips under their matching core node;
- rendering nodes without chips when `skills` is empty;
- creating the expected number of connecting edges for a vertical timeline;
- preserving read-only configuration for interaction props where practical.

Run these checks after implementation:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx lint github.io
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx build github.io
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx build-storybook github.io
```

## Storybook

Add a Storybook story for the standalone roadmap component using the default roadmap data. Include at least one compact fixture story with a small set of items so node spacing and chip wrapping can be inspected quickly.

The story should render inside the existing Astryx-themed Storybook setup and avoid introducing a separate design theme.

## Risks and Validation Points

- Roadmap.sh content may change. The implementation should capture the transcribed date in code comments or documentation so future updates are explicit.
- React Flow may need CSS imports from `@xyflow/react/dist/style.css`; verify the installed package guidance during implementation.
- Astryx may not provide a perfect chip primitive for this use case. Prefer existing Astryx `Badge` if suitable; otherwise use local chip markup styled with Astryx tokens.
- React Flow's default interactions are editor-oriented. Verify the rendered component does not feel editable in browser QA.
