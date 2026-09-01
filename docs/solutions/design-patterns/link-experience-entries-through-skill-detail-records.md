---
title: Link Experience Entries Through Skill Detail Records
date: 2026-09-01
category: design-patterns
module: apps/github.io skills
problem_type: design_pattern
component: frontend
severity: medium
applies_when:
  - Adding new professional experience entries to the Experience catalog
  - Linking a new experience entry to skill detail records so it renders on skill detail pages
  - Extending skill-detail catalogs whose specs assert exact enrichment values
  - Adding invariant coverage that every experience is surfaced by at least one skill detail record
related_components:
  - Skill detail page
  - Skill experience cards
  - Skill detail navigation
tags:
  [
    github-io,
    skills-page,
    skill-detail,
    experience,
    skill-catalog,
    regression-test,
    content-design,
  ]
---

# Link Experience Entries Through Skill Detail Records

## Context

The github.io app grew a batch of new professional experience entries —
capability narratives written for a public-facing skills portfolio,
sanitized so no employer, internal system, or issue-tracker ticket
identifier appears in them. The naive approach was to append the new
entries to `apps/github.io/src/app/experience/experience.data.ts` and
expect them to show up wherever experience data is consumed. That approach
fails silently: nothing renders the `experiences` array directly.

Experience entries only become visible through `skillDetailRecords`
(`apps/github.io/src/app/skills/skill-detail.data.ts`), an array of records
shaped `{ skillId, experienceIds, experienceEvidenceIds, projectIds }`. The
skill detail page resolves a page's content by calling
`resolveSkillDetail(skillId, sources)`
(`apps/github.io/src/app/skills/skill-detail-resolver.ts`), which looks up
the matching record and maps `record.experienceIds` to experience objects.
If an experience is never referenced by any record's `experienceIds`, it is
inert data — never fetched, never rendered, invisible to any page.

A second friction point: `skill-detail-resolver.spec.ts` hardcodes exact,
ordered enrichment results for specific skills (`kubernetes`,
`github-actions`). Extending the catalog with new experiences that
legitimately link to those skills changes the resolver's real output, which
breaks these specs by design — they exist to force review of exactly this
kind of change rather than let it land silently.

## Guidance

Checklist for adding a new experience entry so it is both linked and
covered by the invariant tests:

1. **Add the entry to `experience.data.ts`** with the required `kind` field
   (`'professional' | 'personal'`,
   `apps/github.io/src/app/experience/experience.types.ts`) and the
   public-safety fields the guard tests check: `isPublic: true`, no
   `isSensitive`, and — for professional entries, enforced by
   `experience.data.spec.ts` — `organization` left undefined,
   `projectIds: []`, `supportingEvidenceIds` left undefined, and
   `period.startedAt` formatted as `YYYY-MM` with no `endedAt`.
2. **Resolve `skillIds` against the skill catalog.** Every id in the new
   entry's `skillIds` must exist in
   `apps/github.io/src/app/skills/skill-list.data.ts`. If a referenced
   skill is new, add it there (the exact-id-list test in
   `skill-list.data.spec.ts` must be updated too) and add its brand/icon
   mapping in `apps/github.io/src/app/skills/skill-brand.ts`.
3. **Link the entry via `skillDetailRecords` for each skill it should
   surface under.** Append the experience's id to the `experienceIds` array
   of the matching record(s) in `skill-detail.data.ts`, creating the record
   if the skill has none yet. A minimal record:

   ```ts
   {
     skillId: 'argo-cd',
     experienceIds: ['gitops-deployment-reliability'],
     experienceEvidenceIds: [],
     projectIds: [],
   }
   ```

   The resolver enforces three conditions on every id in `experienceIds` at
   resolve time (`skill-detail-resolver.ts`): the experience must exist,
   must be public and non-sensitive, and must itself declare the record's
   `skillId` in its own `skillIds` — otherwise the resolver throws rather
   than silently dropping the entry.
