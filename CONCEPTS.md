# Concepts

Shared domain vocabulary for this project -- entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## GitHub Pages Site

### github.io App

The static React application that will become the root GitHub Pages user site for this repository owner.

### App Shell

The generic first-screen layout scaffold for the `github.io` App: navigation, content regions, and footer without real portfolio content.

### Mobile Page Shell

The mobile-only route wrapper for a `github.io` page, including the constrained viewport, non-scrolling top rails such as navigation or highlighted content, and the scrollable content region below them.

Mobile Page Shells should be rendered by page-level Storybook stories when the visual requirement involves navigation, search, fixed rails, or mobile scroll behavior.

### DevOps Roadmap

The `github.io` App visualization that adapts roadmap.sh DevOps topics into a static, skill-filtered timeline for the portfolio.

DevOps Roadmap items carry a topic title, the owner's matching skills, and optional certification evidence; it is a presentation of portfolio coverage, not a full roadmap.sh clone.

### DevOps Capability Evidence

The public portfolio model that connects LinkedIn-style proof, such as skills, learning, experience, education, certifications, and projects, to DevOps capability dimensions.

DevOps Capability Evidence is a public projection: it can summarize private work, but shipped entries must be safe to render on the public `github.io` App and skills should be backed by separate non-skill proof.

### Evidence Token

A compact presentation of one public-safe capability evidence record, used to show concrete support without rendering raw interview prose or private source material.

### Capability Evidence Catalog

The canonical public-safe collection of atomic evidence records available for capability scoring, compact projections, and detailed evidence views.

Catalog records own reusable facts and relationships; they do not decide which subset a compact surface displays.

### Canonical Evidence Record

Within aggregate catalog composition, the retained Capability Evidence item for one stable evidence ID when the same proof belongs to multiple capability catalogs.

Where capability catalogs share an item, they reuse the same Canonical Evidence Record; a distinct record with the same ID is a conflict rather than another valid copy.

### Compact Capability Projection

The explicit, score-owned subset, order, and optional capability-level supplemental summary selected for a compact capability surface.

A Compact Capability Projection remains stable when the full catalog grows unless its curated evidence references or supplemental summary are deliberately changed.

### Capability Skill Evidence

A public skill record supported by at least one non-skill evidence record for the same capability, distinct from an accomplishment and not inferred merely from a technology name.

## Design System

### Astryx Foundation

The shared UI baseline for the `github.io` App, covering Astryx reset styles, neutral theme assets, and the root theme wrapper.

Astryx Foundation means new UI work should prefer Astryx components and tokens before introducing local visual primitives.

### Astryx Styling Boundary

The styling rule for the `github.io` App: Astryx components define component anatomy, StyleX and supported third-party theming surfaces handle component-specific overrides with Astryx token aliases, Tailwind handles wrapper and utility layout, and scoped CSS handles generated internals.

Astryx Styling Boundary keeps local visual fixes from replacing Astryx component semantics or drifting from Astryx spacing, radius, and color guidance.

### Astryx Spacing Token

A named spacing step from the Astryx design scale, used through Astryx component props or token aliases instead of arbitrary pixel values.

Astryx Spacing Tokens let visual spacing feedback stay inside the design system: the numeric prop identifies a token step, while the token defines the rendered size.

### Astryx Component Contract

The verified public API and intended content role for an Astryx component, including its props, named sizes, slots, semantic HTML output, accessibility labels, and default ownership boundaries.

Astryx Component Contracts are the source of truth for local wrappers: wrappers should express supported behavior through Astryx props before adding StyleX, Tailwind, or scoped CSS overrides.

### Certification Citation

A reusable certification citation that can link to certification proof, with derived status, visual identity, and optional validated credential details.

The proof link remains the primary action: supplemental details appear only for a concrete, complete credential, while generic or invalid data preserves the plain citation. Within those details, a stable certification category stays separate from record identity, and the human-readable credential name precedes its issuer ID and lifecycle facts. Certification Citation renders a supplied credential image ahead of a generated skill-brand icon; each image source uses its own expired-state treatment, while color-only skill metadata and missing brand metadata receive no visible brand treatment.

### Certification Badge Fixture

A Storybook certification example that represents a credential-specific visual state by supplying that credential's badge image explicitly, rather than relying on linked skill branding.

Certification Badge Fixtures are distinct from fallback stories: badge fixtures validate the credential image path, while fallback stories validate how Certification Citation behaves when no credential image is supplied.

### Skill Card

A reusable card presentation for one skill, showing the skill name, rating, supporting description, and optional certification evidence as one independently comparable item.

### Skill Carousel

A horizontal skills presentation where each Skill Card remains content-driven on its own, while carousel layout equalizes sibling card heights for visual comparison.

### Skill Brand Metadata

The shared visual metadata for a skill label, covering the skill's brand color and, when available, a logo asset.

Skill Brand Metadata can be color-only. A logo represents either the exact
brand or an intentionally documented project-family relationship; locally held
artwork should retain verifiable upstream provenance. Consumers must decide whether
color alone is meaningful for their UI instead of assuming every branded skill
has a logo.

### Skill Avatar

A compact skill logo or initials fallback that presents Skill Brand Metadata inside an Astryx Avatar while letting each surface choose its own design-system size.

### Skill Category Badge Variant

A theme-safe visual category color for a skill category, derived from the category label by mapping it onto approved Astryx Badge variants rather than arbitrary raw colors.

Skill Category Badge Variants distinguish grouping labels without implying status, severity, or completion.

## Tooling Workflow

### pnpm Build Approval

The workspace-level record of which dependency install scripts are allowed to run under pnpm's build-script protection.

pnpm Build Approval should stay package-specific; it is not a global bypass for dependency scripts.

### Peer Check

The dependency-health gate that verifies installed packages satisfy declared peer dependency ranges before branch completion.

### Linked Worktree Verification

The workflow for validating an isolated feature worktree while using a dependency installation that can execute the repo's local tooling.

Linked Worktree Verification keeps feature changes out of the main checkout while ensuring tests, builds, and previews still execute the worktree's source files.
