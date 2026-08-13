# Skill Detail Muted Metadata Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Place the skill detail page's existing Basic MetadataList inside one full-width muted Astryx Card.

**Architecture:** Keep the composition in `SkillDetailPage`: the page continues resolving and rendering the same metadata, while an Astryx `Card` becomes its only visual container. Test the public Astryx DOM contract (`astryx-card`, `data-variant`, and the width custom property) plus the existing MetadataList semantics; do not create a wrapper component or custom surface styles.

**Tech Stack:** React 19, TypeScript, Astryx Core 0.1.4, StyleX, Vitest, Testing Library, Nx, Storybook

## Global Constraints

- Use `Card variant="muted" width="100%"` with Astryx's theme-managed default padding.
- The Card contains only the existing MetadataList; the skill title and description remain outside it.
- Add no visible Overview or Metadata heading.
- Add no custom background, border, radius, padding, or global app-background change.
- Preserve Astryx Basic MetadataList defaults: no `columns`, `label`, or `orientation` override.
- Preserve Categories, Rating, and conditional Certifications content and order.
- Preserve existing `dl`, `dt`, and `dd` semantics and narrow-width wrapping.
- Do not add navigation from skill cards, lists, or the command palette.
- Keep the existing enriched Kubernetes and basic React Storybook stories; no new story is required.

---

## File Structure

- Modify `apps/github.io/src/app/skills/skill-detail-page.tsx` to import Astryx Card and wrap the existing MetadataList.
- Modify `apps/github.io/src/app/skills/skill-detail-page.spec.tsx` to lock down the muted, full-width Card composition while retaining all current metadata assertions.
- Do not create new production, test, style, data, route, or story files.

### Task 1: Wrap Skill Metadata in an Astryx Muted Card

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx:45-53`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.tsx:1-120`
- Verify: `apps/github.io/src/app/skills/skill-detail-page.stories.tsx`

**Interfaces:**
- Consumes: `Card` from `@astryxdesign/core/Card` with `variant="muted"` and `width="100%"`.
- Consumes: the existing `MetadataList` subtree and its `data-testid="skill-metadata"` hook.
- Produces: no new exported API; `SkillDetailPage({ detail }: SkillDetailPageProps): ReactElement` remains unchanged.
- Produces DOM: `.astryx-card[data-variant="muted"]` with inline `--x-width: 100%`, whose first child is the existing metadata root.

- [ ] **Step 1: Write the failing Card-composition test**

Add this test immediately after the existing “uses the Astryx Basic Metadata defaults without layout overrides” test in `skill-detail-page.spec.tsx`:

```tsx
it('places skill metadata in a full-width muted Astryx Card', () => {
  const detail = getResolvedDetail('kubernetes');
  const { getByTestId } = render(<SkillDetailPage detail={detail} />);
  const metadata = getByTestId('skill-metadata');
  const card = metadata.closest('.astryx-card');

  expect(card).not.toBeNull();
  expect(card?.getAttribute('data-variant')).toBe('muted');
  expect((card as HTMLElement).style.getPropertyValue('--x-width')).toBe(
    '100%',
  );
  expect(card?.firstElementChild).toBe(metadata);
});
```

This supplements rather than replaces the existing Basic MetadataList, enriched-skill, basic-skill, heading, and focus tests.

- [ ] **Step 2: Run the focused test and verify the intended failure**

Run:

```bash
pnpm nx test github.io --testFile=apps/github.io/src/app/skills/skill-detail-page.spec.tsx
```

Expected: FAIL in `places skill metadata in a full-width muted Astryx Card` because `metadata.closest('.astryx-card')` is `null`. Existing tests should remain passing.

- [ ] **Step 3: Implement the minimal Astryx composition**

Add the Card import with the other Astryx imports in `skill-detail-page.tsx`:

```tsx
import { Card } from '@astryxdesign/core/Card';
```

Wrap the existing MetadataList block, without changing any of its children or props:

```tsx
<Card variant="muted" width="100%">
  <MetadataList data-testid="skill-metadata">
    <MetadataListItem label="Categories">
      <HStack
        as="ul"
        gap={1}
        wrap="wrap"
        xstyle={styles.metadataValueList}
      >
        {detail.skill.categories.map((category) => (
          <li key={category} {...stylex.props(styles.metadataValueItem)}>
            <SkillCategory name={category} />
          </li>
        ))}
      </HStack>
    </MetadataListItem>

    <MetadataListItem label="Rating">
      <SkillRating level={detail.skill.level} />
    </MetadataListItem>

    {certifications.length > 0 ? (
      <MetadataListItem label="Certifications">
        <HStack
          as="ul"
          gap={2}
          wrap="wrap"
          xstyle={styles.metadataValueList}
        >
          {certifications.map((certification, index) => (
            <li
              key={`${certification.title}-${certification.url}-${certification.expiresAt}`}
              {...stylex.props(styles.metadataValueItem)}
            >
              <CertificationCitation
                {...certification}
                number={index + 1}
              />
            </li>
          ))}
        </HStack>
      </MetadataListItem>
    ) : null}
  </MetadataList>
</Card>
```

Do not pass `padding`, `xstyle`, `className`, or a hardcoded color to Card.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
pnpm nx test github.io --testFile=apps/github.io/src/app/skills/skill-detail-page.spec.tsx
```

Expected: PASS for the new Card-composition test and all existing tests in the file.

- [ ] **Step 5: Run complete automated verification**

Run each command from the linked worktree root:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
git diff --check
```

Expected:

- All `github.io` tests pass.
- Lint reports no new errors; record any pre-existing warnings separately.
- The Vite application build succeeds.
- The static Storybook build succeeds.
- `git diff --check` produces no output.

- [ ] **Step 6: Inspect the Storybook stories responsively**

If Storybook is not already listening on port 41737, start it in a persistent terminal:

```bash
pnpm nx storybook github.io -- --host 0.0.0.0 --port 41737
```

Inspect these stories in both light and dark appearance at 390×844, 768×1024, and 1440×900:

```text
http://localhost:41737/iframe.html?id=github-io-skills-skill-detail-page--enriched-kubernetes&viewMode=story
http://localhost:41737/iframe.html?id=github-io-skills-skill-detail-page--basic-skill&viewMode=story
```

Verify all of the following:

- Exactly one muted Card wraps the metadata list.
- The Card fills the skill-detail content column and uses Astryx-managed padding, radius, and muted color.
- The title and description remain outside the Card.
- Kubernetes shows Categories, Rating, and Certifications in order.
- React shows Categories and Rating with no Certifications row.
- Metadata values wrap without clipping or horizontal page overflow.
- “In practice” blockquotes and Projects remain visually unchanged.

For the user's physical iPad review on the Tailscale VPN, print the exact
enriched-story URL:

```bash
SKILL_DETAIL_TAILSCALE_IP="$(tailscale ip -4 | head -n 1)"
echo "http://${SKILL_DETAIL_TAILSCALE_IP}:41737/iframe.html?id=github-io-skills-skill-detail-page--enriched-kubernetes&viewMode=story"
```

Open the printed URL on the iPad and leave the Storybook process running for
that review.

- [ ] **Step 7: Review and commit the implementation**

Inspect only the task-scoped changes:

```bash
git diff -- apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git status --short
```

After the required code review passes, stage explicit paths and commit:

```bash
git add apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git diff --cached --check
git diff --cached
git commit -m "feat(github.io): add muted skill metadata card"
```

Expected: one implementation commit containing only the Card composition and its regression test. Do not push, merge, deploy, or stop the Tailscale-accessible Storybook server without explicit user direction.
