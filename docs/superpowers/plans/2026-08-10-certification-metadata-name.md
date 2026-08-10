# Certification Metadata Name Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the `CertificationCitation` hover card a fixed `Certification` title and expose the concrete certification name as its first metadata row.

**Architecture:** Keep the existing `CertificationCitation` props, validation gate, and `HoverCard` composition. Change only the `MetadataList` presentation contract, lock it with the existing semantic component test, and update the durable design-pattern guidance that documents that contract.

**Tech Stack:** React 19, TypeScript, Astryx `HoverCard` and `MetadataList`, Testing Library, Vitest, Nx, pnpm

## Global Constraints

- The metadata title must be exactly `Certification`.
- Metadata rows must be ordered exactly `Name`, `ID`, `Status`, `Completed`.
- `Name` must render `metadata.name`; `ID` must render `metadata.id`.
- Preserve the existing all-or-nothing metadata gate and plain-citation fallback.
- Preserve component props, caller data, styling, icons, hover-card interaction, status derivation, status badge variants, date formatting, and hidden accessible status text.
- Preserve semantic `dt`/`dd` markup and the citation's `aria-describedby` relationship to the hover-card content.
- Do not modify Storybook fixtures or certification callers.
- Stage explicit paths only and use conventional commit subjects.

---

## File Structure

- `apps/github.io/src/app/certifications/certification-citation.tsx` owns the certification citation and supplemental metadata rendering. Modify only the metadata title and row placement.
- `apps/github.io/src/app/certifications/certification-citation.spec.tsx` owns the semantic component contract. Update the complete-metadata case without weakening its link, badge, or accessibility assertions.
- `docs/solutions/design-patterns/accessible-certification-metadata-hovercard.md` is the durable guidance for this hover-card pattern. Update its metadata contract, example explanation, and `last_updated` date.

### Task 1: Change the Certification Metadata Contract

**Files:**
- Modify: `apps/github.io/src/app/certifications/certification-citation.spec.tsx:32-83`
- Modify: `apps/github.io/src/app/certifications/certification-citation.tsx:193-207`

**Interfaces:**
- Consumes: `CertificationCitationProps` and `CertificationMetadata` unchanged, including `metadata: { id: string; name: string; completedAt: string }`.
- Produces: a complete metadata hover card titled `Certification` whose definition-list pairs are `Name`, `ID`, `Status`, and `Completed` in that order.

- [ ] **Step 1: Update the semantic test to express the new contract**

In `describes a concrete certification with semantic metadata`, replace the current `certificationName` lookup and related title assertions with a fixed-title lookup. Keep the existing link, `aria-describedby`, status badge, and non-interactive assertions, then change the expected `dt` and `dd` arrays:

```tsx
    const metadataList = hoverCard.querySelector('.astryx-metadata-list');
    const metadataTitle = Array.from(
      metadataList?.querySelectorAll('*') ?? [],
    ).find((element) => element.textContent === 'Certification');
    const statusBadge = hoverCard.querySelector(
      '.astryx-badge[data-variant="green"]',
    );

    expect(metadataList).toBeTruthy();
    expect(metadataTitle?.textContent).toBe('Certification');
    expect(metadataTitle?.closest('.astryx-metadata-list')).toBe(metadataList);
    expect(metadataTitle?.closest('dl')).toBeNull();
    expect(statusBadge?.textContent).toBe('Active');
    expect(statusBadge?.closest('dd')).toBeTruthy();
    expect(statusBadge?.querySelector('a, button')).toBeNull();
    expect(
      Array.from(hoverCard.querySelectorAll('dt'), (item) => item.textContent),
    ).toEqual(['Name', 'ID', 'Status', 'Completed']);
    expect(
      Array.from(hoverCard.querySelectorAll('dd'), (item) => item.textContent),
    ).toEqual([
      'Certified Kubernetes Administrator',
      'LF-assbyzy17c',
      'Active',
      'Apr 20, 2025',
    ]);
```

- [ ] **Step 2: Run the component test and verify the contract fails**

Run:

```bash
pnpm nx test github.io
```

Expected: FAIL in `describes a concrete certification with semantic metadata` because the current heading is `Certified Kubernetes Administrator` and the current rows are `ID`, `Status`, `Completed`.

- [ ] **Step 3: Make the minimal metadata rendering change**

In the `HoverCard` content, replace the current `MetadataList` opening and first row with:

