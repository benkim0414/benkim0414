import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { sampleProjects } from '../projects/project-list.data';
import { skills } from '../skills/skill-list.data';
import { experiences } from './experience.data';

describe('experiences', () => {
  it('contains stable unique experience IDs', () => {
    const ids = experiences.map(({ id }) => id);

    expect(ids).toContain('aws-codepipeline-codebuild-multistage-delivery');
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps every production experience public and non-sensitive', () => {
    expect(experiences).not.toHaveLength(0);
    expect(
      experiences.every(
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
});
