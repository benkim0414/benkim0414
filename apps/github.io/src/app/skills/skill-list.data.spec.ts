import {
  highlightedSkillIds,
  highlightedSkills,
  sampleSkills,
  skills,
} from './skill-list.data';
import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { kubernetesCertifications } from '../certifications/kubernetes-certifications.data';

describe('skill-list data', () => {
  const doraSkillCatalogCoverage = {
    AWS: 'AWS IAM',
    'Conventional Commits': 'Git',
    'GitHub API': 'GitHub',
    GitOps: 'Argo CD',
    Husky: 'Git',
    IRSA: 'AWS IAM',
    'Kubernetes RBAC': 'Kubernetes',
    'OpenID Connect': 'AWS IAM',
    kubectl: 'Kubernetes',
    promtool: 'Prometheus',
  } as const satisfies Record<string, string>;

  const hiddenDoraSkillNames = new Set(Object.keys(doraSkillCatalogCoverage));

  it('keeps sampleSkills as a compatibility alias for the local catalog', () => {
    expect(sampleSkills).toBe(skills);
  });

  it('defines the evidence-backed top five highlighted skills in order', () => {
    expect(highlightedSkillIds).toEqual([
      'kubernetes',
      'github-actions',
      'nx',
      'terraform',
      'docker',
    ]);
    expect(highlightedSkills.map((skill) => skill.id)).toEqual([
      'kubernetes',
      'github-actions',
      'nx',
      'terraform',
      'docker',
    ]);
  });

  it('resolves highlighted skills from the local catalog without missing IDs', () => {
    const catalogIds = new Set(skills.map((skill) => skill.id));

    expect(highlightedSkills).toHaveLength(5);
    expect(highlightedSkillIds.every((id) => catalogIds.has(id))).toBe(true);
    expect(new Set(highlightedSkillIds).size).toBe(highlightedSkillIds.length);
  });

  it('stores the requested local skill catalog', () => {
    expect(skills.map((skill) => skill.id)).toEqual([
      'alertmanager',
      'alloy',
      'amazon-ecr',
      'amazon-eks',
      'argo-cd',
      'aws-codebuild',
      'aws-codepipeline',
      'aws-eventbridge',
      'aws-iam',
      'aws-lambda',
      'aws-systems-manager-parameter-store',
      'claude-code',
      'docker',
      'expo',
      'git',
      'github',
      'github-actions',
      'go',
      'grafana',
      'helm',
      'jest',
      'kubernetes',
      'kustomize',
      'loki',
      'markdown',
      'neovim',
      'nx',
      'postgresql',
      'prometheus',
      'react',
      'sealed-secrets',
      'storybook',
      'swift',
      'terraform',
      'testcontainers',
      'tmux',
      'typescript',
      'yaml',
      'zsh',
    ]);
  });

  it('uses the official Argo CD product title without the generic Argo duplicate', () => {
    expect(skills.map((skill) => skill.name)).toContain('Argo CD');
    expect(skills.map((skill) => skill.name)).not.toContain('Argo');
  });

  it('includes product-level DORA capability skill evidence in the local catalog', () => {
    const catalogNames = new Set(skills.map((skill) => skill.name));
    const doraSkillNames = Array.from(
      new Set(
        devOpsCapabilityEvidenceItems
          .filter((item) => item.type === 'skill')
          .map((item) => item.title),
      ),
    ).sort((left, right) => left.localeCompare(right));

    expect(
      doraSkillNames.filter(
        (name) => !catalogNames.has(name) && !hiddenDoraSkillNames.has(name),
      ),
    ).toEqual([]);
  });

  it('covers DORA sub-features and command-line tools with broader product cards', () => {
    const catalogNames = new Set(skills.map((skill) => skill.name));

    for (const [hiddenDoraSkillName, coveringCatalogName] of Object.entries(
      doraSkillCatalogCoverage,
    )) {
      expect(catalogNames.has(hiddenDoraSkillName)).toBe(false);
      expect(catalogNames.has(coveringCatalogName)).toBe(true);
    }
  });

  it('stores skills alphabetically by display name', () => {
    expect(skills.map((skill) => skill.name)).toEqual(
      [...skills]
        .map((skill) => skill.name)
        .sort((left, right) => left.localeCompare(right)),
    );
  });

  it('stores the requested self-rated skill confidence values', () => {
    expect(
      Object.fromEntries(skills.map((skill) => [skill.id, skill.confidence])),
    ).toMatchObject({
      typescript: 4,
      react: 3,
      terraform: 3,
      docker: 3,
      'github-actions': 3,
      storybook: 2,
      'claude-code': 4,
      neovim: 4,
      zsh: 3,
      tmux: 4,
      grafana: 3,
      go: 3,
      'argo-cd': 3,
      swift: 2,
      expo: 2,
    });
  });

  it('stores recruiter-readable primary use labels for every skill', () => {
    expect(skills.every((skill) => skill.primaryUse.trim().length > 0)).toBe(
      true,
    );
    expect(
      Object.fromEntries(skills.map((skill) => [skill.id, skill.primaryUse])),
    ).toMatchObject({
      kubernetes: 'Cloud-native platform operations',
      react: 'Interactive web interfaces',
      terraform: 'Infrastructure provisioning',
      'github-actions': 'Repository automation and CI/CD',
      nx: 'Monorepo quality gates',
    });
  });

  it('uses a Kubernetes logo slug for Kubernetes', () => {
    expect(skills.find((skill) => skill.id === 'kubernetes')?.iconSlug).toBe(
      'kubernetes',
    );
  });

  it('keeps highlighted descriptions public-safe and evidence-backed', () => {
    expect(
      highlightedSkills.find((skill) => skill.id === 'kubernetes')?.description,
    ).toBe(
      'Cloud-native workload operations, troubleshooting, and infrastructure practice backed by Kubernetes certification evidence.',
    );
    expect(
      highlightedSkills.find((skill) => skill.id === 'github-actions')
        ?.description,
    ).toBe(
      'CI/CD workflow ownership across integration, delivery, and deployment automation.',
    );
    expect(
      highlightedSkills.find((skill) => skill.id === 'nx')?.description,
    ).toBe(
      'Monorepo quality gates for lint, build, test, and type-check workflows.',
    );
    expect(
      highlightedSkills.find((skill) => skill.id === 'terraform')?.description,
    ).toBe(
      'Reproducible infrastructure and scoped IAM policy management with Terraform.',
    );
    expect(
      highlightedSkills.find((skill) => skill.id === 'docker')?.description,
    ).toBe(
      'Container packaging, delivery workflow support, and immutable image deployment practice.',
    );
  });

  it('stores CNCF certifications on the Kubernetes carousel skill', () => {
    const kubernetesSkill = skills.find((skill) => skill.id === 'kubernetes');
    const certifications = kubernetesSkill?.certifications;

    expect(certifications?.map((certification) => certification.title)).toEqual(
      ['KCNA', 'CKAD', 'CKA'],
    );
    expect(kubernetesSkill?.certifications).toEqual([
      kubernetesCertifications.kcna,
      kubernetesCertifications.ckad,
      kubernetesCertifications.cka,
    ]);
    expect(certifications?.[0]).toBe(kubernetesCertifications.kcna);
    expect(certifications?.[1]).toBe(kubernetesCertifications.ckad);
    expect(certifications?.[2]).toBe(kubernetesCertifications.cka);
    expect(
      new Set(
        certifications?.map((certification) => certification.citationIcon),
      ).size,
    ).toBe(3);
  });
});
