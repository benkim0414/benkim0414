# DORA Kubernetes Certification Evidence Design

## Goal

Add the user's KCNA, CKA, and CKAD credentials to the DORA capability cards
where each credential provides strong, direct evidence. Each applicable card
shows a visible **Certifications** row after **Relevant experience** and before
**Technical skills**. The DORA cards reuse the same concrete credential facts,
badge artwork, proof links, lifecycle status, and metadata already shown for
the Kubernetes skill.

## Current State

The shared DORA card renderer already groups certification evidence between
the `applied` and `skills` groups, but the certification group has no visible
label. Production compact projections currently select only experience and
skill evidence, so no certification row appears.

The capability evidence catalog contains one generic
`cncf-kubernetes-certification` record. That record represents no individual
credential, has no proof URL or credential metadata, and is not selected by a
production card. The Kubernetes skill separately owns concrete KCNA, CKAD, and
CKA data inline. Repeating those facts in the DORA catalog would create two
sources of truth for certificate URLs, expiry dates, credential IDs, names,
and badge artwork.

## Certification-to-Capability Mapping

Use a deliberately selective mapping based on the current official CNCF exam
scopes:

| Credential | DORA capabilities |
| --- | --- |
| KCNA | Flexible Infrastructure |
| CKA | Flexible Infrastructure; Monitoring & Observability |
| CKAD | Continuous Delivery; Deployment Automation; Monitoring & Observability |

KCNA demonstrates Kubernetes and cloud-native foundations, orchestration, and
architecture. CKA directly validates cluster administration, infrastructure,
networking, storage, and troubleshooting. CKAD directly validates application
design, deployment, operation, and observability on Kubernetes.

Do not map these credentials to Continuous Integration, Test Automation,
Pervasive Security, Trunk-Based Development, Documentation Quality, or Version
Control. Although individual exam topics may touch adjacent practices, they do
not provide sufficiently direct evidence for those capability cards. CKAD is
not a dedicated security credential, and Kubernetes deployment competence does
not by itself demonstrate a CI, testing, version-control, or documentation
practice.

Official scope references:

- [KCNA](https://www.cncf.io/training/certification/KCNA/)
- [CKA](https://www.cncf.io/training/certification/cka/)
- [CKAD](https://www.cncf.io/training/certification/ckad/)

## Shared Certification Data

Create a certification-owned type and canonical registry for the three
credentials under the existing `certifications` feature boundary. A canonical
record has a stable ID and owns:

- compact title;
- certificate URL;
- associated skills;
- expiry timestamp;
- badge image;
- credential ID;
- full credential name; and
- completion date.

The Kubernetes skill references these canonical records instead of declaring
credential facts inline. Existing consumers keep the same citation content and
order unless this design explicitly changes it.

The DORA evidence catalog adapts each canonical credential into one distinct,
public, non-sensitive `certification` evidence item. The adapter maps the
canonical proof URL, expiry timestamp, badge, Kubernetes association, and
metadata into the capability evidence contract and adds the approved DORA
capability keys. The old generic `cncf-kubernetes-certification` item is
removed; there must not be an ambiguous fourth Kubernetes certification.

`CapabilityEvidenceItem` gains optional certification metadata. The
certification rendering path forwards it to `CertificationCitation`. The
field remains optional so existing generic certification fixtures and plain
citation fallbacks remain valid.

## Curated DORA Projections

Add the relevant stable certification evidence IDs to the four affected
curated DORA score records. Within each projection, certification IDs follow
the selected experience IDs and precede skill IDs. The existing grouping
helper continues to render semantic rows in this order:

1. `applied` — **Relevant experience**;
2. `certifications` — **Certifications**;
3. `skills` — **Technical skills**; and
4. `learning`, when present.

The resulting production card content is:

| DORA capability | Certification row |
| --- | --- |
| Flexible Infrastructure | KCNA, CKA |
| Continuous Delivery | CKAD |
| Deployment Automation | CKAD |
| Monitoring & Observability | CKA, CKAD |

When a row contains multiple credentials, use credential progression order:
KCNA before CKA, and CKA before CKAD. Reusing one canonical credential across
multiple projections does not duplicate the catalog record.

Update each affected score's `evidenceCounts.certification` value and the
aggregate catalog expectations to reflect three distinct certification
records. The curated numeric capability scores do not change: this feature
changes the compact public evidence projection, not the established score
assessment.

## Presentation and Accessibility

Add `certifications: 'Certifications'` to the existing visible evidence-row
label mapping. The label uses the same Astryx supporting, secondary treatment
and label-to-list association as **Relevant experience** and **Technical
skills**. It appears only when a certification row exists.

Each item retains the existing compact `CertificationCitation` presentation:

- official credential badge;
- direct public certificate PDF link;
- credential number within its row;
- active or expired status exposed visually and accessibly; and
- the existing metadata hover card containing Name, ID, Status, and Completed.

The current wrapping row remains responsible for responsive layout. No new
card, nested container, width, spacing scale, token style, or typography
override is introduced. Cards without mapped certifications render exactly as
they do today and retain their generated accessible names for any unlabelled
evidence groups.

## Data Flow and Fallbacks

The data flow is:

1. the canonical certification registry owns credential facts;
2. the Kubernetes skill and DORA evidence adapter consume those facts;
3. curated DORA scores select relevant certification evidence IDs;
4. `getDoraCapabilityCardEvidenceRows` groups selected evidence by type;
5. `DoraCapabilityEvidenceRow` renders the visible row label; and
6. `CapabilityEvidence` forwards the concrete record to
   `CertificationCitation`.

Complete concrete credentials render the existing metadata hover card.
Missing optional metadata continues to render a plain citation. Missing proof
or lifecycle data must not manufacture status or a hover card. Missing IDs in
a curated projection continue to follow the existing selector behavior and
are omitted rather than producing an empty item. No new runtime exception or
error UI is required.

## Testing and Validation

Focused data and component tests will verify:

- the shared registry contains exactly KCNA, CKA, and CKAD with stable IDs and
  the approved public credential facts;
- the Kubernetes skill consumes the canonical records rather than maintaining
  divergent inline copies;
- the generic Kubernetes certification catalog item is removed and replaced
  by exactly three concrete public certification evidence records;
- each credential has exactly the approved capability keys;
- the four affected compact projections select the approved credentials in
  the approved order;
- unaffected capability cards contain no certification row;
- every affected card orders **Relevant experience**, **Certifications**, and
  **Technical skills** correctly;
- the visible **Certifications** label provides the accessible name for its
  list and renders only with a non-empty row;
- DORA certification citations receive their badge, proof URL, expiry value,
  and metadata; and
- generic or incomplete certification evidence preserves the plain-citation
  fallback.

Final validation will run the focused certification, skill, capability
evidence, DORA projection, DORA card, and Storybook suites, followed by:

```sh
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
```

Storybook visual review will check affected cards at phone, iPad, and desktop
widths for row-label association, citation wrapping, clipping, overlap, and
horizontal overflow. Before implementation changes to the Astryx UI, consult
the official Astryx principles, layout, typography, and relevant component
documentation required by `apps/github.io/AGENTS.md`.

## Out of Scope

- Changing curated DORA capability scores or scoring weights.
- Adding credentials other than KCNA, CKA, and CKAD.
- Mapping the credentials to weaker adjacent capabilities.
- Redesigning `CertificationCitation`, its hover card, or badge assets.
- Changing DORA card width, spacing, typography, or citation styling.
- Adding a certification section outside the existing DORA and Kubernetes
  skill surfaces.
