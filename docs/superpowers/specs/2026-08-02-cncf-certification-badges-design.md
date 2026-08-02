# CNCF Certification Badge Design

## Goal

Show the exact official badge image for each CNCF Kubernetes certification citation in the `github.io` portfolio. KCNA, CKAD, and CKA should each display their own credential badge instead of sharing the generic Kubernetes skill logo.

## Recommended Approach

Use local, checked-in badge assets and reference them explicitly from certification data.

The implementation should add official issuer-provided badge images for KCNA, CKAD, and CKA under an app-owned asset path such as `apps/github.io/src/assets/certifications/cncf/`. The images should come from official CNCF, Linux Foundation, Credly, or user-provided official badge sources, not recreated artwork. The implementation notes should record the source URL for each downloaded asset.

Each relevant `SkillCertification` entry should expose an optional image field such as `citationIcon` or `badgeImage`. `CertificationCitation` should prefer that certification-specific image over the existing skill-brand icon. If a certification does not provide a badge image, the component should keep the current behavior: derive a primary skill brand when possible, use a caller-supplied citation icon when present, and otherwise render the normal Astryx citation fallback.

## User-Facing Behavior

- The Kubernetes skill card should still list KCNA, CKAD, and CKA as certification citations.
- Each citation should use the matching official badge image:
  - KCNA uses the KCNA badge.
  - CKAD uses the CKAD badge.
  - CKA uses the CKA badge.
- Citation link targets, numbering, status text, expiry behavior, and accessibility labels should remain unchanged.
- Expired certifications may keep the current neutral citation text/status treatment, but official badge artwork should not be recolored or reconstructed.

## Architecture

Keep the boundary between skills and credentials explicit.

`skill-brand.ts` should continue to describe technology brands such as Kubernetes, Docker, and Terraform. CNCF credential badges should not be added as skill brands because they are proof artifacts, not skill identities.

`SkillCertification` should carry the optional badge image metadata because the exact visual identity belongs to the credential instance. This keeps `CertificationCitation` reusable across skill cards, roadmap nodes, and capability evidence without hard-coding specific titles into the component.

`CertificationCitation` should resolve icons in this order:

1. Certification-specific badge image from props.
2. Existing primary skill logo derived from `skills`.
3. Existing caller-provided citation icon.
4. Astryx citation fallback.

## Data Flow

The Kubernetes certification fixtures in `skill-list.data.ts` and `devops-roadmap.data.ts` should reference the same local badge asset paths for matching certification titles. Capability evidence items that render through `CertificationCitation` should receive the same badge image when representing CKA, CKAD, or KCNA evidence.

If duplication grows, the implementation may introduce a small certification badge lookup helper or constants module. That helper should map stable certification identifiers or exact titles to local image paths, but data entries should still make the chosen badge explicit at their boundary.

## Testing

Focused tests should prove:

- `CertificationCitation` prefers a certification-specific badge image over a Kubernetes skill icon.
- KCNA, CKAD, and CKA data entries include distinct badge image references.
- Existing no-logo and color-only fallback behavior still works for unrelated certifications.
- Skill card and roadmap certification citation counts, labels, links, and ordering remain unchanged.

Relevant validation commands should include focused Vitest specs for certification citations and data, plus `pnpm nx test github.io`. Run `pnpm nx lint github.io` and `pnpm nx build github.io` before handoff when implementation changes app code.

## Out Of Scope

- Replacing certificate PDF links.
- Adding new certification records.
- Changing certification ordering or expiry dates.
- Rebranding the Kubernetes skill itself.
- Recoloring, redrawing, or approximating CNCF badge artwork.

## Risks

Official badge image availability can change across CNCF, Linux Foundation, and Credly pages. Checking assets into the repo avoids runtime breakage, but the source URLs should be documented so future updates can trace provenance.

Badge artwork may be more detailed than the current simple Kubernetes icon. The implementation should verify that the small citation surface remains legible and does not shift layout in skill cards, roadmap nodes, or capability evidence rows.
