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
      highlightedSkills.find((skill) => skill.id === 'terraform')
        ?.description,
    ).toBe(
      'Reproducible infrastructure and scoped IAM policy management with Terraform.',
    );
    expect(
      highlightedSkills.find((skill) => skill.id === 'docker')?.description,
    ).toBe(
      'Container packaging, delivery workflow support, and immutable image deployment practice.',
    );
  });
});
