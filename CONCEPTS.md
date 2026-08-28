# Concepts

Shared domain vocabulary for this project -- entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## GitHub Pages Site

### github.io App

The static React application that will become the root GitHub Pages user site for this repository owner.

### App Shell

The application-level composition boundary for the `github.io` App, owning shared context, persistent global navigation, the route table, and the shared vertical scroll region without absorbing page-specific content composition.

An App Shell keeps cross-page transitions URL-authoritative while each page owns its local interactions, semantic main landmark, spacing, and content. Because its scroll region persists across route changes, the shell also restores the destination route's initial scroll position.

### Mobile Page Shell

The responsive, mobile-oriented presentation of the App Shell, including the constrained viewport, persistent global navigation, and the shared scroll region containing the active route.

Mobile Page Shells keep global navigation outside the Page Scroll Owner while route mains remain descendants of that owner. Page-level Storybook stories should render the production shell for navigation, routing, or scroll behavior and use isolated route content only for page-local behavior.

### Page Scroll Owner

The single region inside a Mobile Page Shell that owns vertical overflow for every active-route section intended to move together; for globally framed routes, it belongs to the persistent App Shell rather than to an individual route.

Route components contribute semantic main landmarks beneath the Page Scroll Owner and do not create competing vertical owners. Sections such as Top skills and DORA capabilities remain descendants of the same owner when they share page movement; component-local horizontal scrolling, such as a Skill Carousel, stays independent.

### Skill Detail Navigation

The URL-backed transition from a skill entry point to the corresponding Skill Detail page, shared by card links and command-palette selection.

Skill Detail Navigation keeps the destination durable and delegates skill lookup, missing-skill handling, and detail rendering to the routed detail surface.

### DevOps Roadmap

The `github.io` App visualization that adapts roadmap.sh DevOps topics into a static, skill-filtered timeline for the portfolio.

DevOps Roadmap items carry a topic title, the owner's matching skills, and optional certification evidence; it is a presentation of portfolio coverage, not a full roadmap.sh clone.

### DevOps Roadmap Skill Inventory

The DevOps Roadmap projection that shows only selected roadmap.sh nodes with visible evidence rows for certifications, concrete skill tokens, and covered concepts.

Recommended-but-uncovered roadmap items stay outside the visible node rows as gaps; empty nodes remain visible but disabled rather than converting gaps into evidence.

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

### Skill Detail Evidence Projection

The explicit, ordered subset of Canonical Evidence Records selected to demonstrate fluency on one skill detail page, independently of related project-card content.

A Skill Detail Evidence Projection accepts only public, non-sensitive experience evidence; projects remain a separate portfolio presentation even when they demonstrate the same skill.

### Experience Narrative

A reusable public-safe account of professional experience that can link one achievement story to skills, projects, capability evidence, and future portfolio surfaces without duplicating prose.

An Experience Narrative may carry more relationships than a specific UI renders; each consumer chooses its projection, such as a skill detail card that shows narrative prose and relevant skills while omitting broader metadata.

### Evidence-Calibrated Capability Score

A public capability maturity value derived only from a Compact Capability Projection by combining bounded evidence strength, initiative breadth, and corroboration.

An Evidence-Calibrated Capability Score remains stable when unrelated catalog evidence grows, and its exceptional tier requires independent evidence conditions rather than volume alone.

### Capability Skill Evidence

A public skill record retained only when at least one separate public non-skill evidence record supports a shared capability.

### Skills Page Catalog Projection

The visible all-skills projection that renders canonical, public skill records as comparable cards while leaving lower-level evidence labels covered by broader skills.

A Skills Page Catalog Projection accepts products, services, tools, libraries, frameworks, and languages as standalone cards; concepts, subfeatures, protocols, CLI aliases, and broad umbrellas remain searchable evidence or map to a more specific canonical skill.

### Skill Confidence

A self-rated, qualitative confidence signal attached to a public skill record, presented as supporting metadata rather than an externally verified rating, status, or category.

Skill Confidence keeps the portfolio claim modest: it can help readers compare the author's comfort across skills, but it does not replace separate evidence such as projects, certifications, or capability records.

### Skill Primary Use

A concise, recruiter-facing purpose label on a public skill record that states the work context the skill is meant to signal, separate from category, confidence, and proof evidence.

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

A reusable card presentation for one skill, showing the skill name, self-rated confidence, supporting description, and optional certification evidence as one independently comparable item.

### Skill Token

A compact presentation of a canonical skill record for dense evidence rows, using the skill name as the label and the skill identity when the token can navigate to detail.

Skill Tokens may use brand metadata or stay neutral depending on the surface. Evidence-heavy rows keep neutral chrome even when the same skill has brand metadata elsewhere.

### Project Card

A reusable card presentation for one public portfolio project, showing the project title, supporting description, skill evidence, and source citation as one independently comparable item.

### Skill Carousel

A horizontal skills presentation where each Skill Card remains content-driven on its own, while carousel layout equalizes sibling card heights for visual comparison.

### Skill Brand Metadata

The shared visual metadata for a skill label, covering its display color, Skill Brand Surface, and, when available, a logo asset.

Skill Brand Metadata can be color-only. A logo represents either the exact
brand or an intentionally documented project-family relationship. Record those
relationships in mappings and tests, and retain verifiable upstream provenance
for locally held artwork. Consumers must decide whether color alone is meaningful
for their UI instead of assuming every branded skill has a logo.

### Skill Brand Surface

The provenance-backed decision that a skill presentation may use branded chrome or should keep neutral chrome independently of whether it displays a logo.

Skill Brand Surface keeps artwork approval and background-color approval as separate decisions. Shared metadata owns the default surface, while a consumer may override it for a specific presentation context without changing that default.

### Skill Avatar

A compact skill logo or initials fallback that presents Skill Brand Metadata inside an Astryx Avatar while letting each surface choose its own design-system size.

### Skill Category Badge Variant

A theme-safe visual category color for a skill category, derived from the category label by mapping it onto approved Astryx Badge variants rather than arbitrary raw colors.

Skill Category Badge Variants distinguish grouping labels without implying status, severity, or completion.

## Tooling Workflow

### Astryx Managed Agent Context

The version-matched Astryx guidance embedded in an app's agent instructions as
a generated baseline while reviewed repository-specific guidance remains
handwritten alongside it.

An Astryx Managed Agent Context is current only when its generated content
matches a fresh installed-tool result and its boundary markers remain operative
top-level Markdown; refreshing it must preserve the surrounding handwritten
contract.

### pnpm Build Approval

The workspace-level record of which dependency install scripts are allowed to run under pnpm's build-script protection.

pnpm Build Approval should stay package-specific; it is not a global bypass for dependency scripts.

### Peer Check

The dependency-health gate that verifies installed packages satisfy declared peer dependency ranges before branch completion.

### Linked Worktree Verification

The workflow for validating an isolated feature worktree while using a dependency installation that can execute the repo's local tooling.

Linked Worktree Verification keeps feature changes out of the main checkout while ensuring tests, builds, and previews still execute the worktree's source files.
