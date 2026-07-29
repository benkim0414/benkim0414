# Re-add Capability Evidence Design

## Goal

Re-add the compact `CapabilityEvidence` renderer for the `github.io` DORA
capability evidence model. The renderer should show each
`CapabilityEvidenceItem` as either a compact token or a citation, depending on
the evidence type.

This restores the previously deleted compact evidence surface without restoring
the larger deleted DORA visualizations.

## Context

The `571abd2 refactor(github.io): keep evidence radar only` commit removed the
compact capability evidence files alongside other visualization components. The
current app still keeps the underlying evidence model, curated radar data, radar
component, `SkillToken`, `CertificationCitation`, and the `label?: string`
field on `CapabilityEvidenceItem`.

Historical design and implementation notes show the intended compact model:

- skills render as skill-like tokens;
- learning, experience, and education render as compact tokens;
- certifications render as citations;
- projects render as citations because public repository links are proof
  artifacts;
- short labels and brand/source icons keep the compact UI readable.

## Scope

In scope:

- Re-add `CapabilityEvidence` as a thin dispatcher component.
- Re-add type-specific leaf renderers for every current `EvidenceType`.
- Re-add compact label, icon, and GitHub repository URL helpers.
- Reuse existing `SkillToken` for `skill` evidence.
- Reuse existing `CertificationCitation` for `certification` evidence.
- Render public project evidence as an Astryx `Citation`.
- Restore focused unit tests and Storybook coverage for the compact renderer.
- Keep the existing radar component and scoring utilities unchanged unless a
  type compatibility issue requires a small import or test update.

Out of scope:

- Re-adding the deleted matrix, timeline, donut, bar list, or certification map
  visualizations.
- Changing DORA score calculation or curated radar scores.
- Changing public or sensitive evidence filtering rules.
- Adding full evidence cards, modals, summaries, or a generic evidence system
  outside the DevOps capability evidence model.
- Adding new evidence types.

## Component Design

`CapabilityEvidence` should accept one evidence item and an optional citation
number:

```ts
interface CapabilityEvidenceProps {
  evidence: CapabilityEvidenceItem;
  citationNumber?: number;
}
```

It switches on `evidence.type` and delegates to focused leaf components:

| Evidence type | Renderer | Primitive |
| --- | --- | --- |
| `skill` | `SkillEvidenceToken` | existing `SkillToken` |
| `learning` | `LearningEvidenceToken` | Astryx `Token` |
| `experience` | `ExperienceEvidenceToken` | Astryx `Token` |
| `education` | `EducationEvidenceToken` | Astryx `Token` |
| `certification` | `CertificationEvidenceCitation` | existing `CertificationCitation` |
| `project` | `ProjectEvidenceCitation` | Astryx `Citation` |

The dispatcher stays presentational. It should not score, filter, summarize, or
decide whether evidence is safe to render. Callers remain responsible for
passing public-safe evidence, using existing utilities such as
`getPublicCapabilityEvidence()` where needed.

## Label Rules

Re-add a helper such as `getCapabilityEvidenceLabel(evidence)`.

Label precedence:

1. `evidence.label`
2. first known branded technology from `evidence.technologies`
3. GitHub repository name for project evidence with a repository `proofUrl`
4. `evidence.title` when short enough
5. a shortened title fallback when the title is too long for compact display

The helper should preserve the existing purpose of `label?: string`: long,
descriptive evidence titles remain useful in the data model, while compact
tokens and citations display short aliases such as `Kubernetes`, `CKA`,
`CI/CD workflow`, or `DevOps roadmap`.

## Icon Rules

Re-add icon selection as a narrow helper so renderer components do not duplicate
brand and fallback logic.

Icon precedence:

1. known technology brand icon from `evidence.technologies` where appropriate;
2. GitHub source brand icon for project evidence whose `proofUrl` is a GitHub
   repository URL;
3. type-specific fallback icon rendered through Astryx `Icon`;
4. no icon if no clean icon is available.

The fallback icons should continue using `@heroicons/react` through Astryx
`Icon`; that dependency is already present in `package.json`.

Recommended fallback mapping:

| Evidence type | Fallback icon |
| --- | --- |
| `learning` | `BookOpenIcon` |
| `experience` | `BriefcaseIcon` |
| `education` | `AcademicCapIcon` |
| `certification` | `CheckBadgeIcon` |
| `project` | `CodeBracketIcon` |

Skill evidence can rely on `SkillToken` for its own branded rendering.

## URL Rules

Re-add a GitHub repository URL helper that recognizes only public repository
URLs shaped like `https://github.com/<owner>/<repo>` or
`https://www.github.com/<owner>/<repo>`.

The helper should not treat GitHub profiles, issues, pull requests, GitHub Pages
URLs, or reserved GitHub routes as repository proof. When a repository URL is
recognized, expose the repository name for compact project labels and allow the
GitHub brand icon fallback.

Invalid URLs should fail closed and return no repository match.

## Accessibility And Styling

- Use Astryx primitives for token and citation rendering.
- Use StyleX only for narrow layout overrides around compact renderer output.
- Keep icons decorative because the visible token or citation label carries the
  meaning.
- Add accessible grouping labels where a primitive's visible text does not
  identify the evidence type, for example `Project evidence: DevOps roadmap`.
- Preserve `CertificationCitation` status behavior for evidence with
  `endDate`; omit status text when no expiration date exists.
- Do not add global CSS.

## Storybook

Re-add a Storybook file for the compact renderer with focused examples:

- each evidence type;
- mixed evidence row;
- technology brand icon precedence;
- GitHub repository project citation;
- certification with and without expiry;
- long-title shortening fallback.

The story should follow existing `github.io` Storybook conventions and avoid
reintroducing the deleted non-radar visualization stories.

## Tests

Add or restore focused tests for:

- dispatcher behavior for every current `EvidenceType`;
- skill evidence reusing `SkillToken`;
- learning, experience, and education rendering as compact tokens;
- linked token evidence using `proofUrl`;
- certification evidence reusing `CertificationCitation`;
- project evidence rendering as a citation with `proofUrl`;
- label precedence and title shortening;
- known technology brand icons;
- GitHub repository URL detection and label extraction;
- fallback icons through Astryx `Icon`;
- renderer behavior when evidence is not public, proving privacy filtering is
  outside the component.

Focused verification commands:

```bash
pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx \
  apps/github.io/src/app/certifications/certification-citation.spec.tsx \
  apps/github.io/src/app/skills/skill-token.spec.tsx
```

Final app checks, when feasible:

```bash
pnpm nx test github.io
pnpm nx build github.io
```

## Risks

- Restoring too much deleted code could undo the radar-only cleanup. Mitigation:
  restore only `capability-evidence.*` files and their focused stories/tests.
- Current Astryx primitives or tests may have drifted since deletion.
  Mitigation: restore from history, then make minimal compatibility edits.
- Compact labels can become noisy if evidence data relies on long titles.
  Mitigation: keep `label?: string` as the preferred compact-display field and
  keep the title shortening fallback.

## Acceptance Criteria

- `CapabilityEvidence` can render every current `EvidenceType`.
- Token evidence and citation evidence match the token/citation model described
  above.
- Existing radar files remain functionally unchanged.
- No deleted non-radar visualization is reintroduced.
- Focused unit tests pass, or any environment failure is documented exactly.
