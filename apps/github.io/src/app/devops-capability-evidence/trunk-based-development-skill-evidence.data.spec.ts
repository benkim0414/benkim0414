import { trunkBasedDevelopmentEvidenceItems } from './trunk-based-development-evidence.data';
import { trunkBasedDevelopmentSkillEvidenceItems } from './trunk-based-development-skill-evidence.data';

const expectedTitles = [
  'Git',
  'GitHub',
  'Nx',
  'GitHub Actions',
  'Conventional Commits',
  'Husky',
] as const;

const expectedSupport = {
  Git: [
    'single-trunk-repository-flow',
    'short-lived-branch-flow',
    'small-change-landings',
    'merge-commit-history',
    'conventional-commit-governance',
  ],
  GitHub: [
    'single-trunk-repository-flow',
    'short-lived-branch-flow',
    'merge-commit-history',
    'nx-affected-quality-gates',
  ],
  Nx: ['nx-affected-quality-gates'],
  'GitHub Actions': ['nx-affected-quality-gates'],
  'Conventional Commits': ['conventional-commit-governance'],
  Husky: ['conventional-commit-governance'],
} as const;

describe('trunkBasedDevelopmentSkillEvidenceItems', () => {
  it('stores the approved skills in display order', () => {
    expect(
      trunkBasedDevelopmentSkillEvidenceItems.map(({ title }) => title),
    ).toEqual(expectedTitles);
  });

  it('links each skill to its approved Trunk-Based Development evidence', () => {
    expect(
      Object.fromEntries(
        trunkBasedDevelopmentSkillEvidenceItems.map(
          ({ title, supportingEvidenceIds }) => [title, supportingEvidenceIds],
        ),
      ),
    ).toEqual(expectedSupport);
  });

  it('derives display chronology from supporting experience start dates', () => {
    const experienceById = new Map(
      trunkBasedDevelopmentEvidenceItems.map((item) => [item.id, item]),
    );
    const earliestDates = trunkBasedDevelopmentSkillEvidenceItems.map(
      (skill) =>
        (skill.supportingEvidenceIds ?? [])
          .map((id) => experienceById.get(id)?.details?.period.startedAt)
          .filter((date): date is string => Boolean(date))
          .sort()[0],
    );

    expect(earliestDates).toEqual([...earliestDates].sort());
  });

  it('resolves every support ID to a capability-compatible public experience', () => {
    const experienceById = new Map(
      trunkBasedDevelopmentEvidenceItems.map((item) => [item.id, item]),
    );

    for (const skill of trunkBasedDevelopmentSkillEvidenceItems) {
      expect(skill).toMatchObject({
        type: 'skill',
        capabilityKeys: ['trunk-based-development'],
        technologies: [skill.title],
        isPublic: true,
        strength: 'strong',
      });
      expect(skill.supportingEvidenceIds?.length).toBeGreaterThan(0);

      for (const supportId of skill.supportingEvidenceIds ?? []) {
        const support = experienceById.get(supportId);
        expect(support, `${skill.title} support ${supportId}`).toBeDefined();
        expect(support?.type).toBe('experience');
        expect(support?.isPublic).toBe(true);
        expect(support?.capabilityKeys).toContain('trunk-based-development');
      }
    }
  });

  it('uses Conventional Commits as the skill rather than commitlint', () => {
    expect(
      trunkBasedDevelopmentSkillEvidenceItems.map(({ title }) => title),
    ).not.toContain('commitlint');
  });
});
