import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import { versionControlEvidenceItems } from './version-control-evidence.data';
import { versionControlSkillEvidenceItems } from './version-control-skill-evidence.data';

const expectedTitles = [
  'Git',
  'GitHub',
  'AWS CodePipeline',
  'Terraform',
  'Docker',
  'Helm',
  'Conventional Commits',
  'Husky',
  'Nx',
  'GitHub Actions',
  'Kustomize',
  'Argo CD',
  'Kubernetes',
] as const;

const expectedSupport = {
  Git: [
    'codepipeline-webhook-trunk',
    'merge-commit-history',
    'conventional-commit-governance',
  ],
  GitHub: [
    'codepipeline-webhook-trunk',
    'github-actions-gitops-handoff',
    'merge-commit-history',
  ],
  'AWS CodePipeline': [
    'codepipeline-webhook-trunk',
    'terraform-codepipeline-platform',
  ],
  Terraform: ['terraform-codepipeline-platform'],
  Docker: [
    'reusable-helm-deployment-image',
    'gitops-same-package-environments',
  ],
  Helm: ['reusable-helm-deployment-image'],
  'Conventional Commits': ['conventional-commit-governance'],
  Husky: ['conventional-commit-governance'],
  Nx: ['github-actions-gitops-handoff'],
  'GitHub Actions': ['github-actions-gitops-handoff'],
  Kustomize: [
    'github-actions-gitops-handoff',
    'argocd-environment-state-from-version-control',
    'gitops-same-package-environments',
  ],
  'Argo CD': [
    'github-actions-gitops-handoff',
    'argocd-environment-state-from-version-control',
    'argocd-automated-database-migrations',
  ],
  Kubernetes: [
    'argocd-environment-state-from-version-control',
    'argocd-automated-database-migrations',
  ],
} as const;

describe('versionControlSkillEvidenceItems', () => {
  it('stores the approved skills in display order', () => {
    expect(versionControlSkillEvidenceItems.map(({ title }) => title)).toEqual(
      expectedTitles,
    );
  });

  it('links each skill to its approved Version Control evidence', () => {
    expect(
      Object.fromEntries(
        versionControlSkillEvidenceItems.map(
          ({ title, supportingEvidenceIds }) => [title, supportingEvidenceIds],
        ),
      ),
    ).toEqual(expectedSupport);
  });

  it('orders skills by earliest supporting experience date', () => {
    const experienceById = new Map(
      [
        ...continuousIntegrationEvidenceItems,
        ...continuousDeliveryEvidenceItems,
        ...versionControlEvidenceItems,
      ].map((item) => [item.id, item]),
    );
    const earliestDates = versionControlSkillEvidenceItems.map(
      (skill) =>
        (skill.supportingEvidenceIds ?? [])
          .map((id) => experienceById.get(id)?.details?.period.startedAt)
          .filter((date): date is string => Boolean(date))
          .sort()[0],
    );

    expect(earliestDates).toEqual([...earliestDates].sort());
  });

  it('resolves every support ID to capability-compatible public experience', () => {
    const experienceById = new Map(
      versionControlEvidenceItems.map((item) => [item.id, item]),
    );

    for (const skill of versionControlSkillEvidenceItems) {
      expect(skill).toMatchObject({
        type: 'skill',
        capabilityKeys: ['version-control'],
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
        expect(support?.capabilityKeys).toContain('version-control');
      }
    }
  });

  it('uses Conventional Commits as the skill rather than commitlint', () => {
    expect(
      versionControlSkillEvidenceItems.map(({ title }) => title),
    ).not.toContain('commitlint');
  });
});
