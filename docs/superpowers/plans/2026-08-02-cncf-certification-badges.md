# CNCF Certification Badges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show exact official badge artwork for KCNA, CKAD, and CKA certification citations in the `github.io` portfolio.

**Architecture:** Add local official badge assets and a small constants module that exports their imported Vite URLs. Extend certification citation props/data with an optional `citationIcon` string, and make `CertificationCitation` prefer that credential-specific image before falling back to skill-brand icons.

**Tech Stack:** Nx React app, pnpm, Vite asset imports, TypeScript, Vitest, Testing Library, Astryx `Citation`, StyleX.

## Global Constraints

- Work from linked worktree `.worktrees/cncf-certification-badges` on branch `docs/cncf-certification-badges`.
- Do not push, deploy, merge, force-push, or delete branches.
- Stage explicit paths only; do not use `git add -A`, `git add --all`, `git add -u`, `git add .`, `git commit -a`, or `git commit -am`.
- Use conventional commit subjects.
- Before implementation UI work, run `pnpm exec astryx docs styling` and inspect Astryx Citation docs with the available Astryx docs command.
- Use official issuer badge images; do not recolor, redraw, or approximate CNCF badge artwork.
- Keep certificate PDF links, certification ordering, expiry dates, and Kubernetes skill branding unchanged.
- Preserve existing fallback behavior for certifications without a badge image.

---

## File Structure

- Create `apps/github.io/src/assets/certifications/cncf/kcna.png`: local KCNA badge image from Credly.
- Create `apps/github.io/src/assets/certifications/cncf/ckad.png`: local CKAD badge image from Credly.
- Create `apps/github.io/src/assets/certifications/cncf/cka.png`: local CKA badge image from Credly.
- Create `apps/github.io/src/app/certifications/cncf-certification-badges.ts`: imports the three PNG assets and exports `cncfCertificationBadges`.
- Modify `apps/github.io/src/app/skills/skill-list.types.ts`: add optional `citationIcon?: string` to `SkillCertification`.
- Modify `apps/github.io/src/app/certifications/certification-citation.tsx`: make `citationIcon` win over the skill-brand icon.
- Modify `apps/github.io/src/app/certifications/certification-citation.spec.tsx`: cover precedence and fallback behavior.
- Modify `apps/github.io/src/app/skills/skill-list.data.ts`: assign badge images to KCNA, CKAD, and CKA certification entries.
- Modify `apps/github.io/src/app/skills/skill-list.data.spec.ts`: assert distinct badge images on the Kubernetes skill certifications.
- Modify `apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts`: assign the same badge images to roadmap certification entries.
- Modify `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`: assert distinct badge images on the roadmap certification entries.
- Modify `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`: add optional `citationIcon?: string` to `CapabilityEvidenceItem`.
- Modify `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx`: pass `evidence.citationIcon` into `CertificationCitation`.
- Modify `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx`: cover certification evidence badge-image pass-through.

---

### Task 1: Add Official CNCF Badge Assets And Constants

**Files:**
- Create: `apps/github.io/src/assets/certifications/cncf/kcna.png`
- Create: `apps/github.io/src/assets/certifications/cncf/ckad.png`
- Create: `apps/github.io/src/assets/certifications/cncf/cka.png`
- Create: `apps/github.io/src/app/certifications/cncf-certification-badges.ts`
- Test: `apps/github.io/src/app/certifications/cncf-certification-badges.ts`

**Interfaces:**
- Consumes: Vite image import support from `apps/github.io/tsconfig.app.json`.
- Produces: `cncfCertificationBadges: { KCNA: string; CKAD: string; CKA: string }`.

- [ ] **Step 1: Confirm Astryx UI docs before app UI work**

Run:

```bash
pnpm exec astryx docs styling
pnpm exec astryx docs component Citation
```

Expected: both commands complete successfully. If the exact component command is unavailable, run `pnpm exec astryx docs --help`, choose the listed Citation docs command, and record the command used in the task notes.

- [ ] **Step 2: Download official badge assets**

Run:

