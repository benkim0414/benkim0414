import { deploymentAutomationEvidenceItems } from './deployment-automation-evidence.data';
import { deploymentAutomationSkillEvidenceItems } from './deployment-automation-skill-evidence.data';

const expectedTitles = [
  'AWS CodePipeline',
  'Terraform',
  'GitHub Actions',
  'Argo CD',
  'GitOps',
  'Docker',
  'Amazon ECR',
  'Kubernetes',
  'OpenID Connect',
  'Nx',
  'GitHub API',
  'Kustomize',
  'Sealed Secrets',
] as const;

const expectedSupport = {
  'AWS CodePipeline': ['codepipeline-approval-gated-deployment'],
  Terraform: ['codepipeline-approval-gated-deployment'],
  Docker: ['deployment-traceability-chain', 'image-digest-deployments'],
  'Amazon ECR': ['deployment-traceability-chain', 'image-digest-deployments'],
  Kubernetes: [
    'environment-neutral-deployment-mechanism',
    'automated-sealed-secret-delivery',
    'deterministic-kubernetes-overlays',
  ],
  'GitHub Actions': [
    'merge-triggered-deployment-path',
    'github-actions-gitops-handoff',
  ],
  'OpenID Connect': ['merge-triggered-deployment-path'],
  Nx: ['generator-based-service-onboarding', 'merge-triggered-deployment-path'],
  'GitHub API': ['merge-triggered-deployment-path'],
  Kustomize: [
    'environment-neutral-deployment-mechanism',
    'deterministic-kubernetes-overlays',
  ],
  'Argo CD': [
    'github-actions-gitops-handoff',
    'automated-sealed-secret-delivery',
  ],
  GitOps: [
    'github-actions-gitops-handoff',
    'environment-neutral-deployment-mechanism',
  ],
  'Sealed Secrets': ['automated-sealed-secret-delivery'],
} as const;

describe('deploymentAutomationSkillEvidenceItems', () => {
  it('stores the approved skills in display order', () => {
    expect(deploymentAutomationSkillEvidenceItems.map(({ title }) => title)).toEqual(
      expectedTitles,
    );
  });

  it('links every skill to its approved deployment automation experience', () => {
    for (const skill of deploymentAutomationSkillEvidenceItems) {
      expect(skill.supportingEvidenceIds).toEqual(
        expectedSupport[skill.title as keyof typeof expectedSupport],
      );
    }
  });

  it('orders skills by nondecreasing earliest supporting period', () => {
    const experienceById = new Map(
      deploymentAutomationEvidenceItems.map((item) => [item.id, item]),
    );
    const earliestDates = deploymentAutomationSkillEvidenceItems.map((skill) =>
      skill.supportingEvidenceIds
        ?.map((id) => experienceById.get(id)?.details?.period.startedAt)
        .filter((date): date is string => Boolean(date))
        .sort()[0],
    );

    expect(earliestDates).toEqual([...earliestDates].sort());
  });

  it('exposes public supporting deployment automation skill records', () => {
    for (const skill of deploymentAutomationSkillEvidenceItems) {
      expect(skill.type).toBe('skill');
      expect(skill.capabilityKeys).toEqual(['deployment-automation']);
      expect(skill.technologies).toEqual([skill.title]);
      expect(skill.isPublic).toBe(true);
      expect(skill.strength).toBe('supporting');
    }
  });

  it('resolves support to public compatible experiences', () => {
    const experienceById = new Map(
      deploymentAutomationEvidenceItems.map((item) => [item.id, item]),
    );

    for (const skill of deploymentAutomationSkillEvidenceItems) {
      expect(skill.supportingEvidenceIds?.length).toBeGreaterThan(0);

      for (const supportId of skill.supportingEvidenceIds ?? []) {
        const support = experienceById.get(supportId);
        expect(support, `${skill.id} support ${supportId}`).toBeDefined();
        expect(support?.type).toBe('experience');
        expect(support?.isPublic).toBe(true);
        expect(support?.capabilityKeys).toContain('deployment-automation');
      }
    }
  });

  it('keeps public skill text free of sensitive identifiers', () => {
    const publicText = JSON.stringify(deploymentAutomationSkillEvidenceItems);

    expect(publicText).not.toMatch(/https?:\/\//);
    expect(publicText).not.toMatch(/\b\d{12}\b/);
    expect(publicText).not.toMatch(/employer|customer|client|organization/i);
  });
});
