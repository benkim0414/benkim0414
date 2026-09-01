import { kubernetesCertifications } from '../certifications/kubernetes-certifications.data';
import type { Skill } from './skill-list.types';

export const skills: readonly Skill[] = [
  {
    id: 'alertmanager',
    name: 'Alertmanager',
    description:
      'Prometheus alert routing and notification management for operational response.',
    categories: ['Observability'],
    primaryUse: 'Alert routing and response',
    confidence: 2,
    iconSlug: 'alertmanager',
    keywords: ['alerts', 'prometheus', 'observability', 'incident response'],
  },
  {
    id: 'alloy',
    name: 'Alloy',
    description:
      'Grafana telemetry collection for metrics, logs, and observability pipelines.',
    categories: ['Observability'],
    primaryUse: 'Telemetry collection',
    confidence: 2,
    iconSlug: 'alloy',
    keywords: ['grafana', 'telemetry', 'observability', 'collector'],
  },
  {
    id: 'amazon-ecr',
    name: 'Amazon ECR',
    description:
      'AWS container registry for immutable image publishing and deployment traceability.',
    categories: ['Cloud', 'Container'],
    primaryUse: 'Container image publishing',
    confidence: 3,
    iconSlug: 'amazon-ecr',
    keywords: ['aws', 'container registry', 'ecr', 'image'],
  },
  {
    id: 'amazon-eks',
    name: 'Amazon EKS',
    description:
      'Managed Kubernetes platform for cloud-native workload delivery on AWS.',
    categories: ['Cloud', 'Container'],
    primaryUse: 'Managed Kubernetes delivery',
    confidence: 3,
    iconSlug: 'amazon-eks',
    keywords: ['aws', 'eks', 'kubernetes', 'managed cluster'],
  },
  {
    id: 'argo-cd',
    name: 'Argo CD',
    description:
      'GitOps continuous delivery controller for Kubernetes application reconciliation.',
    categories: ['CI/CD', 'Cloud'],
    primaryUse: 'Kubernetes GitOps delivery',
    confidence: 3,
    iconSlug: 'argo',
    keywords: ['gitops', 'argocd', 'kubernetes', 'delivery'],
  },
  {
    id: 'aws-codebuild',
    name: 'AWS CodeBuild',
    description:
      'Managed build service for CI validation, tests, and container workflows.',
    categories: ['CI/CD', 'Cloud'],
    primaryUse: 'Managed CI validation',
    confidence: 3,
    iconSlug: 'aws-codebuild',
    keywords: ['aws', 'codebuild', 'ci', 'builds', 'tests'],
  },
  {
    id: 'aws-codepipeline',
    name: 'AWS CodePipeline',
    description:
      'AWS delivery pipeline automation for approval-gated and environment-aware releases.',
    categories: ['CI/CD', 'Cloud'],
    primaryUse: 'Approval-gated delivery',
    confidence: 3,
    iconSlug: 'aws-codepipeline',
    keywords: ['aws', 'codepipeline', 'delivery', 'deployment'],
  },
  {
    id: 'aws-eventbridge',
    name: 'AWS EventBridge',
    description:
      'Event-driven AWS integration for automation, alerting, and operational workflows.',
    categories: ['Cloud', 'Tooling'],
    primaryUse: 'Event-driven automation',
    confidence: 2,
    iconSlug: 'aws-eventbridge',
    keywords: ['aws', 'eventbridge', 'events', 'automation'],
  },
  {
    id: 'aws-iam',
    name: 'AWS IAM',
    description:
      'AWS identity and access management for scoped permissions and security controls.',
    categories: ['Cloud'],
    primaryUse: 'Cloud identity governance',
    confidence: 3,
    iconSlug: 'aws-iam',
    keywords: ['aws', 'iam', 'identity', 'permissions', 'security'],
  },
  {
    id: 'aws-lambda',
    name: 'AWS Lambda',
    description:
      'Serverless compute for event-driven automation and cloud integrations.',
    categories: ['Cloud', 'Runtime'],
    primaryUse: 'Serverless automation',
    confidence: 2,
    iconSlug: 'aws-lambda',
    keywords: ['aws', 'lambda', 'serverless', 'automation'],
  },
  {
    id: 'aws-systems-manager-parameter-store',
    name: 'AWS Systems Manager Parameter Store',
    description:
      'AWS configuration and secret parameter storage for automated delivery workflows.',
    categories: ['Cloud', 'Tooling'],
    primaryUse: 'Delivery configuration storage',
    confidence: 2,
    iconSlug: 'aws-systems-manager-parameter-store',
    keywords: ['aws', 'systems manager', 'parameter store', 'configuration'],
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description:
      'Agentic coding assistant for repository-aware development workflows.',
    categories: ['Tooling'],
    primaryUse: 'Repository-aware coding assistance',
    confidence: 4,
    iconSlug: 'claudecode',
    keywords: ['ai', 'agentic coding', 'code assistant', 'development'],
  },
  {
    id: 'docker',
    name: 'Docker',
    description:
      'Container packaging, delivery workflow support, and immutable image deployment practice.',
    categories: ['Container', 'Runtime'],
    primaryUse: 'Containerized application delivery',
    confidence: 3,
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
    primaryUse: 'Cross-platform mobile delivery',
    confidence: 2,
    iconSlug: 'expo',
    keywords: ['react native', 'mobile', 'ios', 'android'],
  },
  {
    id: 'git',
    name: 'Git',
    description:
      'Distributed version control for delivery workflows and infrastructure changes.',
    categories: ['Tooling'],
    primaryUse: 'Version-controlled collaboration',
    confidence: 4,
    iconSlug: 'git',
    keywords: ['version control', 'repository', 'branching', 'history'],
  },
  {
    id: 'github',
    name: 'GitHub',
    description:
      'Repository hosting and collaboration platform for CI/CD and code review workflows.',
    categories: ['Tooling', 'CI/CD'],
    primaryUse: 'Repository collaboration',
    confidence: 4,
    iconSlug: 'github',
    keywords: ['repository', 'pull requests', 'collaboration', 'automation'],
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    description:
      'CI/CD workflow ownership across integration, delivery, and deployment automation.',
    categories: ['CI/CD'],
    primaryUse: 'Repository automation and CI/CD',
    confidence: 3,
    iconSlug: 'githubactions',
    keywords: ['ci', 'cd', 'automation', 'workflow', 'delivery', 'deployment'],
  },
  {
    id: 'go',
    name: 'Go',
    description:
      'Compiled language for services, tooling, and cloud infrastructure.',
    categories: ['Language'],
    primaryUse: 'Backend services and tooling',
    confidence: 3,
    iconSlug: 'go',
    keywords: ['golang', 'backend', 'services', 'tooling'],
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description:
      'Observability dashboards for metrics and operational signals.',
    categories: ['Observability'],
    primaryUse: 'Operational dashboards',
    confidence: 3,
    iconSlug: 'grafana',
    keywords: ['observability', 'metrics', 'dashboards', 'monitoring'],
  },
  {
    id: 'helm',
    name: 'Helm',
    description:
      'Kubernetes package management for reusable workload deployment templates.',
    categories: ['Container', 'CI/CD'],
    primaryUse: 'Reusable workload packaging',
    confidence: 3,
    iconSlug: 'helm',
    keywords: ['kubernetes', 'charts', 'templates', 'deployment'],
  },
  {
    id: 'jest',
    name: 'Jest',
    description:
      'JavaScript and TypeScript test runner for unit and regression coverage.',
    categories: ['Testing'],
    primaryUse: 'Unit and regression testing',
    confidence: 3,
    iconSlug: 'jest',
    keywords: ['testing', 'unit tests', 'javascript', 'typescript'],
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    description:
      'Cloud-native workload operations, troubleshooting, and infrastructure practice backed by Kubernetes certification evidence.',
    categories: ['Container', 'Cloud'],
    primaryUse: 'Cloud-native platform operations',
    confidence: 4,
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
      kubernetesCertifications.kcna,
      kubernetesCertifications.ckad,
      kubernetesCertifications.cka,
    ],
  },
  {
    id: 'kustomize',
    name: 'Kustomize',
    description:
      'Kubernetes configuration overlays for deterministic environment-specific manifests.',
    categories: ['Container', 'IaC'],
    primaryUse: 'Environment-specific manifests',
    confidence: 3,
    iconSlug: 'kustomize',
    keywords: ['kubernetes', 'manifests', 'overlays', 'configuration'],
  },
  {
    id: 'loki',
    name: 'Loki',
    description:
      'Grafana log aggregation for operational troubleshooting and observability.',
    categories: ['Observability'],
    primaryUse: 'Operational log aggregation',
    confidence: 2,
    iconSlug: 'loki',
    keywords: ['logs', 'grafana', 'observability', 'troubleshooting'],
  },
  {
    id: 'markdown',
    name: 'Markdown',
    description:
      'Plain-text documentation format for durable project and workflow knowledge.',
    categories: ['Tooling'],
    primaryUse: 'Durable technical documentation',
    confidence: 4,
    iconSlug: 'markdown',
    keywords: ['documentation', 'writing', 'docs', 'knowledge'],
  },
  {
    id: 'neovim',
    name: 'Neovim',
    description: 'Extensible editor for keyboard-driven development workflows.',
    categories: ['Tooling'],
    primaryUse: 'Keyboard-driven development',
    confidence: 4,
    iconSlug: 'neovim',
    keywords: ['editor', 'vim', 'terminal', 'developer tooling'],
  },
  {
    id: 'nx',
    name: 'Nx',
    description:
      'Monorepo quality gates for lint, build, test, and type-check workflows.',
    categories: ['Build', 'Tooling'],
    primaryUse: 'Monorepo quality gates',
    confidence: 4,
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
    id: 'postgresql',
    name: 'PostgreSQL',
    description:
      'Relational database used in application services, tests, and delivery validation.',
    categories: ['Database'],
    primaryUse: 'Relational data storage',
    confidence: 3,
    iconSlug: 'postgresql',
    keywords: ['database', 'sql', 'postgres', 'testcontainers'],
  },
  {
    id: 'prometheus',
    name: 'Prometheus',
    description:
      'Metrics collection and alerting system for service and infrastructure observability.',
    categories: ['Observability'],
    primaryUse: 'Metrics and alerting',
    confidence: 3,
    iconSlug: 'prometheus',
    keywords: ['metrics', 'monitoring', 'alerts', 'observability'],
  },
  {
    id: 'react',
    name: 'React',
    description: 'Component-based UI library for interactive web interfaces.',
    categories: ['Framework'],
    primaryUse: 'Interactive web interfaces',
    confidence: 3,
    iconSlug: 'react',
    keywords: ['frontend', 'ui', 'components'],
  },
  {
    id: 'sealed-secrets',
    name: 'Sealed Secrets',
    description:
      'Kubernetes encrypted secret delivery for storing safe manifests in version control.',
    categories: ['Container', 'CI/CD'],
    primaryUse: 'Version-controlled secret delivery',
    confidence: 3,
    iconSlug: 'sealed-secrets',
    keywords: ['kubernetes', 'secrets', 'gitops', 'encryption'],
  },
  {
    id: 'sentry',
    name: 'Sentry',
    description:
      'Error tracking and session replay for application monitoring and release health.',
    categories: ['Observability'],
    primaryUse: 'Error tracking and release health',
    confidence: 3,
    iconSlug: 'sentry',
    keywords: ['errors', 'session replay', 'monitoring', 'observability'],
  },
  {
    id: 'storybook',
    name: 'Storybook',
    description:
      'Development environment for building and testing UI components.',
    categories: ['Design System', 'Testing'],
    primaryUse: 'Component development and review',
    confidence: 2,
    iconSlug: 'storybook',
    keywords: ['components', 'ui', 'visual testing'],
  },
  {
    id: 'swift',
    name: 'Swift',
    description: 'Apple platform language for native application development.',
    categories: ['Language'],
    primaryUse: 'Native Apple applications',
    confidence: 2,
    iconSlug: 'swift',
    keywords: ['ios', 'apple', 'native', 'mobile'],
  },
  {
    id: 'terraform',
    name: 'Terraform',
    description:
      'Reproducible infrastructure and scoped IAM policy management with Terraform.',
    categories: ['IaC', 'Cloud'],
    primaryUse: 'Infrastructure provisioning',
    confidence: 3,
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
    id: 'testcontainers',
    name: 'Testcontainers',
    description:
      'Container-backed integration testing for realistic service dependencies.',
    categories: ['Testing', 'Container'],
    primaryUse: 'Containerized integration testing',
    confidence: 3,
    iconSlug: 'testcontainers',
    keywords: ['testing', 'containers', 'integration tests', 'postgresql'],
  },
  {
    id: 'tmux',
    name: 'Tmux',
    description: 'Terminal multiplexer for persistent development sessions.',
    categories: ['Tooling'],
    primaryUse: 'Persistent terminal workspaces',
    confidence: 4,
    iconSlug: 'tmux',
    keywords: ['terminal', 'multiplexer', 'sessions', 'cli'],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    description: 'Typed JavaScript for building reliable applications.',
    categories: ['Language'],
    primaryUse: 'Type-safe application development',
    confidence: 4,
    iconSlug: 'typescript',
    keywords: ['javascript', 'typed', 'frontend', 'node'],
  },
  {
    id: 'yaml',
    name: 'YAML',
    description:
      'Configuration language for infrastructure, Kubernetes, and CI/CD workflows.',
    categories: ['Tooling'],
    primaryUse: 'Infrastructure configuration',
    confidence: 3,
    iconSlug: 'yaml',
    keywords: ['configuration', 'kubernetes', 'ci', 'infrastructure'],
  },
  {
    id: 'zsh',
    name: 'Zsh',
    description: 'Interactive shell for productive terminal workflows.',
    categories: ['Tooling'],
    primaryUse: 'Productive terminal workflows',
    confidence: 3,
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
