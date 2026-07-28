# Capability Evidence Compact Design

## Goal

Create a reusable compact React component family for rendering one
`CapabilityEvidenceItem` from the `github.io` DevOps capability evidence model.
The component should represent the exact evidence item according to its evidence
type while staying small enough to use inside charts, timelines, maps, lists,
and portfolio sections.

This design is compact-only. It does not add a full evidence card, modal,
summary view, or expanded detail surface.

## Scope

In scope:

- Add a compact `CapabilityEvidence` dispatcher component.
- Add one reusable leaf component for each `EvidenceType`.
- Reuse existing `SkillToken` for skill evidence.
- Reuse existing `CertificationCitation` for certification evidence.
- Render project evidence as a citation because public repository links are
  proof artifacts.
- Add compact labels so tokens and citations do not render long descriptive
  evidence titles.
- Add evidence icon rules that prefer skill and source-specific icons before
  generic type icons.
- Add focused tests and Storybook stories for the compact renderer.

Out of scope:

- Adding full evidence cards or summaries.
- Changing evidence scoring or public-safety filtering rules.
- Filtering private or sensitive evidence inside the compact component.
- Adding support for non-DevOps evidence data shapes.
- Adding source-brand detection beyond GitHub repository URLs.
- Replacing existing skill or certification components.

## Data Model

Use `CapabilityEvidenceItem` directly as the component input. The compact
component should not introduce a generic evidence abstraction until another
consumer outside the DevOps capability evidence model needs one.

Add an optional compact display label:

```ts
interface CapabilityEvidenceItem {
  label?: string;
}
```

`title` remains the canonical descriptive evidence title. Compact components
render `label` or a short derived label instead of rendering long titles inside
`Token` or `Citation`.

Recommended label resolution:

1. `evidence.label` when provided.
2. Known skill or technology label derived from `evidence.technologies`.
3. A concise project or credential alias derived by a type-specific component.
4. `evidence.title` only when it is already short enough for compact display.

Long descriptive titles should stay in evidence data but should not become
token or citation text. Examples:

- `Certified Kubernetes Administrator issued by the Cloud Native Computing Foundation`
  should render as `CKA` or `Kubernetes`.
- `CI/CD workflow ownership for a four-developer product team` should render as
  `CI/CD workflow`.
- `Kubernetes operations learning path covering workloads, services,
  troubleshooting, kubectl workflows, and cluster operations` should render as
  `Kubernetes`.
- `DevOps roadmap portfolio project with React, TypeScript, Nx, and GitHub
  Pages` should render as `DevOps roadmap` or the repository name.
- `Bachelor of Computer Science from University of Example` should render as
  `Computer Science` or `University of Example`.
- `GitHub Actions deployment automation project using Docker and GitHub Pages`
  should render as `GitHub Actions` or the repository name.

## Components

### CapabilityEvidence

`CapabilityEvidence` is a thin dispatcher:

```ts
interface CapabilityEvidenceProps {
  evidence: CapabilityEvidenceItem;
  citationNumber?: number;
}
```

It switches on `evidence.type` and delegates rendering to a type-specific leaf
component. It should not score evidence, filter evidence, summarize evidence, or
decide whether an item is public-safe.

Callers must pass public-safe evidence. Existing utilities such as
`getPublicCapabilityEvidence()` remain responsible for privacy filtering.

### Leaf Components

Each leaf component accepts the full `CapabilityEvidenceItem` even if it only
uses a subset of fields. This keeps the APIs uniform and allows type-specific
display logic to grow without changing the dispatcher boundary.

| Type | Component | Primitive |
| --- | --- | --- |
| `skill` | `SkillEvidenceToken` | existing `SkillToken` |
| `learning` | `LearningEvidenceToken` | Astryx `Token` |
| `experience` | `ExperienceEvidenceToken` | Astryx `Token` |
| `education` | `EducationEvidenceToken` | Astryx `Token` |
| `certification` | `CertificationEvidenceCitation` | existing `CertificationCitation` |
| `project` | `ProjectEvidenceCitation` | Astryx `Citation` |

Tokens represent capability attributes or activities. Citations represent
externally inspectable proof artifacts. That is why certifications and public
repository projects render as citations, while learning, experience, and
education render as tokens.

### Certification Reuse

`CertificationEvidenceCitation` should adapt `CapabilityEvidenceItem` into the
existing `CertificationCitation` component instead of duplicating citation
logic.

The current certification component expects fields that are optional or missing
in `CapabilityEvidenceItem`. Relax `CertificationCitation` so it can support
both the current skill-carousel certification use case and the evidence model:

- `url?: string`
- `skills?: readonly string[]`
- `expiresAt?: string`

When `expiresAt` is present, keep the current active and expired status
behavior. When `expiresAt` is absent, omit the active or expired status text.
When `url` is absent, render the underlying citation as an unlinked label.

