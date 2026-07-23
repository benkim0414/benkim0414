# Certification Citations Design

## Goal

Add certification citations to the DevOps roadmap while keeping the certification UI reusable outside roadmap nodes.

The Container Orchestration roadmap node should show Kubernetes certifications on a new line below the existing Kubernetes skill token. Each certification should use Astryx `Citation` in the label/source-list style, link to the certificate PDF URL, show a Kubernetes icon, and visually distinguish active certifications from expired certifications.

## Context

The `github.io` app already has a DevOps roadmap component under `apps/github.io/src/app/devops-roadmap/`. Roadmap items currently store only `skills: string[]`, and `DevOpsRoadmapNode` renders those skills with the reusable `SkillToken` component.

Astryx `Citation` supports:

- `variant="label"` for a label citation chip.
- `source.title` for visible citation text.
- `source.url` for linked citations.
- `source.icon` for an image URL rendered before the citation label.
- `number` for the citation index and accessible citation label.

The existing `SkillToken` implementation already maps known skill names to Simple Icons and brand colors. Certification citations should reuse that skill-brand knowledge rather than duplicating icon/color lookup logic in the roadmap.

## Recommended Approach

Create a reusable `CertificationCitation` component under `apps/github.io/src/app/certifications/`, then let roadmap nodes render it when an item has certifications.

This keeps certification UI concerns out of `DevOpsRoadmapNode`, while still allowing roadmap data to link certifications to one or more skills.

## Data Model

Add a reusable certification type:

```ts
export interface Certification {
  title: string;
  url: string;
  skills: readonly string[];
  expiresAt: string;
}
```

`expiresAt` should be a full ISO 8601 date-time string with a timezone offset. This prevents active/expired status from changing based on the browser's local timezone. The supplied expiry times are treated as Australia/Melbourne local times.

Update roadmap items to optionally include certifications:

```ts
export interface DevOpsRoadmapItem {
  id: string;
  title: string;
  skills: readonly string[];
  certifications?: readonly Certification[];
}
```

The three Container Orchestration certifications should be:

```ts
certifications: [
  {
    title: 'CKA',
    skills: ['Kubernetes'],
    expiresAt: '2027-04-20T10:00:00+10:00',
    url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-02c68021-40fe-473f-8087-6309221395ca-certificate.pdf',
  },
  {
    title: 'CKAD',
    skills: ['Kubernetes'],
    expiresAt: '2028-02-25T11:00:00+11:00',
    url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-83c53ec1-bf5d-4b01-ae0a-c79be21d7cf2-certificate.pdf',
  },
  {
    title: 'KCNA',
    skills: ['Kubernetes'],
    expiresAt: '2028-02-26T10:59:00+11:00',
    url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-8a295e12-57c5-4008-b8ba-171b09419221-certificate.pdf',
  },
]
```

`skills` is an array because a certification can cover multiple technologies. For visual treatment, `CertificationCitation` should use the first linked skill with known brand metadata as the primary icon and color. If none of the linked skills has brand metadata, it should fall back to the default Astryx citation appearance.

## Component Design

Create `CertificationCitation` with props that are not roadmap-specific:

```ts
export interface CertificationCitationProps {
  title: string;
  url: string;
  skills: readonly string[];
  expiresAt: string;
  number?: number;
  currentDate?: Date;
}
```

Behavior:

- Render Astryx `Citation` with `variant="label"`.
- Pass `source.title = title`.
- Pass `source.url = url`.
- Pass `source.icon` from the primary linked skill logo when available.
- Use `number ?? 1` as the citation number.
- Derive active versus expired from `expiresAt` and `currentDate ?? new Date()`.
- Add stable classes/data attributes for styling and tests:
  - `.certification-citation`
  - `.certification-citation--active`
  - `.certification-citation--expired`
  - `.certification-citation--branded` only when a primary skill brand is found
  - `data-certification-status="active" | "expired"`
  - `data-certification-primary-skill="<skill>"`

`currentDate` exists only to make expiry behavior deterministic in tests and stories. Normal app usage should omit it.

## Skill Brand Lookup

Extract the Simple Icons skill lookup from `SkillToken` into a small shared helper module, for example:

```ts
getSkillBrand(skill: string): {
  name: string;
  color: string;
  iconPath: string;
  iconDataUrl: string;
} | undefined
```

`SkillToken` should keep its current public API and use the helper internally. `CertificationCitation` should use the same helper to find its primary linked skill.

The Citation component expects `source.icon` to be an image URL. Because Simple Icons are SVG paths, the helper should expose a safe SVG data URL for the selected icon. The displayed Citation icon can use the SVG data URL, while brand color styling comes from CSS variables on the wrapper.

## Roadmap Rendering

`DevOpsRoadmapNode` should render certifications below skills, on a separate line:

```tsx
{item.certifications?.length ? (
  <ul
    className="devops-roadmap-node__certifications"
    aria-label={`${item.title} certifications`}
  >
    {item.certifications.map((certification, index) => (
      <li className="devops-roadmap-node__certification" key={certification.title}>
        <CertificationCitation {...certification} number={index + 1} />
      </li>
    ))}
  </ul>
) : null}
```

The roadmap should not compute expiry, icons, colors, or Citation source objects. Its responsibility is only to place certification citations in the node.

## Visual Design

Active certifications:

- Keep the default Astryx Citation surface and border treatment.
- Use the primary skill brand color for citation text.
- Use the primary skill icon filled with the same brand color.

Expired certifications:

- Keep the default Astryx Citation colors.
- Do not apply branded citation text or surface styles.
- Show the primary skill icon when available, filled with the default Citation text color.

**Superseding user decision:** Certifications wrap naturally within the roadmap node using normal flex wrapping; there is no items-per-row setting. When a node has at least one certification, its roadmap height estimate reserves one fixed certification-section allowance.

## Accessibility

Each certification remains a normal linked Astryx `Citation`, so external certificate PDFs open in a new tab via Astryx behavior.

The visible label should be the certification title, such as `CKA`, `CKAD`, or `KCNA`. The status should be represented by visual style and stable data attributes; do not add noisy visible status text inside the compact roadmap node unless future UX requires it.

Add a visually hidden status phrase next to the citation, for example `Active certification` or `Expired certification`, so status is not purely visual. Tests should assert accessible link names through the Citation label, link URLs, hidden status text, and active/expired status attributes.

## Testing

Add focused tests for:

- `CertificationCitation` renders an Astryx label citation link.
- It uses the first known linked skill as the primary brand.
- It handles multiple linked skills by choosing the first known skill.
- It marks future `expiresAt` values as active.
- It marks past `expiresAt` values as expired.
- It falls back gracefully when no linked skill has known brand metadata.
- `DevOpsRoadmapNode` renders certification citations below skills.
- The Container Orchestration default data includes CKA, CKAD, and KCNA.
- Timeline height remains stable when nodes include a certification section.

## Out Of Scope

- No certificate verification API calls.
- No runtime PDF parsing.
- No filtering UI for certifications.
- No visible expiry date text in roadmap nodes.
- No new page or route for certifications.
- No push, deploy, or PR in this brainstorming step.

## Risks

- Astryx `Citation` accepts `source.icon` as an image URL, so using Simple Icons requires a data URL conversion rather than passing React SVG directly.
- Expiry data depends on the source timezone being correct. This spec assumes the provided expiry times are Australia/Melbourne local times.
- If many certifications are added to a single node, React Flow height estimation must be updated or nodes may overlap.
