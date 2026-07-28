# Concepts

Shared domain vocabulary for this project -- entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## GitHub Pages Site

### github.io App

The static React application that will become the root GitHub Pages user site for this repository owner.

### App Shell

The generic first-screen layout scaffold for the `github.io` App: navigation, content regions, and footer without real portfolio content.

### DevOps Roadmap

The `github.io` App visualization that adapts roadmap.sh DevOps topics into a static, skill-filtered timeline for the portfolio.

DevOps Roadmap items carry a topic title, the owner's matching skills, and optional certification evidence; it is a presentation of portfolio coverage, not a full roadmap.sh clone.

### DevOps Capability Evidence

The public portfolio model that connects LinkedIn-style proof, such as skills, learning, experience, education, certifications, and projects, to DevOps capability dimensions.

DevOps Capability Evidence is a public projection: it can summarize private work, but shipped entries must be safe to render on the public `github.io` App and skills should be backed by separate non-skill proof.

## Design System

### Astryx Foundation

The shared UI baseline for the `github.io` App, covering Astryx reset styles, neutral theme assets, and the root theme wrapper.

Astryx Foundation means new UI work should prefer Astryx components and tokens before introducing local visual primitives.

### Astryx Styling Boundary

The styling rule for the `github.io` App: Astryx components define component anatomy, StyleX and supported third-party theming surfaces handle component-specific overrides with Astryx token aliases, Tailwind handles wrapper and utility layout, and scoped CSS handles generated internals.

Astryx Styling Boundary keeps local visual fixes from replacing Astryx component semantics or drifting from Astryx spacing, radius, and color guidance.

### Certification Citation

A reusable certification link presentation that uses Astryx Citation styling while deriving status and visual accents from the certification's linked skills.

Certification Citation distinguishes brand color from skill logo availability: linked skills can provide a logo-backed icon, a color-only accent, or no brand metadata.

### Skill Card

A reusable card presentation for one skill, showing the skill name, supporting description, and optional certification evidence as one independently comparable item.

### Skill Carousel

A horizontal skills presentation where each Skill Card remains content-driven on its own, while carousel layout equalizes sibling card heights for visual comparison.

### Skill Brand Metadata

The shared visual metadata for a skill label, covering the skill's brand color and, when available, a logo asset.

Skill Brand Metadata can be color-only. Consumers must decide whether color alone is meaningful for their UI instead of assuming every branded skill has a logo.

## Tooling Workflow

### pnpm Build Approval

The workspace-level record of which dependency install scripts are allowed to run under pnpm's build-script protection.

pnpm Build Approval should stay package-specific; it is not a global bypass for dependency scripts.

### Peer Check

The dependency-health gate that verifies installed packages satisfy declared peer dependency ranges before branch completion.
