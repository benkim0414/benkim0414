# Skill Experience Narrative Design

Date: 2026-08-26

## Summary

Add a first-class, reusable experience model to the `github.io` portfolio app
so skill detail pages can show concrete work narratives such as building a
multi-stage CI/CD pipeline with AWS CodePipeline and CodeBuild. The skill detail
page should render each selected experience as a text-heavy Astryx Card because
each entry is a self-contained accomplishment story, while other components can
reuse the same canonical record as compact rows, tokens, search results, or
future links.

Astryx remains authoritative for component anatomy, styling, spacing,
typography, and layout. Material Design 3 is supporting guidance: lists are for
scannable indexes, while cards are appropriate for content about one subject.

## Goals

- Model experience as durable portfolio content that can be added over time.
- Let skill detail pages show rich, text-first experience stories.
- Keep relationships explicit through stable IDs instead of deriving links from
  display labels, technology names, or summaries.
- Support future reuse from project pages, DORA capability views, search
  results, timelines, and future experience detail routes.
- Preserve public-safe validation for portfolio content.
- Keep the current skill list and existing compact DORA evidence projections
  stable unless a future implementation plan explicitly changes them.

## Non-Goals

- Do not build a full experience detail route in the first implementation.
- Do not replace all existing DORA `CapabilityEvidenceItem` records.
- Do not migrate every current evidence item into the new experience catalog in
  one pass.
- Do not invent new private project claims, URLs, organization names, account
  names, or architecture identifiers.
- Do not add a CMS, markdown pipeline, database, or remote content source.
- Do not make every skill detail page look enriched when no public authored
  experience exists.

## Data Model

Create a canonical `Experience` catalog owned outside the skill detail record.
Each record represents one public-safe accomplishment narrative.

```ts
export interface ExperiencePeriod {
  readonly startedAt: string;
  readonly endedAt?: string;
}

export interface ExperienceEnvironment {
  readonly label: string;
}

export interface Experience {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly narrative: readonly string[];
  readonly role?: string;
  readonly organization?: string;
  readonly period?: ExperiencePeriod;
  readonly environments?: readonly ExperienceEnvironment[];
  readonly skillIds: readonly string[];
  readonly projectIds: readonly string[];
  readonly capabilityKeys: readonly DoraCapabilityKey[];
  readonly technologies: readonly string[];
  readonly supportingEvidenceIds?: readonly string[];
  readonly proofUrl?: string;
  readonly isPublic: boolean;
  readonly isSensitive?: boolean;
}
```

`summary` is the one-sentence public synopsis. `narrative` is the text-heavy
body, authored as short paragraphs. This keeps the same record usable in compact
surfaces and detail surfaces without forcing every consumer to parse one long
string.

`skillIds`, `projectIds`, `capabilityKeys`, `technologies`, and
`supportingEvidenceIds` are explicit relationships. The app must not infer that
an experience belongs to a skill merely because the skill name appears in the
summary or technology list.

The first production record should be an AWS CI/CD pipeline experience. Its
content should describe building CodePipeline and CodeBuild automation for
multi-stage delivery such as staging and production, including build/test gates,
artifact handoff, environment separation, approvals or promotion where
public-safe, and deployment reliability. It must avoid private repository,
account, service, organization, URL, and environment identifiers.

## Skill Detail Relationship

Extend `SkillDetailRecord` from direct evidence-only enrichment to authored
experience selection:

```ts
export interface SkillDetailRecord {
  readonly skillId: string;
  readonly experienceIds: readonly string[];
  readonly experienceEvidenceIds: readonly string[];
  readonly projectIds: readonly string[];
}
```

`experienceIds` controls the new narrative card section. Existing
`experienceEvidenceIds` may stay temporarily for backward compatibility with the
current blockquote evidence section, but new skill detail enrichment should use
`experienceIds`. A later cleanup may remove the old field once every intended
surface has moved to canonical experience records.

Known skills without a detail record, or without experience IDs, continue to
render the basic skill detail page without placeholder headings.

## Resolver Contract

Extend the pure skill detail resolver so it accepts an `experiences` collection
and returns ordered `experiences` in the resolved detail view model.

Validation rules:

- Reject duplicate skill detail records for the same `skillId`.
- Reject duplicate experience source IDs.
- Reject missing experience references.
- Reject non-public or sensitive experience references.
- Reject experience records whose `skillIds` do not include the resolved skill.
- Preserve the author-provided order from `experienceIds`.
- Continue validating existing evidence and project references.

The resolver should stay pure and deterministic. It should not read route state,
global modules, or current dates while resolving.

## Skill Detail Presentation

Add an `ExperienceCardList` or similarly scoped component for the new narrative
section. On `SkillDetailPage`, render it under a concise `Experience` or
`Applied experience` heading when resolved experiences exist.

Each experience should render as one Astryx Card because the content is a
self-contained story about a single accomplishment, not a dense index row.

