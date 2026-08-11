import { kubernetesCertifications } from '../certifications/kubernetes-certifications.data';
import type { DevOpsRoadmapItem } from './devops-roadmap.types';

// Source: roadmap.sh DevOps PDF, accessed 2026-07-17.
export const devOpsRoadmapItems = [
  {
    id: 'learn-programming-language',
    title: 'Learn a Programming Language',
    skills: ['Python', 'Go'],
  },
  {
    id: 'operating-system',
    title: 'Operating System',
    skills: ['FreeBSD', 'Ubuntu / Debian', 'RHEL / Derivatives'],
  },
  {
    id: 'terminal-knowledge',
    title: 'Terminal Knowledge',
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
    skills: ['Git'],
  },
  { id: 'vcs-hosting', title: 'VCS Hosting', skills: ['GitHub'] },
  { id: 'containers', title: 'Containers', skills: ['Docker'] },
  {
    id: 'setup-x',
    title: 'What is and how to setup X ?',
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
    skills: ['DNS', 'HTTP', 'HTTPS', 'SSL / TLS', 'SSH'],
  },
  {
    id: 'cloud-providers',
    title: 'Cloud Providers',
    skills: ['AWS', 'Azure', 'Google Cloud'],
  },
  {
    id: 'serverless',
    title: 'Serverless',
    skills: ['AWS Lambda', 'Cloudflare'],
  },
  { id: 'provisioning', title: 'Provisioning', skills: ['Terraform'] },
  {
    id: 'configuration-management',
    title: 'Configuration Management',
    skills: ['Ansible'],
  },
  {
    id: 'ci-cd-tools',
    title: 'CI / CD Tools',
    skills: ['GitLab CI', 'Circle CI', 'GitHub Actions'],
  },
  { id: 'secret-management', title: 'Secret Management', skills: ['Vault'] },
  {
    id: 'infrastructure-monitoring',
    title: 'Infrastructure Monitoring',
    skills: ['Prometheus', 'Grafana', 'Datadog'],
  },
  {
    id: 'logs-management',
    title: 'Logs Management',
    skills: ['Loki', 'Elastic Stack'],
  },
  {
    id: 'container-orchestration',
    title: 'Container Orchestration',
    skills: ['Kubernetes'],
    certifications: [
      kubernetesCertifications.cka,
      kubernetesCertifications.ckad,
      kubernetesCertifications.kcna,
    ],
  },
  { id: 'application-monitoring', title: 'Application Monitoring', skills: [] },
  {
    id: 'artifact-management',
    title: 'Artifact Management',
    skills: ['Artifactory'],
  },
  { id: 'gitops', title: 'GitOps', skills: ['ArgoCD'] },
  { id: 'service-mesh', title: 'Service Mesh', skills: ['Istio', 'Consul'] },
  { id: 'cloud-design-patterns', title: 'Cloud Design Patterns', skills: [] },
] satisfies readonly DevOpsRoadmapItem[];
