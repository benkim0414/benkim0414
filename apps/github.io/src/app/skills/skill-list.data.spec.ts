import {
  highlightedSkillIds,
  highlightedSkills,
  sampleSkills,
  skills,
} from './skill-list.data';

describe('skill-list data', () => {
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

  it('stores the requested local skill catalog without AWS', () => {
    expect(skills.map((skill) => skill.id)).toEqual([
      'typescript',
      'react',
      'nx',
      'terraform',
      'docker',
      'kubernetes',
      'github-actions',
      'storybook',
      'claude-code',
      'neovim',
      'zsh',
      'tmux',
      'grafana',
      'go',
      'argo',
      'swift',
      'expo',
    ]);
  });

  it('stores the requested skill scores as levels', () => {
    expect(
      Object.fromEntries(skills.map((skill) => [skill.id, skill.level])),
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
      argo: 3,
      swift: 2,
      expo: 2,
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

  it('does not publish placeholder certification links in the local catalog', () => {
    expect(
      skills.find((skill) => skill.id === 'kubernetes')?.certifications,
    ).toBeUndefined();
  });
});
