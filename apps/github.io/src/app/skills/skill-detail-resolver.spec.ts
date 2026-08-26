import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { experiences } from '../experience/experience.data';
import { sampleProjects } from '../projects/project-list.data';
import { skillDetailRecords } from './skill-detail.data';
import { resolveSkillDetail } from './skill-detail-resolver';
import { skills } from './skill-list.data';

const productionSources = {
  skills,
  detailRecords: skillDetailRecords,
  evidenceItems: devOpsCapabilityEvidenceItems,
  projects: sampleProjects,
  experiences,
};

describe('resolveSkillDetail', () => {
  it('resolves Kubernetes enrichment in its authored order', () => {
    const result = resolveSkillDetail('kubernetes', productionSources);

    expect(result.status).toBe('found');
    if (result.status !== 'found') return;

    expect(result.value.skill.name).toBe('Kubernetes');
    expect(result.value.experiences.map(({ id }) => id)).toEqual([
      'aws-codepipeline-codebuild-multistage-delivery',
    ]);
    expect(result.value.experienceEvidence.map(({ id }) => id)).toEqual([
      'argocd-environment-state-from-version-control',
      'deterministic-kubernetes-overlays',
      'reusable-kubernetes-deployment-foundations',
    ]);
    expect(result.value.experienceEvidence).toHaveLength(3);
    expect(
      result.value.experienceEvidence.every(({ type }) => type === 'experience'),
    ).toBe(true);
    expect(result.value.projects.map(({ id }) => id)).toEqual(['homelab']);
    expect(result.value).not.toHaveProperty('experienceSummary');
  });

  it('resolves a known skill without invented enrichment', () => {
    const result = resolveSkillDetail('react', productionSources);

    expect(result.status).toBe('found');
    if (result.status !== 'found') return;

    expect(result.value.experiences).toEqual([]);
    expect(result.value.experienceEvidence).toEqual([]);
    expect(result.value.projects).toEqual([]);
    expect(result.value).not.toHaveProperty('experienceSummary');
  });

  it('distinguishes an unknown skill from a basic known skill', () => {
    expect(resolveSkillDetail('unknown-skill', productionSources)).toEqual({
      status: 'not-found',
    });
  });

  it('rejects missing, private, and sensitive evidence references', () => {
    const kubernetesDetail = skillDetailRecords[0];

    expect(() =>
      resolveSkillDetail('kubernetes', {
        ...productionSources,
        detailRecords: [
          { ...kubernetesDetail, experienceEvidenceIds: ['missing-evidence'] },
        ],
      }),
    ).toThrow('missing evidence "missing-evidence"');

    for (const evidence of [
      { ...devOpsCapabilityEvidenceItems[0], id: 'private', isPublic: false },
      {
        ...devOpsCapabilityEvidenceItems[0],
        id: 'sensitive',
        isPublic: true,
        isSensitive: true,
      },
    ]) {
      expect(() =>
        resolveSkillDetail('kubernetes', {
          ...productionSources,
          detailRecords: [
            { ...kubernetesDetail, experienceEvidenceIds: [evidence.id] },
          ],
          evidenceItems: [...devOpsCapabilityEvidenceItems, evidence],
        }),
      ).toThrow(/public, non-sensitive evidence/);
    }
  });

  it('rejects a public, non-sensitive non-experience evidence reference', () => {
    const projectEvidence = {
      ...devOpsCapabilityEvidenceItems[0],
      id: 'project-evidence',
      type: 'project' as const,
      isPublic: true,
      isSensitive: false,
    };

    expect(() =>
      resolveSkillDetail('kubernetes', {
        ...productionSources,
        detailRecords: [
          {
            ...skillDetailRecords[0],
            experienceEvidenceIds: [projectEvidence.id],
          },
        ],
        evidenceItems: [...devOpsCapabilityEvidenceItems, projectEvidence],
      }),
    ).toThrow('must reference experience evidence; received "project-evidence"');
  });

  it('rejects missing, private, and sensitive experience references', () => {
    const kubernetesDetail = skillDetailRecords[0];

    expect(() =>
      resolveSkillDetail('kubernetes', {
        ...productionSources,
        detailRecords: [
          { ...kubernetesDetail, experienceIds: ['missing-experience'] },
        ],
      }),
    ).toThrow('missing experience "missing-experience"');

    for (const experience of [
      { ...experiences[0], id: 'private-experience', isPublic: false },
      {
        ...experiences[0],
        id: 'sensitive-experience',
        isPublic: true,
        isSensitive: true,
      },
    ]) {
      expect(() =>
        resolveSkillDetail('kubernetes', {
          ...productionSources,
          detailRecords: [
            { ...kubernetesDetail, experienceIds: [experience.id] },
          ],
          experiences: [...experiences, experience],
        }),
      ).toThrow(/public, non-sensitive experience/);
    }
  });

  it('rejects experience references that are not linked back to the skill', () => {
    const crossSkillExperience = {
      ...experiences[0],
      id: 'cross-skill-experience',
      skillIds: ['react'],
    };

    expect(() =>
      resolveSkillDetail('kubernetes', {
        ...productionSources,
        detailRecords: [
          {
            ...skillDetailRecords[0],
            experienceIds: [crossSkillExperience.id],
          },
        ],
        experiences: [...experiences, crossSkillExperience],
      }),
    ).toThrow(
      'Skill detail "kubernetes" references experience "cross-skill-experience" that is not linked to the skill.',
    );
  });

  it('rejects duplicate experience source IDs before resolving references', () => {
    expect(() =>
      resolveSkillDetail('kubernetes', {
        ...productionSources,
        experiences: [
          ...experiences,
          { ...experiences[0], title: 'Unexpected duplicate experience' },
        ],
      }),
    ).toThrow(
      'Duplicate experience source ID "aws-codepipeline-codebuild-multistage-delivery".',
    );
  });

  it('rejects duplicate detail records before a later record can bypass validation', () => {
    const privateEvidence = {
      ...devOpsCapabilityEvidenceItems[0],
      id: 'private-duplicate-record-evidence',
      isPublic: false,
    };

    expect(() =>
      resolveSkillDetail('kubernetes', {
        ...productionSources,
        detailRecords: [
          skillDetailRecords[0],
          {
            ...skillDetailRecords[0],
            experienceEvidenceIds: [privateEvidence.id],
          },
        ],
        evidenceItems: [...devOpsCapabilityEvidenceItems, privateEvidence],
      }),
    ).toThrow('Duplicate skill detail record for "kubernetes".');
  });

  it('rejects missing project references', () => {
    expect(() =>
      resolveSkillDetail('kubernetes', {
        ...productionSources,
        detailRecords: [
          { ...skillDetailRecords[0], projectIds: ['missing-project'] },
        ],
      }),
    ).toThrow('missing project "missing-project"');
  });

  // Production mutation caught: removing project-source collision detection
  // lets the later duplicate silently replace the referenced project.
  it('rejects duplicate project source IDs before resolving references', () => {
    expect(() =>
      resolveSkillDetail('kubernetes', {
        ...productionSources,
        projects: [
          ...sampleProjects,
          { ...sampleProjects[1], title: 'Unexpected duplicate project' },
        ],
      }),
    ).toThrow('Duplicate project source ID "homelab".');
  });

  it('validates every production detail record', () => {
    for (const detail of skillDetailRecords) {
      expect(resolveSkillDetail(detail.skillId, productionSources)).toMatchObject({
        status: 'found',
      });
    }
  });
});