```bash
mkdir -p apps/github.io/src/assets/certifications/cncf
curl -L 'https://images.credly.com/images/f28f1d88-428a-47f6-95b5-7da1dd6c1000/KCNA_badge.png' -o apps/github.io/src/assets/certifications/cncf/kcna.png
curl -L 'https://images.credly.com/images/cc8adc83-1dc6-4d57-8e20-22171247e052/blob' -o apps/github.io/src/assets/certifications/cncf/ckad.png
curl -L 'https://images.credly.com/images/8b8ed108-e77d-4396-ac59-2504583b9d54/cka_from_cncfsite__281_29.png' -o apps/github.io/src/assets/certifications/cncf/cka.png
file apps/github.io/src/assets/certifications/cncf/*.png
```

Expected: each downloaded file is reported as a PNG image.

- [ ] **Step 3: Create the badge constants module**

Create `apps/github.io/src/app/certifications/cncf-certification-badges.ts`:

```ts
import ckaBadge from '../../assets/certifications/cncf/cka.png';
import ckadBadge from '../../assets/certifications/cncf/ckad.png';
import kcnaBadge from '../../assets/certifications/cncf/kcna.png';

export const cncfCertificationBadges = {
  KCNA: kcnaBadge,
  CKAD: ckadBadge,
  CKA: ckaBadge,
} as const;
```

- [ ] **Step 4: Type-check asset imports through the app test runner**

Run:

```bash
pnpm nx test github.io -- src/app/certifications/certification-citation.spec.tsx
```

Expected: existing certification citation tests still pass.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git status --short
git add apps/github.io/src/assets/certifications/cncf/kcna.png apps/github.io/src/assets/certifications/cncf/ckad.png apps/github.io/src/assets/certifications/cncf/cka.png apps/github.io/src/app/certifications/cncf-certification-badges.ts
git diff --cached --stat
git commit -m "feat(github.io): add CNCF certification badge assets"
```

Expected: commit succeeds with only the three PNG files and constants module staged.

---

### Task 2: Prefer Certification-Specific Citation Icons

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-list.types.ts`
- Modify: `apps/github.io/src/app/certifications/certification-citation.tsx`
- Modify: `apps/github.io/src/app/certifications/certification-citation.spec.tsx`

**Interfaces:**
- Consumes: `CertificationCitationProps.citationIcon?: string`.
- Produces: `SkillCertification.citationIcon?: string`, and icon resolution order `citationIcon -> skill brand icon -> Astryx fallback`.

- [ ] **Step 1: Write the failing precedence test**

Add this test to `apps/github.io/src/app/certifications/certification-citation.spec.tsx` after the primary-brand test:

```tsx
  it('prefers a certification-specific image over the linked skill logo', () => {
    const badgeImage = '/assets/certifications/cncf/cka.png';
    const { container } = render(
      <CertificationCitation
        citationIcon={badgeImage}
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2027-04-20T10:00:00+10:00"
        skills={['Kubernetes']}
        title="CKA"
        url={certificateUrl}
      />,
    );

    const icon = container.querySelector('img');

    expect(icon?.getAttribute('src')).toBe(badgeImage);
    expect(icon?.getAttribute('src')).not.toContain('data:image/svg+xml');
  });
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
pnpm nx test github.io -- src/app/certifications/certification-citation.spec.tsx
```

Expected: the new test fails because the component still chooses the Kubernetes skill icon before `citationIcon`.

- [ ] **Step 3: Add `citationIcon` to the certification data type**

Change `SkillCertification` in `apps/github.io/src/app/skills/skill-list.types.ts` to:

```ts
export interface SkillCertification {
  title: string;
  url: string;
  skills: readonly string[];
  expiresAt: string;
  citationIcon?: string;
}
```

- [ ] **Step 4: Update icon resolution in `CertificationCitation`**

Replace the current `icon` calculation in `apps/github.io/src/app/certifications/certification-citation.tsx` with:

```ts
  const skillIcon = primary?.brand.iconPath
    ? iconDataUrl(
        primary.brand.iconPath,
        status === 'expired' ? ASTRYX_CITATION_LABEL_TEXT : primary.brand.color,
      )
    : undefined;
  const icon = citationIcon ?? skillIcon;
```

Keep `hasSkillLogo` based on `Boolean(iconPath)` so existing Citation spacing for skill-logo citations remains unchanged.

