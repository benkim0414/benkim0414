import { cncfCertificationBadges } from '../certifications/cncf-certification-badges';
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
