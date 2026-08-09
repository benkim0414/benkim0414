import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const trunkBasedDevelopmentSkillDefinitions = [
  {
    id: 'trunk-based-development-skill-git',
    name: 'Git',
    supportingEvidenceIds: [
      'single-trunk-repository-flow',
      'short-lived-branch-flow',
      'small-change-landings',
      'merge-commit-history',
      'conventional-commit-governance',
    ],
  },
  {
    id: 'trunk-based-development-skill-github',
    name: 'GitHub',
    supportingEvidenceIds: [
      'single-trunk-repository-flow',
      'short-lived-branch-flow',
      'merge-commit-history',
      'nx-affected-quality-gates',
    ],
  },
  {
    id: 'trunk-based-development-skill-nx',
    name: 'Nx',
    supportingEvidenceIds: ['nx-affected-quality-gates'],
  },
  {
    id: 'trunk-based-development-skill-github-actions',
    name: 'GitHub Actions',
    supportingEvidenceIds: ['nx-affected-quality-gates'],
  },
  {
    id: 'trunk-based-development-skill-conventional-commits',
    name: 'Conventional Commits',
    supportingEvidenceIds: ['conventional-commit-governance'],
  },
  {
    id: 'trunk-based-development-skill-husky',
    name: 'Husky',
    supportingEvidenceIds: ['conventional-commit-governance'],
  },
] as const;

export const trunkBasedDevelopmentSkillEvidenceItems: readonly CapabilityEvidenceItem[] =
  trunkBasedDevelopmentSkillDefinitions.map(
    ({ id, name, supportingEvidenceIds }) => ({
      id,
      title: name,
      label: name,
      type: 'skill',
      capabilityKeys: ['trunk-based-development'],
      summary: `Evidence-backed Trunk-Based Development capability with ${name}.`,
      technologies: [name],
      isPublic: true,
      strength: 'strong',
      supportingEvidenceIds,
    }),
  );
