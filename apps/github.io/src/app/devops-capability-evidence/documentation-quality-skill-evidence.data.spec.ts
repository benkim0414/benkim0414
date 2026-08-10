import { documentationQualityEvidenceItems } from './documentation-quality-evidence.data';
import { documentationQualitySkillEvidenceItems } from './documentation-quality-skill-evidence.data';
import { expectPublicSafeEvidence } from './public-evidence-safety.test-helpers';

const expectedSkills = [
  ['documentation-quality-skill-markdown', 'Markdown'],
  ['documentation-quality-skill-yaml', 'YAML'],
  ['documentation-quality-skill-git', 'Git'],
] as const;

const expectedSupport = {
  'documentation-quality-skill-markdown': [
    'structured-documentation-corpus',
    'indexed-solution-documentation',
    'documentation-frontmatter-contracts',
    'current-documentation-maintenance',
    'documentation-change-integration',
    'cross-verified-documentation-claims',
  ],
  'documentation-quality-skill-yaml': ['documentation-frontmatter-contracts'],
  'documentation-quality-skill-git': [
    'current-documentation-maintenance',
    'documentation-change-integration',
  ],
} as const;

const approvedPublicSkillText = [
  'Markdown',
  'Evidence-backed Documentation Quality capability with Markdown.',
  'YAML',
  'Evidence-backed Documentation Quality capability with YAML.',
  'Git',
  'Evidence-backed Documentation Quality capability with Git.',
] as const;

describe('documentationQualitySkillEvidenceItems', () => {
  it('stores exactly the approved skill IDs and titles in workflow order', () => {
    expect(
      documentationQualitySkillEvidenceItems.map(({ id, title }) => [
        id,
        title,
      ]),
    ).toEqual(expectedSkills);
  });

  it('orders skills by earliest support date while keeping workflow ties stable', () => {
    const experienceById = new Map(
      documentationQualityEvidenceItems.map((item) => [item.id, item]),
    );
    const chronology = documentationQualitySkillEvidenceItems.map((skill) => {
      const supportDates = (skill.supportingEvidenceIds ?? []).map(
        (supportId) => experienceById.get(supportId)?.details?.period.startedAt,
      );
      const earliestSupportDate = supportDates.reduce<string | undefined>(
        (earliest, date) =>
          date && (!earliest || date < earliest) ? date : earliest,
        undefined,
      );

      return [skill.title, earliestSupportDate];
    });

    expect(chronology).toEqual([
      ['Markdown', '2024-06-03'],
      ['YAML', '2024-06-03'],
      ['Git', '2024-06-03'],
    ]);
  });

  it('links each public skill to its approved public Documentation Quality experience', () => {
    const experienceById = new Map(
      documentationQualityEvidenceItems.map((item) => [item.id, item]),
    );

    for (const skill of documentationQualitySkillEvidenceItems) {
      expect(skill).toMatchObject({
        label: skill.title,
        type: 'skill',
        capabilityKeys: ['documentation-quality'],
        technologies: [skill.title],
        isPublic: true,
        strength: 'supporting',
      });
      expect(skill.isSensitive).not.toBe(true);
      expect(skill.date).toBeUndefined();
      expect(skill.endDate).toBeUndefined();
      expect(skill.details).toBeUndefined();
      expect(skill.organization).toBeUndefined();
      expect(skill.proofUrl).toBeUndefined();
      expect(skill.supportingEvidenceIds).toEqual(
        expectedSupport[skill.id as keyof typeof expectedSupport],
      );
      expect(skill.supportingEvidenceIds?.length).toBeGreaterThan(0);

      for (const supportId of skill.supportingEvidenceIds ?? []) {
        const support = experienceById.get(supportId);
        expect(support, `${skill.id} support ${supportId}`).toBeDefined();
        expect(support?.type).toBe('experience');
        expect(support?.type).not.toBe('skill');
        expect(support?.isPublic).toBe(true);
        expect(support?.capabilityKeys).toContain('documentation-quality');
      }
    }
  });

  it('keeps the published skill catalog public-safe and reviewable', () => {
    expectPublicSafeEvidence(
      documentationQualitySkillEvidenceItems,
      approvedPublicSkillText,
    );
  });
});
