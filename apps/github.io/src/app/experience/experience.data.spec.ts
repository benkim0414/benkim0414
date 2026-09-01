import {
  devOpsCapabilityEvidenceItems,
} from '../devops-capability-evidence/devops-capability-evidence.data';
import { sampleProjects } from '../projects/project-list.data';
import { skills } from '../skills/skill-list.data';
import { experiences } from './experience.data';
import type { Experience } from './experience.types';

describe('experiences', () => {
  it('contains stable unique experience IDs', () => {
    const ids = experiences.map(({ id }) => id);

    expect(ids).toContain('aws-codepipeline-codebuild-multistage-delivery');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps every production experience public and non-sensitive', () => {
    const productionExperiences: readonly Experience[] = experiences;

    expect(experiences).not.toHaveLength(0);
    expect(
      productionExperiences.every(
        ({ isPublic, isSensitive }) => isPublic && isSensitive !== true,
      ),
    ).toBe(true);
  });

  it('links only to existing skills, projects, and supporting evidence', () => {
    const skillIds = new Set(skills.map(({ id }) => id));
    const projectIds = new Set(sampleProjects.map(({ id }) => id));
    const evidenceById = new Map(
      devOpsCapabilityEvidenceItems.map((item) => [item.id, item]),
    );

    for (const experience of experiences) {
      for (const skillId of experience.skillIds) {
        expect(skillIds.has(skillId)).toBe(true);
      }

      for (const projectId of experience.projectIds) {
        expect(projectIds.has(projectId)).toBe(true);
      }

      for (const evidenceId of experience.supportingEvidenceIds ?? []) {
        const evidence = evidenceById.get(evidenceId);

        expect(evidence).toBeDefined();
        expect(evidence?.isPublic).toBe(true);
        expect(evidence?.isSensitive).not.toBe(true);
      }
    }
  });

  it('authors the AWS CI/CD narrative as reusable text-heavy content', () => {
    const experience = experiences.find(
      ({ id }) => id === 'aws-codepipeline-codebuild-multistage-delivery',
    );

    expect(experience).toMatchObject({
      title: 'Multi-stage AWS CI/CD delivery pipeline',
      summary:
        'Built AWS CodePipeline and CodeBuild automation for staging and production delivery with build validation, artifact handoff, and controlled promotion.',
      skillIds: expect.arrayContaining([
        'aws-codepipeline',
        'aws-codebuild',
        'terraform',
      ]),
      projectIds: ['homelab'],
      capabilityKeys: expect.arrayContaining([
        'continuous-integration',
        'continuous-delivery',
        'deployment-automation',
      ]),
      technologies: expect.arrayContaining([
        'AWS CodePipeline',
        'AWS CodeBuild',
      ]),
      isPublic: true,
    });
    expect(experience?.narrative).toHaveLength(3);
    expect(experience?.environments?.map(({ label }) => label)).toEqual([
      'Staging',
      'Production',
    ]);
  });

  it('declares a kind on every entry', () => {
    for (const experience of experiences) {
      expect(['professional', 'personal']).toContain(experience.kind);
    }
  });

  const professionalExperienceIds = [
    'nx-monorepo-service-consolidation',
    'eks-platform-operations',
    'production-observability-stack',
    'production-reliability-engineering',
    'gitops-deployment-reliability',
    'identity-access-hardening',
  ] as const;

  it('contains the six professional experience entries', () => {
    const ids = experiences.map(({ id }) => id);

    for (const professionalId of professionalExperienceIds) {
      expect(ids).toContain(professionalId);
    }
  });

  it('authors professional entries as public-safe capability narratives', () => {
    const professionalExperiences = experiences.filter(
      ({ kind }) => kind === 'professional',
    );

    expect(professionalExperiences.map(({ id }) => id).sort()).toEqual(
      [...professionalExperienceIds].sort(),
    );

    for (const experience of professionalExperiences) {
      expect(experience.narrative).toHaveLength(3);
      expect(experience.role).toBe('Platform engineer');
      expect(experience.organization).toBeUndefined();
      expect(experience.projectIds).toEqual([]);
      expect(experience.supportingEvidenceIds).toBeUndefined();
      expect(experience.period?.startedAt).toMatch(/^\d{4}-\d{2}$/);
      expect(experience.period?.endedAt).toBeUndefined();
    }
  });

  it('contains no issue-tracker ticket references in any entry', () => {
    const ticketKeyPattern = /\b[A-Z][A-Z0-9]+-\d+\b/;

    for (const experience of experiences) {
      expect(JSON.stringify(experience)).not.toMatch(ticketKeyPattern);
    }
  });
});
