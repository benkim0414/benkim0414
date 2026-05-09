export const skillCategories = [
  'Cloud',
  'Kubernetes',
  'IaC',
  'CI/CD',
  'Observability',
  'Backend',
  'Frontend',
  'Tools',
] as const;

export type SkillCategory = (typeof skillCategories)[number];

export const skillLevels = {
  1: 'Learning',
  2: 'Working knowledge',
  3: 'Applied',
  4: 'Production strength',
  5: 'Lead or mentor',
} as const;

export type SkillLevel = keyof typeof skillLevels;

export type Project = {
  id: string;
  name: string;
  summary: string;
  url?: string;
};

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  summary: string;
  usage: string;
  tags: string[];
  projectIds: string[];
};

export const projects = [
  {
    id: 'platform-automation-placeholder',
    name: 'Platform Automation Placeholder',
    summary:
      'Placeholder project for automation work that provisions, configures, and validates developer or infrastructure workflows.',
  },
  {
    id: 'kubernetes-operations-placeholder',
    name: 'Kubernetes Operations Placeholder',
    summary:
      'Placeholder project for operating Kubernetes workloads, deployment safety, and cluster-facing developer experience.',
  },
  {
    id: 'delivery-pipeline-placeholder',
    name: 'Delivery Pipeline Placeholder',
    summary:
      'Placeholder project for CI/CD pipelines, release validation, and repeatable deployment workflows.',
  },
  {
    id: 'observability-practice-placeholder',
    name: 'Observability Practice Placeholder',
    summary:
      'Placeholder project for logs, metrics, traces, alerting, and practical service health review.',
  },
  {
    id: 'developer-showcase-placeholder',
    name: 'Developer Showcase Placeholder',
    summary:
      'Placeholder project for frontend and backend examples that present technical work clearly to recruiters and peers.',
  },
] as const satisfies readonly Project[];

export const skills = [
  {
    id: 'aws',
    name: 'AWS',
    category: 'Cloud',
    level: 4,
    summary: 'Cloud platform skill placeholder for infrastructure and service operations.',
    usage:
      'Used as a placeholder for cloud architecture, IAM-aware automation, and production-oriented platform operations.',
    tags: ['cloud', 'iam', 'networking', 'operations'],
    projectIds: ['platform-automation-placeholder'],
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    category: 'Kubernetes',
    level: 4,
    summary: 'Container orchestration skill placeholder for workload and cluster operations.',
    usage:
      'Used as a placeholder for workload rollout, configuration, troubleshooting, and platform reliability work.',
    tags: ['containers', 'workloads', 'cluster', 'platform'],
    projectIds: ['kubernetes-operations-placeholder'],
  },
  {
    id: 'terraform-opentofu',
    name: 'Terraform / OpenTofu',
    category: 'IaC',
    level: 4,
    summary: 'Infrastructure-as-code skill placeholder for repeatable environment management.',
    usage:
      'Used as a placeholder for declarative infrastructure, module structure, and plan/apply review workflows.',
    tags: ['iac', 'modules', 'state', 'automation'],
    projectIds: ['platform-automation-placeholder'],
  },
  {
    id: 'github-actions',
    name: 'GitHub Actions',
    category: 'CI/CD',
    level: 4,
    summary: 'Pipeline automation skill placeholder for build, test, and deployment workflows.',
    usage:
      'Used as a placeholder for validating changes, publishing artifacts, and enforcing repeatable release steps.',
    tags: ['ci', 'cd', 'automation', 'release'],
    projectIds: ['delivery-pipeline-placeholder'],
  },
  {
    id: 'prometheus-grafana',
    name: 'Prometheus / Grafana',
    category: 'Observability',
    level: 3,
    summary: 'Observability skill placeholder for metrics, dashboards, and service health review.',
    usage:
      'Used as a placeholder for operational visibility, alert review, and incident-oriented service inspection.',
    tags: ['metrics', 'dashboards', 'alerts', 'slo'],
    projectIds: ['observability-practice-placeholder'],
  },
  {
    id: 'node-typescript',
    name: 'Node.js / TypeScript',
    category: 'Backend',
    level: 3,
    summary: 'Backend skill placeholder for typed service and tooling development.',
    usage:
      'Used as a placeholder for API-adjacent automation, command-line tooling, and typed integration logic.',
    tags: ['typescript', 'node', 'api', 'tooling'],
    projectIds: ['developer-showcase-placeholder'],
  },
  {
    id: 'react',
    name: 'React',
    category: 'Frontend',
    level: 3,
    summary: 'Frontend skill placeholder for interactive, searchable user interfaces.',
    usage:
      'Used as a placeholder for building the GitHub Pages skills showcase and other developer-facing interfaces.',
    tags: ['react', 'vite', 'ui', 'accessibility'],
    projectIds: ['developer-showcase-placeholder'],
  },
  {
    id: 'nx-pnpm',
    name: 'Nx / pnpm',
    category: 'Tools',
    level: 4,
    summary: 'Monorepo tooling skill placeholder for project graph, scripts, and workspace validation.',
    usage:
      'Used as a placeholder for maintaining repeatable commands, generated app boundaries, and package-manager hygiene.',
    tags: ['nx', 'pnpm', 'monorepo', 'tooling'],
    projectIds: ['developer-showcase-placeholder', 'delivery-pipeline-placeholder'],
  },
] as const satisfies readonly Skill[];

const projectsById = new Map(projects.map((project) => [project.id, project]));

export const skillsWithProjects = skills.map((skill) => ({
  ...skill,
  projects: skill.projectIds.map((projectId) => {
    const project = projectsById.get(projectId);

    if (!project) {
      throw new Error(`Unknown project id: ${projectId}`);
    }

    return project;
  }),
}));
