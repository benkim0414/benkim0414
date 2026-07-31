import type { Skill } from './skill-list.types';

export const skills: readonly Skill[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'Typed JavaScript for building reliable applications.',
    categories: ['Language'],
    level: 5,
    iconSlug: 'typescript',
    keywords: ['javascript', 'typed', 'frontend', 'node'],
  },
  {
    id: 'react',
    name: 'React',
    description: 'Component-based UI library for interactive web interfaces.',
    categories: ['Framework'],
    level: 5,
    iconSlug: 'react',
    keywords: ['frontend', 'ui', 'components'],
  },
  {
    id: 'nx',
    name: 'Nx',
    description:
      'Monorepo quality gates for lint, build, test, and type-check workflows.',
    categories: ['Build', 'Tooling'],
    level: 4,
    iconSlug: 'nx',
    keywords: [
      'monorepo',
      'workspace',
      'build system',
      'affected',
      'quality gates',
    ],
  },
  {
    id: 'aws',
    name: 'AWS',
    description: 'Cloud platform for scalable infrastructure and services.',
    categories: ['Cloud'],
    level: 4,
    iconSlug: 'amazonaws',
    keywords: ['cloud', 'infrastructure', 'iam', 'irsa'],
  },
  {
    id: 'terraform',
    name: 'Terraform',
    description:
      'Reproducible infrastructure and scoped IAM policy management with Terraform.',
    categories: ['IaC', 'Cloud'],
    level: 4,
    iconSlug: 'terraform',
    keywords: [
      'infrastructure as code',
      'provisioning',
      'iam',
      'irsa',
      'policy',
    ],
  },
  {
    id: 'docker',
    name: 'Docker',
    description:
      'Container packaging, delivery workflow support, and immutable image deployment practice.',
    categories: ['Container', 'Runtime'],
    level: 4,
    iconSlug: 'docker',
    keywords: [
      'container',
      'image',
      'runtime',
      'delivery',
      'digest',
      'deployment',
    ],
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    description:
      'Cloud-native workload operations, troubleshooting, and infrastructure practice backed by Kubernetes certification evidence.',
    categories: ['Container', 'Cloud'],
    level: 4,
    iconSlug: 'kubernetes',
    keywords: [
      'containers',
      'orchestration',
      'platform',
      'cloud native',
      'kubectl',
      'cluster operations',
      'irsa',
    ],
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    description:
      'CI/CD workflow ownership across integration, delivery, and deployment automation.',
    categories: ['CI/CD'],
    level: 4,
    iconSlug: 'githubactions',
    keywords: ['ci', 'cd', 'automation', 'workflow', 'delivery', 'deployment'],
  },
  {
    id: 'storybook',
    name: 'Storybook',
    description:
      'Development environment for building and testing UI components.',
    categories: ['Design System', 'Testing'],
    level: 4,
    iconSlug: 'storybook',
    keywords: ['components', 'ui', 'visual testing'],
  },
];

export const highlightedSkillIds = [
  'kubernetes',
  'github-actions',
  'nx',
  'terraform',
  'docker',
] as const;

export const highlightedSkills: readonly Skill[] = highlightedSkillIds.map(
  (id) => {
    const skill = skills.find((candidate) => candidate.id === id);

    if (!skill) {
      throw new Error(`Highlighted skill "${id}" is missing from skills.`);
    }

    return skill;
  },
);

export const sampleSkills = skills;