- [ ] **Step 5: Run the focused test and verify it passes**

Run:

```bash
pnpm nx test github.io -- src/app/certifications/certification-citation.spec.tsx
```

Expected: all certification citation tests pass, including the new precedence test and existing fallback tests.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git status --short
git add apps/github.io/src/app/skills/skill-list.types.ts apps/github.io/src/app/certifications/certification-citation.tsx apps/github.io/src/app/certifications/certification-citation.spec.tsx
git diff --cached
git commit -m "fix(github.io): prefer certification badge icons"
```

Expected: commit succeeds with only the type, component, and focused test changes staged.

---

### Task 3: Wire Badge Images Into Skill And Roadmap Certification Data

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-list.data.ts`
- Modify: `apps/github.io/src/app/skills/skill-list.data.spec.ts`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`

**Interfaces:**
- Consumes: `cncfCertificationBadges` from `../certifications/cncf-certification-badges`.
- Produces: KCNA, CKAD, and CKA certification data entries with distinct `citationIcon` values.

- [ ] **Step 1: Write failing data assertions for skill-list certifications**

Import the constants in `apps/github.io/src/app/skills/skill-list.data.spec.ts`:

```ts
import { cncfCertificationBadges } from '../certifications/cncf-certification-badges';
```

Update the expected Kubernetes certification objects to include:

```ts
        citationIcon: cncfCertificationBadges.KCNA,
```

```ts
        citationIcon: cncfCertificationBadges.CKAD,
```

```ts
        citationIcon: cncfCertificationBadges.CKA,
```

Add this assertion at the end of the same test:

```ts
    expect(new Set(certifications?.map((certification) => certification.citationIcon)).size).toBe(3);
```

- [ ] **Step 2: Write failing data assertions for roadmap certifications**

Import the constants in `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`:

```ts
import { cncfCertificationBadges } from '../certifications/cncf-certification-badges';
```

Update the expected roadmap certification objects to include:

```ts
          citationIcon: cncfCertificationBadges.CKA,
```

```ts
          citationIcon: cncfCertificationBadges.CKAD,
```

```ts
          citationIcon: cncfCertificationBadges.KCNA,
```

- [ ] **Step 3: Run focused data tests and verify they fail**

Run:

```bash
pnpm nx test github.io -- src/app/skills/skill-list.data.spec.ts src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: tests fail because `citationIcon` is absent from production data.

- [ ] **Step 4: Add badge imports to production data files**

Add this import to `apps/github.io/src/app/skills/skill-list.data.ts`:

```ts
import { cncfCertificationBadges } from '../certifications/cncf-certification-badges';
```

Add this import to `apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts`:

```ts
import { cncfCertificationBadges } from '../certifications/cncf-certification-badges';
```

- [ ] **Step 5: Add `citationIcon` to each production certification entry**

In `skill-list.data.ts`, add:

```ts
        citationIcon: cncfCertificationBadges.KCNA,
```

to the KCNA object, add:

```ts
        citationIcon: cncfCertificationBadges.CKAD,
```

to the CKAD object, and add:

```ts
        citationIcon: cncfCertificationBadges.CKA,
```

to the CKA object.

In `devops-roadmap.data.ts`, add:

```ts
        citationIcon: cncfCertificationBadges.CKA,
```

to the CKA object, add:

```ts
        citationIcon: cncfCertificationBadges.CKAD,
```

to the CKAD object, and add:

```ts
        citationIcon: cncfCertificationBadges.KCNA,
```

to the KCNA object.

- [ ] **Step 6: Run focused data tests and verify they pass**

Run:

```bash
pnpm nx test github.io -- src/app/skills/skill-list.data.spec.ts src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: both data specs pass.

- [ ] **Step 7: Run rendering tests that consume the wired data**

Run:

```bash
pnpm nx test github.io -- src/app/skills/skill-card.spec.tsx src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: certification citation counts, labels, links, and ordering remain unchanged.

- [ ] **Step 8: Commit Task 3**

Run:

```bash
git status --short
git add apps/github.io/src/app/skills/skill-list.data.ts apps/github.io/src/app/skills/skill-list.data.spec.ts apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
git diff --cached
git commit -m "feat(github.io): use CNCF badges for certification data"
```

