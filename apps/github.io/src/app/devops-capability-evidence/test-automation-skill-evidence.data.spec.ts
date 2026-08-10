import { expectPublicSafeEvidence } from './public-evidence-safety.test-helpers';
import { testAutomationEvidenceItems } from './test-automation-evidence.data';
import { testAutomationSkillEvidenceItems } from './test-automation-skill-evidence.data';

const expectedSkillSet = [
  ['test-automation-skill-aws-codebuild', 'AWS CodeBuild'],
  ['test-automation-skill-postgresql', 'PostgreSQL'],
  [
    'test-automation-skill-parameter-store',
    'AWS Systems Manager Parameter Store',
  ],
  ['test-automation-skill-jest', 'Jest'],
  ['test-automation-skill-testcontainers', 'Testcontainers'],
  ['test-automation-skill-nx', 'Nx'],
  ['test-automation-skill-github-actions', 'GitHub Actions'],
  ['test-automation-skill-docker', 'Docker'],
  ['test-automation-skill-typescript', 'TypeScript'],
  ['test-automation-skill-prometheus', 'Prometheus'],
  ['test-automation-skill-promtool', 'promtool'],
] as const;

const expectedSupport = {
  'test-automation-skill-aws-codebuild': ['codebuild-postgresql-tests'],
  'test-automation-skill-postgresql': [
    'codebuild-postgresql-tests',
    'jest-testcontainers-postgres',
  ],
  'test-automation-skill-parameter-store': ['codebuild-postgresql-tests'],
  'test-automation-skill-jest': [
    'jest-testcontainers-postgres',
    'regression-gates',
    'service-generator-unit-tests',
  ],
  'test-automation-skill-testcontainers': ['jest-testcontainers-postgres'],
  'test-automation-skill-nx': ['nx-affected-quality-gates'],
  'test-automation-skill-github-actions': [
    'nx-affected-quality-gates',
    'container-health-smoke-tests',
  ],
  'test-automation-skill-docker': ['container-health-smoke-tests'],
  'test-automation-skill-typescript': ['service-generator-unit-tests'],
  'test-automation-skill-prometheus': ['prometheus-alert-rule-tests'],
  'test-automation-skill-promtool': ['prometheus-alert-rule-tests'],
} as const;

const approvedPublicSkillText = [
  'AWS CodeBuild',
  'Evidence-backed Test Automation capability with AWS CodeBuild.',
  'PostgreSQL',
  'Evidence-backed Test Automation capability with PostgreSQL.',
  'AWS Systems Manager Parameter Store',
  'Evidence-backed Test Automation capability with AWS Systems Manager Parameter Store.',
  'Jest',
  'Evidence-backed Test Automation capability with Jest.',
  'Testcontainers',
  'Evidence-backed Test Automation capability with Testcontainers.',
  'Nx',
  'Evidence-backed Test Automation capability with Nx.',
  'GitHub Actions',
  'Evidence-backed Test Automation capability with GitHub Actions.',
  'Docker',
  'Evidence-backed Test Automation capability with Docker.',
  'TypeScript',
  'Evidence-backed Test Automation capability with TypeScript.',
  'Prometheus',
  'Evidence-backed Test Automation capability with Prometheus.',
  'promtool',
  'Evidence-backed Test Automation capability with promtool.',
] as const;

describe('testAutomationSkillEvidenceItems', () => {
  it('stores exactly the approved skill IDs and titles in workflow order', () => {
    expect(
      testAutomationSkillEvidenceItems.map(({ id, title }) => [id, title]),
    ).toEqual(expectedSkillSet);
  });

  it('orders skills by earliest support date while keeping workflow ties stable', () => {
    const experienceById = new Map(
      testAutomationEvidenceItems.map((item) => [item.id, item]),
    );
    const chronology = testAutomationSkillEvidenceItems.map((skill) => {
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
      ['AWS CodeBuild', '2019-03-06'],
      ['PostgreSQL', '2019-03-06'],
      ['AWS Systems Manager Parameter Store', '2019-03-06'],
      ['Jest', '2024-02-28'],
      ['Testcontainers', '2024-02-28'],
      ['Nx', '2024-02-28'],
      ['GitHub Actions', '2024-02-28'],
      ['Docker', '2024-02-28'],
      ['TypeScript', '2024-02-28'],
      ['Prometheus', '2024-02-28'],
      ['promtool', '2024-02-28'],
    ]);

    for (let index = 1; index < chronology.length; index += 1) {
      expect(
        (chronology[index]?.[1] ?? '') >= (chronology[index - 1]?.[1] ?? ''),
      ).toBe(true);
    }
  });

  it('links each public skill to its approved public Test Automation experience', () => {
    const experienceById = new Map(
      testAutomationEvidenceItems.map((item) => [item.id, item]),
    );

    for (const skill of testAutomationSkillEvidenceItems) {
      expect(skill).toMatchObject({
        label: skill.title,
        type: 'skill',
        capabilityKeys: ['test-automation'],
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
        expect(support?.capabilityKeys).toContain('test-automation');
      }
    }
  });

  it('keeps the published skill catalog public-safe and reviewable', () => {
    expectPublicSafeEvidence(
      testAutomationSkillEvidenceItems,
      approvedPublicSkillText,
    );
  });
});
