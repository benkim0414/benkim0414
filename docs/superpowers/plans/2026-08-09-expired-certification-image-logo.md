# Expired Certification Image Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render caller-supplied certification image logos in grayscale when their certification has a valid expired status, without changing active images or existing Simple Icon behavior.

**Architecture:** Keep the existing certification status and icon-selection logic as the source of truth. Add one conditional StyleX override at the Astryx `Citation` boundary: supplied images receive `grayscale(1)` only when status is `expired`, while the generated Simple Icon path continues embedding either brand color or `#737373` directly in its SVG data URL.

**Tech Stack:** React 19, TypeScript, StyleX, Astryx `Citation`, Vitest, Testing Library, Nx, pnpm

## Global Constraints

- A supplied image is grayscale only when `citationIcon` exists and a valid `expiresAt` is at or before `currentDate`.
- Active, missing-expiry, and invalid-expiry supplied images retain their original colors.
- Expired supplied images retain full opacity and the original image URL.
- Existing generated Simple Icons retain brand color when active and `#737373` when expired.
- Do not change component props, callers, image assets, hovercard content, link behavior, accessibility metadata, or global styles.

---

## File Structure

- Modify `apps/github.io/src/app/certifications/certification-citation.tsx` to define and conditionally pass the expired-image StyleX override.
- Modify `apps/github.io/src/app/certifications/certification-citation-xstyle.spec.tsx` to test the conditional override and all non-expired boundaries through the existing mocked Astryx `Citation` interface.
- Do not modify `apps/github.io/src/app/certifications/certification-citation.spec.tsx`; its existing assertions remain regression coverage for icon selection, Simple Icon colors, links, status metadata, and hovercards.
- Do not modify `apps/github.io/src/app/certifications/certification-citation.stories.tsx`; its existing `Active` and `Expired` CKA image stories remain the visual fixtures.

### Task 1: Grayscale expired supplied certification images

**Files:**
- Modify: `apps/github.io/src/app/certifications/certification-citation-xstyle.spec.tsx:1-61`
- Modify: `apps/github.io/src/app/certifications/certification-citation.tsx:20-30,151-170`

**Interfaces:**
- Consumes: `CertificationCitationProps.citationIcon?: string` and the existing `CertificationStatus = 'active' | 'expired'` returned by `getCertificationStatus(expiresAt, currentDate)`.
- Produces: a private `styles.expiredCitationIcon` StyleX rule with `filter: 'grayscale(1)'`, conditionally supplied through the existing Astryx `Citation` `xstyle` prop. No public interface changes.

- [ ] **Step 1: Add failing image-state tests using compiled StyleX values**

Keep the existing StyleX setup and icon-backed citation test. The Vite StyleX
plugin statically compiles rules before Vitest module mocks run, so test the
presence or absence of the compiled `xstyle` value instead of its generated
class keys. Add these tests inside the current `describe` block:

```tsx
it('passes a grayscale xstyle override for an expired supplied image', () => {
  render(
    <CertificationCitation
      citationIcon="/assets/certifications/cncf/cka.png"
      currentDate={new Date('2029-01-01T00:00:00+11:00')}
      expiresAt="2027-04-20T10:00:00+10:00"
      title="CKA"
      url={certificateUrl}
    />,
  );

  expect(citationMock.calls[0]?.xstyle).toBeTruthy();
});

it.each([
  ['active', '2027-04-20T10:00:00+10:00'],
  ['missing expiry', undefined],
  ['invalid expiry', '2027-02-30T10:00:00+11:00'],
] as const)('does not grayscale a supplied image with %s', (_label, expiresAt) => {
  render(
    <CertificationCitation
      citationIcon="/assets/certifications/cncf/cka.png"
      currentDate={new Date('2026-07-23T00:00:00+10:00')}
      expiresAt={expiresAt}
      title="CKA"
      url={certificateUrl}
    />,
  );

  expect(citationMock.calls[0]?.xstyle).toBe(false);
});
```

- [ ] **Step 2: Run the focused test and verify the new positive case fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/certifications/certification-citation-xstyle.spec.tsx
```

Expected: FAIL because the expired supplied image currently passes `false` as `xstyle`. The existing and new non-expired cases should pass.

- [ ] **Step 3: Add the minimal expired-image StyleX rule and composition**

Add the new rule beside `sourceWithIcon`:

```tsx
expiredCitationIcon: {
  filter: 'grayscale(1)',
},
```

After `hasSkillLogo` is derived, add the supplied-image condition and compose the citation override without changing the chosen `icon`:

```tsx
const hasExpiredCitationIcon = Boolean(
  citationIcon && status === 'expired',
);
const citationXstyle = hasSkillLogo
  ? [
      styles.sourceWithIcon,
      hasExpiredCitationIcon && styles.expiredCitationIcon,
    ]
  : hasExpiredCitationIcon && styles.expiredCitationIcon;
```

Pass the composed value to Astryx:

```tsx
xstyle={citationXstyle}
```

Do not alter `iconDataUrl`, `skillIcon`, `icon`, `getCertificationStatus`, or any public prop.

- [ ] **Step 4: Run the focused test and verify all image-state cases pass**

Run:

```bash
pnpm nx test github.io -- --run src/app/certifications/certification-citation-xstyle.spec.tsx
```

Expected: PASS. The expired supplied image exposes a compiled StyleX override, active/missing/invalid supplied images expose no override, icon-backed generated citations retain their spacing override, and iconless citations retain `false`. The component source defines that expired-image override as `filter: 'grayscale(1)'`; the build validation in Step 6 verifies StyleX can compile it.

- [ ] **Step 5: Run both CertificationCitation test suites**

Run:

```bash
pnpm nx test github.io -- --run \
  src/app/certifications/certification-citation.spec.tsx \
  src/app/certifications/certification-citation-xstyle.spec.tsx
```

Expected: PASS. In particular, the existing generated Simple Icon assertions still find brand fill `#326CE5` for active Kubernetes and neutral fill `#737373` for expired Kubernetes, and the supplied image keeps its original `src`.

- [ ] **Step 6: Run complete project validation**

Run:

```bash
pnpm nx lint github.io
pnpm nx test github.io
pnpm nx build github.io
git diff --check
```

Expected: all Nx targets pass and `git diff --check` prints no output. If Nx reports an environmental dependency or daemon failure, capture the exact failure and rerun with `NX_DAEMON=false NX_ANALYTICS=false` before treating it as a product failure.

- [ ] **Step 7: Inspect and commit the implementation as one logical fix**

Inspect only the task files:

```bash
git diff -- apps/github.io/src/app/certifications/certification-citation.tsx \
  apps/github.io/src/app/certifications/certification-citation-xstyle.spec.tsx
git status --short
```

Stage explicit paths, inspect the staged diff, and commit:

```bash
git add apps/github.io/src/app/certifications/certification-citation.tsx
git add apps/github.io/src/app/certifications/certification-citation-xstyle.spec.tsx
git diff --cached
git commit -m "fix(github.io): grayscale expired certification image logos"
```

Expected: one implementation commit containing only the component and its focused StyleX contract tests. Do not push, open a PR, merge, deploy, or remove the worktree.