Expected: commit succeeds with only production data and matching data tests staged.

---

### Task 4: Support Badge Images In Capability Evidence And Verify The App

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`
- Modify: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx`

**Interfaces:**
- Consumes: `CapabilityEvidenceItem.citationIcon?: string`.
- Produces: `CertificationEvidenceCitation` passes `evidence.citationIcon` to `CertificationCitation`.

- [ ] **Step 1: Write the failing capability evidence pass-through test**

Import the constants in `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx`:

```ts
import { cncfCertificationBadges } from '../certifications/cncf-certification-badges';
```

Add this test after `renders certification evidence through CertificationCitation`:

```tsx
  it('passes certification badge images through to certification citations', () => {
    const { container } = render(
      <CapabilityEvidence
        citationNumber={3}
        evidence={evidence({
          citationIcon: cncfCertificationBadges.CKA,
          label: 'CKA',
          proofUrl: 'https://example.com/cka',
          technologies: ['Kubernetes'],
          type: 'certification',
        })}
      />,
    );

    expect(
      screen.getByRole('doc-noteref', { name: 'Citation 3: CKA' }),
    ).toBeTruthy();
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      cncfCertificationBadges.CKA,
    );
  });
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
pnpm nx test github.io -- src/app/devops-capability-evidence/capability-evidence.spec.tsx
```

Expected: TypeScript or assertion failure because `CapabilityEvidenceItem` does not expose or pass `citationIcon`.

- [ ] **Step 3: Add the optional field to capability evidence items**

Add this field to `CapabilityEvidenceItem` in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`:

```ts
  citationIcon?: string;
```

- [ ] **Step 4: Pass the badge image through the certification evidence renderer**

Update the `CertificationCitation` call in `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx`:

```tsx
      <CertificationCitation
        citationIcon={
          evidence.citationIcon ?? getCapabilityEvidenceCitationIcon(iconData)
        }
        fallbackIcon={
          iconData?.kind === 'fallback'
            ? renderCapabilityEvidenceIcon(iconData)
            : undefined
        }
        expiresAt={evidence.endDate}
        number={citationNumber}
        skills={evidence.technologies}
        title={label}
        url={evidence.proofUrl}
      />
```

- [ ] **Step 5: Run the focused capability evidence test and verify it passes**

Run:

```bash
pnpm nx test github.io -- src/app/devops-capability-evidence/capability-evidence.spec.tsx
```

Expected: capability evidence tests pass, including the new badge pass-through test and existing fallback icon test.

- [ ] **Step 6: Run full app validation**

Run:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
```

Expected: all three commands pass.

- [ ] **Step 7: Run visual review for citation surfaces**

Run Storybook:

```bash
pnpm nx storybook github.io --host 127.0.0.1 --port 4400
```

Inspect the relevant certification, skill card/list, and DevOps roadmap stories. Confirm that the official badge images render, remain legible at citation size, do not overlap text, and do not change citation ordering or link behavior.

- [ ] **Step 8: Commit Task 4**

Run:

```bash
git status --short
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
git diff --cached
git commit -m "feat(github.io): support certification evidence badges"
```

Expected: commit succeeds with only capability evidence type, renderer, and tests staged.

---

## Final Handoff Checks

- [ ] Run `git status --short --branch` and confirm the worktree is clean.
- [ ] Run `git log --oneline -5` and confirm Task 1 through Task 4 commits are present after the spec and plan commits.
- [ ] Summarize the exact badge source URLs used:
  - KCNA: `https://images.credly.com/images/f28f1d88-428a-47f6-95b5-7da1dd6c1000/KCNA_badge.png`
  - CKAD: `https://images.credly.com/images/cc8adc83-1dc6-4d57-8e20-22171247e052/blob`
  - CKA: `https://images.credly.com/images/8b8ed108-e77d-4396-ac59-2504583b9d54/cka_from_cncfsite__281_29.png`
- [ ] Report validation results for focused tests, `pnpm nx test github.io`, `pnpm nx lint github.io`, `pnpm nx build github.io`, and Storybook visual review.