4. **Update the data-coupled expectations in
   `skill-detail-resolver.spec.ts`** for any skill whose resolved
   experience list changes — update the expected values, keep the
   exact/ordered `toEqual` assertion style. Do not weaken a `toEqual([...])`
   into `expect.arrayContaining([...])` to make a test pass; that erases
   the ordering and exactness guarantee the test exists to enforce.
5. **Confirm the invariants in `skill-detail.data.spec.ts` still hold.**
   That spec checks three things across the whole catalog: every record
   resolves via `resolveSkillDetail` without error; every experience is
   surfaced by at least one record's `experienceIds`; every record links
   only experiences that themselves declare the record's `skillId`. The
   coverage invariant, condensed:

   ```ts
   it('surfaces every experience through at least one skill detail record', () => {
     const linkedExperienceIds = new Set(
       skillDetailRecords.flatMap((record) => record.experienceIds),
     );

     for (const experience of experiences) {
       expect(linkedExperienceIds.has(experience.id)).toBe(true);
     }
   });
   ```

## Why This Matters

- **Invisible data vs. test failures.** Without the coverage invariant, an
  experience added to `experience.data.ts` but never wired into any
  `skillDetailRecords` entry compiles, passes type-checking, and simply
  never renders — no error, no warning. The invariant converts that silent
  gap into a failing assertion.
- **Ordered, exact assertions catch real behavior changes.**
  `skill-detail-resolver.spec.ts` asserts exact ordered lists rather than
  `arrayContaining` for the enrichment results it pins. That strictness is
  what surfaced the catalog change for review when the new experiences were
  linked — the failing test was the signal that resolver output actually
  changed, not noise to suppress.
- **Public-repo sanitization is a hard constraint.**
  `experience.data.spec.ts` runs a ticket-key regex
  (`/\b[A-Z][A-Z0-9]+-\d+\b/`) over `JSON.stringify(experience)` for every
  entry to catch issue-tracker key patterns before they land in a public
  repository. Entry provenance is described only in generic terms —
  "professional experience entries" — in code, commits, and docs alike.

## When to Apply

- Adding a new experience entry (professional or personal) to
  `experience.data.ts`.
- Adding a new skill to `skill-list.data.ts` (and, if it needs a new icon,
  to `skill-brand.ts`).
- Extending or creating `skillDetailRecords` entries to link an experience
  to one or more skills.
- Any change that alters which experiences or evidence a skill's detail
  page resolves — expect to also touch `skill-detail-resolver.spec.ts`'s
  expected values for that skill.

## Examples

Concrete before/after from linking the professional entries.

**kubernetes** — `skill-detail-resolver.spec.ts`, resolved experience ids:

```diff
 expect(result.value.experiences.map(({ id }) => id)).toEqual([
   'aws-codepipeline-codebuild-multistage-delivery',
+  'eks-platform-operations',
+  'production-reliability-engineering',
+  'identity-access-hardening',
 ]);
```

A direct consequence of the `kubernetes` record's `experienceIds` gaining
those three ids in `skill-detail.data.ts`.

**github-actions** — same spec:

```diff
- expect(result.value.experiences).toEqual([]);
+ expect(result.value.experiences.map(({ id }) => id)).toEqual([
+   'gitops-deployment-reliability',
+ ]);
```

Before the change, `github-actions` had no detail record linking an
experience, so the resolver returned `[]`. After adding
`'gitops-deployment-reliability'` to its record, the expected value moved
from an exact empty array to an exact one-element array — `toEqual`
preserved throughout rather than loosened.

## Related

- `docs/solutions/design-patterns/model-skill-experience-as-astryx-narrative-cards.md`
- `docs/solutions/design-patterns/skill-detail-experience-section-labeling.md`
- `docs/solutions/conventions/tokenize-dora-capability-evidence.md`
- `docs/solutions/conventions/constrain-skills-page-to-evidence-backed-skill-cards.md`