Recommended component structure:

- Astryx `Card` as the outer story container.
- Astryx `VStack` for internal text rhythm.
- Astryx `Heading level={3}` for the experience title.
- Astryx `Text` for the summary and narrative paragraphs.
- Astryx `MetadataList` for compact facts such as role, period, environments,
  and related project when those fields exist.
- Astryx `Token` for short technology or capability labels.
- Existing Astryx link/navigation primitives if `proofUrl` or a future detail
  route is exposed.

Cards must not be nested. The section itself should be normal page structure,
not another Card. Avoid `Badge` decoration; use `Token` for associated metadata
such as technologies, and reserve badge-like UI for counts or enumerated states
when Astryx guidance calls for it.

Text should remain readable and scannable:

- Keep paragraphs short.
- Use summary first, then narrative.
- Use supporting text only for secondary metadata, not for the main story.
- Do not use display typography inside the cards.
- Let Astryx spacing and type tokens own the rhythm.

## Reuse In Other Surfaces

The canonical experience record supports multiple projections:

- Skill detail: narrative Card.
- Project detail or project card extension: compact linked summary.
- DORA capability views: evidence-backed compact row or token projection.
- Global search: result item with title, summary, and matched skills.
- Future timeline: date-bucketed `Experience` projection.
- Future `/experience/:experienceId`: full detail page using the same record.

Each projection should accept `Experience` or a small derived view model. No
consumer should duplicate the narrative body or create private local summaries
unless the projection has a tested, explicit formatter.

## Astryx And MD3 Guidance

Official Astryx guidance checked during design:

- `pnpm exec astryx docs principles`
- `pnpm exec astryx docs layout`
- `pnpm exec astryx docs typography`
- `pnpm exec astryx search "timeline experience evidence list skill detail"`
- `pnpm exec astryx component List`
- `pnpm exec astryx component ListItem`
- `pnpm exec astryx component Blockquote`
- `pnpm exec astryx component Token`

Astryx findings:

- Use components before raw primitives.
- Use semantic tokens and component props before custom styling.
- Dense scannable data belongs in rows; cards are for self-contained widgets,
  galleries, settings groups, or genuinely framed tools.
- Avoid wrapping every list item in cards.
- Use semantic typography through `Heading` and `Text`.
- Use `Token` for small associated metadata.

Material Design 3 research checked during design:

- M3 Lists: lists help people find a specific item and act on it; they are
  continuous vertical indexes.
- M3 Cards: cards display content and actions about a single subject.
- M3 Chips: chips help with information entry, selection, filtering, or actions.

Applied decision: skill detail experience narratives are card-worthy because
each record is a single authored accomplishment. Compact search, capability,
and project projections should prefer rows or tokens because those surfaces are
for scanning.

## Accessibility And Responsive Behavior

The experience section should preserve a normal heading hierarchy:

- Skill page heading remains level 1.
- Experience section heading is level 2.
- Each experience title is level 3.

Narrative cards are non-interactive unless they expose a single clear link. Do
not place multiple nested interactive targets inside a clickable card. If a
future card links to an experience detail page, supporting proof links should be
separate non-nested links in the card body rather than inside an invisible card
anchor.

On phones, cards stack full-width within the existing content column. On tablet
and desktop, preserve the current readable detail-page column rather than
turning narratives into a wide dashboard grid. Tokens and metadata values must
wrap without clipping, overlapping, or causing horizontal overflow.

## Testing And Validation

Add focused tests for:

- Experience source records are public-safe and have stable unique IDs.
- Every `skillIds` reference points to an existing skill.
- Every `projectIds` reference points to an existing project.
- Every `supportingEvidenceIds` reference points to existing public,
  non-sensitive evidence.
- Skill detail resolver preserves `experienceIds` order.
- Skill detail resolver rejects missing, duplicate, private, sensitive, or
  cross-skill experience references.
- Skill detail page renders the experience section only when experiences exist.
- Experience cards render title, summary, narrative paragraphs, metadata, and
  tokens without replacing the existing metadata card or projects section.

Expected verification for implementation:

```bash
pnpm nx test github.io src/app/skills/skill-detail-resolver.spec.ts
pnpm nx test github.io src/app/skills/skill-detail-page.spec.tsx
pnpm nx test github.io src/app/experience
pnpm nx lint github.io
pnpm nx test github.io
pnpm nx build github.io
```

Storybook or browser visual checks should inspect the enriched skill detail page
at phone, tablet, and desktop widths. Confirm text wrapping, card rhythm,
metadata wrapping, token wrapping, light and dark mode contrast, and absence of
horizontal overflow.

## Out Of Scope For First Implementation

- Experience routing and standalone detail pages.
- Editing controls or authoring UI.
- Search integration.
- Project page integration.
- DORA score recalculation.
- Automatic generation of narratives from evidence.
- Broad migration of all DORA evidence into experiences.
- New dependencies or design-system overrides.