```tsx
            <MetadataList columns="single" title="Certification">
              <MetadataListItem label="Name">
                {metadata.name}
              </MetadataListItem>
              <MetadataListItem label="ID">{metadata.id}</MetadataListItem>
```

Leave the existing `Status` and `Completed` rows immediately after `ID`. Do not reformat or change `hasCompleteMetadata`, icon selection, citation styles, status logic, or fallback rendering.

- [ ] **Step 4: Run the component suite and verify the contract passes**

Run:

```bash
pnpm nx test github.io
```

Expected: PASS for the `github.io` test target, including complete, expired, incomplete, malformed-date, impossible-date, icon, and fallback certification cases.

- [ ] **Step 5: Inspect and commit the component change**

Run:

```bash
git diff --check
git diff -- apps/github.io/src/app/certifications/certification-citation.spec.tsx apps/github.io/src/app/certifications/certification-citation.tsx
git add apps/github.io/src/app/certifications/certification-citation.spec.tsx apps/github.io/src/app/certifications/certification-citation.tsx
git diff --cached --check
git diff --cached
git commit -m "feat(github.io): clarify certification metadata hierarchy"
```

Expected: one component commit containing only the semantic test and minimal rendering change.

### Task 2: Align Durable Guidance and Verify the Project

**Files:**
- Modify: `docs/solutions/design-patterns/accessible-certification-metadata-hovercard.md:4`
- Modify: `docs/solutions/design-patterns/accessible-certification-metadata-hovercard.md:89-104`
- Modify: `docs/solutions/design-patterns/accessible-certification-metadata-hovercard.md:145-164`

**Interfaces:**
- Consumes: the Task 1 presentation contract: title `Certification`; ordered rows `Name`, `ID`, `Status`, `Completed`.
- Produces: current durable guidance that describes the implemented metadata semantics and test coverage without changing runtime behavior.

- [ ] **Step 1: Update the document date and semantic metadata guidance**

Change the frontmatter date to:

```yaml
last_updated: 2026-08-10
```

Replace the opening of `Keep supplemental content semantic and read-only` with:

```markdown
Use `Certification` as the fixed title of one single-column `MetadataList`,
with exactly four rows in this order: `Name`, `ID`, `Status`, and `Completed`.
The category title stays stable while the first row identifies the concrete
credential with its full certificate name
(`apps/github.io/src/app/certifications/certification-citation.tsx:193`). Render
status as a non-interactive Astryx `Badge`: use the green variant for `Active`
and the neutral variant for `Expired`. Astryx does not expose a gray Badge
variant; neutral is its supported gray treatment for an inactive or lapsed
state without treating expiration as an error. Keep the visible label so color
is never the only status signal.
```

Update the following test-description paragraph to state that the component test verifies the fixed category title outside the definition list, the name as the first definition-list value, the Badge contract, `dt`/`dd` semantics, and `aria-describedby` linkage.

- [ ] **Step 2: Update the example explanation**

Replace the sentence after the concrete `CertificationCitation` example with:

```markdown
This renders the fixed title `Certification` followed by metadata values
`Certified Kubernetes Administrator`, `LF-assbyzy17c`, derived status `Active`,
and `Apr 20, 2025`; the semantic test asserts those values and their row order
(`apps/github.io/src/app/certifications/certification-citation.spec.tsx:32`).
```

Do not change the generic-evidence example or its fallback guidance.

- [ ] **Step 3: Scan for stale contract language and inspect the diff**

Run:

```bash
rg -n "full certificate name as the title|exactly three rows" docs/solutions/design-patterns/accessible-certification-metadata-hovercard.md
git diff --check
git diff -- docs/solutions/design-patterns/accessible-certification-metadata-hovercard.md
```

Expected: `rg` returns no stale three-row or record-specific-title guidance; `git diff --check` passes; the documentation diff is limited to the updated date, semantic contract, test description, and example explanation.

- [ ] **Step 4: Run final focused verification**

Run:

```bash
pnpm nx test github.io
pnpm nx lint github.io
```

Expected: both Nx targets complete successfully.

- [ ] **Step 5: Inspect and commit the documentation change**

Run:

```bash
git add docs/solutions/design-patterns/accessible-certification-metadata-hovercard.md
git diff --cached --check
git diff --cached
git commit -m "docs(github.io): update certification metadata guidance"
git status --short --branch
```

Expected: one documentation commit containing only the durable-guidance update, followed by a clean feature worktree.
