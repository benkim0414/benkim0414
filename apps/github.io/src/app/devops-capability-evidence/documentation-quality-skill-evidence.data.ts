import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const documentationQualitySkillDefinitions = [
  {
    id: 'documentation-quality-skill-markdown',
    name: 'Markdown',
    supports: [
      'structured-documentation-corpus',
      'indexed-solution-documentation',
      'documentation-frontmatter-contracts',
      'current-documentation-maintenance',
      'documentation-change-integration',
      'cross-verified-documentation-claims',
    ],
  },
  {
    id: 'documentation-quality-skill-yaml',
    name: 'YAML',
    supports: ['documentation-frontmatter-contracts'],
  },
  {
    id: 'documentation-quality-skill-git',
    name: 'Git',
    supports: [
      'current-documentation-maintenance',
      'documentation-change-integration',
    ],
  },
] as const;

export const documentationQualitySkillEvidenceItems: readonly CapabilityEvidenceItem[] =
  documentationQualitySkillDefinitions.map(({ id, name, supports }) => ({
    id,
    title: name,
    label: name,
    type: 'skill',
    capabilityKeys: ['documentation-quality'],
    summary: `Evidence-backed Documentation Quality capability with ${name}.`,
    technologies: [name],
    isPublic: true,
    strength: 'supporting',
    supportingEvidenceIds: supports,
  }));
