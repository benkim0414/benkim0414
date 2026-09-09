import { kubernetesCertifications } from '../certifications/kubernetes-certifications.data';
import type { DevOpsRoadmapItem } from './devops-roadmap.types';

export const devOpsRoadmapDescriptions = {
  'learn-programming-language':
    'Use programming and scripting to automate operations, build tooling, and solve repeatable infrastructure problems.',
  'operating-system':
    'Understand Linux systems, processes, permissions, filesystems, packages, and resource management for reliable operations.',
  'terminal-knowledge':
    'Work efficiently from the command line to inspect systems, manipulate text, and automate routine tasks.',
  'version-control-systems':
    'Track infrastructure and application changes safely while supporting review, collaboration, and recovery.',
  'vcs-hosting':
    'Use hosted repositories to collaborate, review changes, automate workflows, and manage project access.',
  containers:
    'Package applications with their dependencies to create portable, isolated, and repeatable runtime environments.',
  'setup-x':
    'Understand and configure common traffic components such as proxies, caches, firewalls, and load balancers.',
  'networking-protocols':
    'Understand addressing, name resolution, secure transport, and application protocols used by distributed systems.',
  'cloud-providers':
    'Provision and operate compute, storage, networking, identity, and managed services on cloud platforms.',
  serverless:
    'Run event-driven workloads on managed platforms without directly maintaining the underlying server infrastructure.',
  provisioning:
    'Define infrastructure as code so environments can be created, reviewed, repeated, and changed safely.',
  'configuration-management':
    'Automate system configuration and enforce consistent desired state across servers and environments.',
  'ci-cd-tools':
    'Automate building, testing, and deploying changes through repeatable continuous delivery pipelines.',
  'secret-management':
    'Store, distribute, rotate, and audit credentials without exposing sensitive values in code or configuration.',
  'infrastructure-monitoring':
    'Measure infrastructure health and capacity so teams can detect problems and plan reliable operation.',
  'logs-management':
    'Collect, search, retain, and analyze logs to troubleshoot systems and understand operational behavior.',
  'container-orchestration':
    'Schedule, scale, network, and recover containerized workloads across a managed cluster of machines.',
  'application-monitoring':
    'Observe application health, latency, errors, and traces to diagnose behavior experienced by users.',
  'artifact-management':
    'Store, version, secure, and distribute build outputs through controlled artifact repositories.',
  gitops:
    'Reconcile deployed environments from version-controlled declarations using automated, auditable delivery workflows.',
  'service-mesh':
    'Manage service-to-service traffic, security, reliability, and observability through a dedicated communication layer.',
  'cloud-design-patterns':
    'Apply reusable cloud architecture patterns to improve scalability, resilience, operability, and maintainability.',
} as const;

// Source: roadmap.sh DevOps PDF, accessed 2026-07-17.
export const devOpsRoadmapItems = [
  {
    id: 'learn-programming-language',
    title: 'Learn a Programming Language',
    description: devOpsRoadmapDescriptions['learn-programming-language'],
    skills: ['Python', 'Go'],
  },
  {
    id: 'operating-system',
    title: 'Operating System',
    description: devOpsRoadmapDescriptions['operating-system'],
    skills: ['FreeBSD', 'Ubuntu / Debian', 'RHEL / Derivatives'],
  },
  {
    id: 'terminal-knowledge',
    title: 'Terminal Knowledge',
    description: devOpsRoadmapDescriptions['terminal-knowledge'],
    skills: [
      'Bash',
      'Process Monitoring',
      'Performance Monitoring',
      'Networking Tools',
      'Text Manipulation',
      'Vim / Nano / Emacs',
    ],
  },
  {
    id: 'version-control-systems',
    title: 'Version Control Systems',
    description: devOpsRoadmapDescriptions['version-control-systems'],
    skills: ['Git'],
  },
  {
    id: 'vcs-hosting',
    title: 'VCS Hosting',
    description: devOpsRoadmapDescriptions['vcs-hosting'],
    skills: ['GitHub'],
  },
  {
    id: 'containers',
    title: 'Containers',
    description: devOpsRoadmapDescriptions.containers,
    skills: ['Docker'],
  },
  {
    id: 'setup-x',
    title: 'What is and how to setup X ?',
    description: devOpsRoadmapDescriptions['setup-x'],
    skills: [
      'Forward Proxy',
      'Reverse Proxy',
      'Caching Server',
      'Firewall',
      'Load Balancer',
      'Nginx',
    ],
  },
  {
    id: 'networking-protocols',
    title: 'Networking & Protocols',
    description: devOpsRoadmapDescriptions['networking-protocols'],
    skills: ['DNS', 'HTTP', 'HTTPS', 'SSL / TLS', 'SSH'],
  },
  {
    id: 'cloud-providers',
    title: 'Cloud Providers',
    description: devOpsRoadmapDescriptions['cloud-providers'],
    skills: ['AWS', 'Azure', 'Google Cloud'],
  },
  {
    id: 'serverless',
    title: 'Serverless',
    description: devOpsRoadmapDescriptions.serverless,
    skills: ['AWS Lambda', 'Cloudflare'],
  },
  {
    id: 'provisioning',
    title: 'Provisioning',
    description: devOpsRoadmapDescriptions.provisioning,
    skills: ['Terraform'],
  },
  {
    id: 'configuration-management',
    title: 'Configuration Management',
    description: devOpsRoadmapDescriptions['configuration-management'],
    skills: ['Ansible'],
  },
  {
    id: 'ci-cd-tools',
    title: 'CI / CD Tools',
    description: devOpsRoadmapDescriptions['ci-cd-tools'],
    skills: ['GitLab CI', 'Circle CI', 'GitHub Actions'],
  },
  {
    id: 'secret-management',
    title: 'Secret Management',
    description: devOpsRoadmapDescriptions['secret-management'],
    skills: ['Vault'],
  },
  {
    id: 'infrastructure-monitoring',
    title: 'Infrastructure Monitoring',
    description: devOpsRoadmapDescriptions['infrastructure-monitoring'],
    skills: ['Prometheus', 'Grafana', 'Datadog'],
  },
  {
    id: 'logs-management',
    title: 'Logs Management',
    description: devOpsRoadmapDescriptions['logs-management'],
    skills: ['Loki', 'Elastic Stack'],
  },
  {
    id: 'container-orchestration',
    title: 'Container Orchestration',
    description: devOpsRoadmapDescriptions['container-orchestration'],
    skills: ['Kubernetes'],
    certifications: [
      kubernetesCertifications.cka,
      kubernetesCertifications.ckad,
      kubernetesCertifications.kcna,
    ],
  },
  {
    id: 'application-monitoring',
    title: 'Application Monitoring',
    description: devOpsRoadmapDescriptions['application-monitoring'],
    skills: [],
  },
  {
    id: 'artifact-management',
    title: 'Artifact Management',
    description: devOpsRoadmapDescriptions['artifact-management'],
    skills: ['Artifactory'],
  },
  {
    id: 'gitops',
    title: 'GitOps',
    description: devOpsRoadmapDescriptions.gitops,
    skills: ['ArgoCD'],
  },
  {
    id: 'service-mesh',
    title: 'Service Mesh',
    description: devOpsRoadmapDescriptions['service-mesh'],
    skills: ['Istio', 'Consul'],
  },
  {
    id: 'cloud-design-patterns',
    title: 'Cloud Design Patterns',
    description: devOpsRoadmapDescriptions['cloud-design-patterns'],
    skills: [],
  },
] satisfies readonly DevOpsRoadmapItem[];
