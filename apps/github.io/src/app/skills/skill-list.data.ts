import { cncfCertificationBadges } from '../certifications/cncf-certification-badges';
import type { Skill } from './skill-list.types';

export const skills: readonly Skill[] = [
  {
    id: 'argo',
    name: 'Argo',
    description: 'GitOps and workflow tooling for Kubernetes delivery.',
    categories: ['CI/CD', 'Cloud'],
    level: 3,
    iconSlug: 'argo',
    keywords: ['gitops', 'argocd', 'kubernetes', 'delivery'],
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description:
      'Agentic coding assistant for repository-aware development workflows.',
    categories: ['Tooling'],
    level: 4,
    iconSlug: 'claudecode',
    keywords: ['ai', 'agentic coding', 'code assistant', 'development'],
  },
  {
    id: 'docker',
    name: 'Docker',
    description:
      'Container packaging, delivery workflow support, and immutable image deployment practice.',
    categories: ['Container', 'Runtime'],
    level: 3,
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
    id: 'expo',
    name: 'Expo',
    description: 'React Native framework for shipping mobile applications.',
    categories: ['Framework'],
    level: 2,
    iconSlug: 'expo',
    keywords: ['react native', 'mobile', 'ios', 'android'],
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    description:
      'CI/CD workflow ownership across integration, delivery, and deployment automation.',
    categories: ['CI/CD'],
    level: 3,
    iconSlug: 'githubactions',
    keywords: ['ci', 'cd', 'automation', 'workflow', 'delivery', 'deployment'],
  },
  {
    id: 'go',
    name: 'Go',
    description:
      'Compiled language for services, tooling, and cloud infrastructure.',
    categories: ['Language'],
    level: 3,
    iconSlug: 'go',
    keywords: ['golang', 'backend', 'services', 'tooling'],
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: 'Observability dashboards for metrics and operational signals.',
    categories: ['Observability'],
    level: 3,
    iconSlug: 'grafana',
    keywords: ['observability', 'metrics', 'dashboards', 'monitoring'],
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
    certifications: [
      {
        title: 'KCNA',
        citationIcon: cncfCertificationBadges.KCNA,
        skills: ['Kubernetes'],
        expiresAt: '2028-02-26T10:59:00+11:00',
        url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-8a295e12-57c5-4008-b8ba-171b09419221-certificate.pdf',
        metadata: {
          id: 'LF-bau2ptq4ve',
          name: 'Kubernetes and Cloud Native Associate',
          completedAt: '2025-03-21',
        },
      },
      {
        title: 'CKAD',
        citationIcon: cncfCertificationBadges.CKAD,
        skills: ['Kubernetes'],
        expiresAt: '2028-02-25T11:00:00+11:00',
        url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-83c53ec1-bf5d-4b01-ae0a-c79be21d7cf2-certificate.pdf',
        metadata: {
          id: 'LF-kyh6ajhr7y',
          name: 'Certified Kubernetes Application Developer',
          completedAt: '2026-02-25',
        },
      },
      {
        title: 'CKA',
        citationIcon: cncfCertificationBadges.CKA,
        skills: ['Kubernetes'],
        expiresAt: '2027-04-20T10:00:00+10:00',
        url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-02c68021-40fe-473f-8087-6309221395ca-certificate.pdf',
        metadata: {
          id: 'LF-assbyzy17c',
          name: 'Certified Kubernetes Administrator',
          completedAt: '2025-04-20',
        },
      },
    ],
  },
  {
    id: 'neovim',
    name: 'Neovim',
    description: 'Extensible editor for keyboard-driven development workflows.',
    categories: ['Tooling'],
    level: 4,
    iconSlug: 'neovim',
    keywords: ['editor', 'vim', 'terminal', 'developer tooling'],
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
    id: 'react',
    name: 'React',
    description: 'Component-based UI library for interactive web interfaces.',
    categories: ['Framework'],
    level: 3,
    iconSlug: 'react',
    keywords: ['frontend', 'ui', 'components'],
  },
  {
    id: 'storybook',
    name: 'Storybook',
    description:
      'Development environment for building and testing UI components.',
    categories: ['Design System', 'Testing'],
    level: 2,
    iconSlug: 'storybook',
    keywords: ['components', 'ui', 'visual testing'],
  },
  {
    id: 'swift',
    name: 'Swift',
    description: 'Apple platform language for native application development.',
    categories: ['Language'],
    level: 2,
    iconSlug: 'swift',
    keywords: ['ios', 'apple', 'native', 'mobile'],
  },
  {
    id: 'terraform',
    name: 'Terraform',
    description:
      'Reproducible infrastructure and scoped IAM policy management with Terraform.',
    categories: ['IaC', 'Cloud'],
    level: 3,
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
    id: 'tmux',
    name: 'Tmux',
    description: 'Terminal multiplexer for persistent development sessions.',
    categories: ['Tooling'],
    level: 4,
    iconSlug: 'tmux',
    keywords: ['terminal', 'multiplexer', 'sessions', 'cli'],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'Typed JavaScript for building reliable applications.',
    categories: ['Language'],
    level: 4,
    iconSlug: 'typescript',
    keywords: ['javascript', 'typed', 'frontend', 'node'],
  },
  {
    id: 'zsh',
    name: 'Zsh',
    description: 'Interactive shell for productive terminal workflows.',
    categories: ['Tooling'],
    level: 3,
    iconSlug: 'zsh',
    keywords: ['shell', 'terminal', 'cli', 'automation'],
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