## Icons

Use Astryx `Icon` as the rendering wrapper for non-brand icons. The Astryx
semantic registry does not currently include suitable school, book, briefcase,
certificate, repository, or code icons, so add `@heroicons/react` and use the
24 outline set through Astryx `Icon`.

Recommended fallback icons:

| Evidence type | Heroicon |
| --- | --- |
| `learning` | `BookOpenIcon` |
| `experience` | `BriefcaseIcon` |
| `education` | `AcademicCapIcon` |
| `certification` | `CheckBadgeIcon` |
| `project` | `CodeBracketIcon` |

Render fallback icons like this:

```tsx
<Icon icon={BookOpenIcon} size="sm" color="inherit" />
```

Icon precedence:

1. Known skill or technology brand icon from `evidence.technologies`.
2. Proof URL brand icon, starting with GitHub repository URLs for project
   evidence.
3. Evidence-type fallback icon from Heroicons.
4. No icon if the renderer cannot place one cleanly.

Technology brand icons should apply across all evidence types. Examples:

- CKA certification with `technologies: ['Kubernetes']` uses the Kubernetes
  icon.
- Kubernetes learning evidence uses the Kubernetes icon instead of the book
  fallback.
- Docker-related experience uses the Docker icon instead of the briefcase
  fallback.

For project evidence, detect GitHub repository URLs in `proofUrl` and use the
GitHub logo when no stronger technology brand icon is available. The initial
detector should match `github.com/<owner>/<repo>` and should not treat GitHub
profiles, issues, pull requests, or GitHub Pages URLs as repository evidence.

Centralize icon selection in a helper such as:

```ts
getCapabilityEvidenceIcon(evidence)
```

The helper should return the information needed by a leaf component to render a
brand icon, a source URL brand icon, or a Heroicons fallback through Astryx
`Icon`.

## Styling And Accessibility

- Start from Astryx primitives and preserve their built-in sizing,
  interaction, truncation, and accessible behavior.
- Use StyleX only for narrow component-specific overrides.
- Keep Tailwind utilities limited to wrapper layout in consumers.
- Do not add global CSS for compact evidence components.
- Icons are decorative because the visible compact label carries the evidence
  meaning.
- Add accessible labels when the primitive's visible text is not enough to
  distinguish the evidence type, for example `Project evidence: DevOps
  roadmap`.
- Long labels should be avoided by data design. The component may still rely on
  Astryx `Token` and `Citation` truncation if an unexpectedly long label is
  passed.

## Data Flow

```ts
CapabilityEvidenceItem
  -> CapabilityEvidence
  -> type-specific evidence component
  -> compact label and icon helpers
  -> Astryx primitive
```

The component family is a renderer, not a data policy layer. Evidence filtering
and scoring remain in the existing DevOps capability evidence utilities.

## Validation

Add focused unit tests for:

- `CapabilityEvidence` dispatches each evidence type to the expected leaf
  component.
- `SkillEvidenceToken` reuses the existing skill token path.
- `CertificationEvidenceCitation` reuses `CertificationCitation`.
- `ProjectEvidenceCitation` renders as a citation and uses `proofUrl` when
  provided.
- Linked token evidence renders a token link when `proofUrl` exists.
- Compact labels prefer `label` over derived labels and avoid long `title`
  display when a short label is available.
- Known technology brand icons beat type fallback icons.
- GitHub repository URLs beat the generic project fallback when no technology
  brand icon exists.
- Type fallback icons render through Astryx `Icon`.
- `CertificationCitation` still renders active or expired status when
  `expiresAt` exists and omits status text when it does not.
- `CapabilityEvidence` renders provided evidence without privacy filtering.

Add Storybook stories for:

- each evidence type in isolation
- known technology icon precedence
- GitHub repository project citation
- certification evidence with and without expiry
- a mixed compact evidence row

## Risks And Mitigations

- Long evidence titles can make compact UI noisy. Mitigate with the optional
  `label` field and a compact-label helper.
- Adding an icon library can drift from Astryx visuals. Mitigate by using
  Heroicons 24 outline through Astryx `Icon`, matching Astryx's current icon
  integration pattern.
- Certification citation reuse can be blocked by required props that are not
  present in `CapabilityEvidenceItem`. Mitigate by relaxing optional props while
  preserving current behavior when those props are supplied.
- GitHub URL detection can over-classify project links. Mitigate by only
  matching repository-shaped GitHub URLs initially.

## Handoff Criteria

Implementation is ready for handoff when:

- The compact evidence components are implemented.
- `CertificationCitation` remains backward compatible with existing callers.
- Heroicons are added and rendered through Astryx `Icon`.
- Component tests and Storybook stories cover the evidence type matrix.
- Focused `github.io` test and build commands pass or any unrelated failures are
  documented.
