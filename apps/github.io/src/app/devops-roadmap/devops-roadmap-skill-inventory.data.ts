import { kubernetesCertifications } from '../certifications/kubernetes-certifications.data';
import type {
  DevOpsRoadmapSkillInventoryGap,
  DevOpsRoadmapSkillInventoryNode,
} from './devops-roadmap.types';

const kubernetesCertificationRow = [
  kubernetesCertifications.cka,
  kubernetesCertifications.ckad,
  kubernetesCertifications.kcna,
] as const;

export const devOpsRoadmapSkillInventoryNodes = [
  {
    id: 'learn-programming-language',
    title: 'Learn a Programming Language',
    evidenceSkillTokens: ['Node.js', 'TypeScript', 'Go', 'Python'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'operating-system',
    title: 'Operating System',
    evidenceSkillTokens: [
      'macOS',
      'Ubuntu',
      'Debian',
      'Fedora',
    ],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'terminal-knowledge',
    title: 'Terminal Knowledge',
    evidenceSkillTokens: [
      'Bash',
      'Process Monitoring',
      'Performance Monitoring',
      'Text Manipulation',
      'Neovim',
    ],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'version-control-systems',
    title: 'Version Control Systems',
    evidenceSkillTokens: ['Git'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'vcs-hosting',
    title: 'VCS Hosting',
    evidenceSkillTokens: ['GitHub', 'GitLab'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'containers',
    title: 'Containers',
    evidenceSkillTokens: ['Docker', 'LXC'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'setup-x',
    title: 'What is and how to setup X ?',
    evidenceSkillTokens: [
      'Forward Proxy',
      'Reverse Proxy',
      'Load Balancer',
      'Nginx',
    ],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'networking-protocols',
    title: 'Networking & Protocols',
    evidenceSkillTokens: ['DNS', 'HTTP', 'HTTPS', 'SSL / TLS', 'SSH'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'cloud-providers',
    title: 'Cloud Providers',
    evidenceSkillTokens: ['AWS', 'Google Cloud'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'serverless',
    title: 'Serverless',
    evidenceSkillTokens: ['AWS Lambda'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'provisioning',
    title: 'Provisioning',
    evidenceSkillTokens: ['Terraform'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'configuration-management',
    title: 'Configuration Management',
    evidenceSkillTokens: ['Ansible'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'ci-cd-tools',
    title: 'CI / CD Tools',
    evidenceSkillTokens: ['GitHub Actions', 'GitLab CI'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'secret-management',
    title: 'Secret Management',
    evidenceSkillTokens: ['Sealed Secrets', 'AWS Secrets Manager'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'infrastructure-monitoring',
    title: 'Infrastructure Monitoring',
    evidenceSkillTokens: ['Prometheus', 'Grafana'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'logs-management',
    title: 'Logs Management',
    evidenceSkillTokens: ['Loki', 'Elastic Stack'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'container-orchestration',
    title: 'Container Orchestration',
    certifications: kubernetesCertificationRow,
    evidenceSkillTokens: ['Kubernetes'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'application-monitoring',
    title: 'Application Monitoring',
    evidenceSkillTokens: ['Prometheus'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'artifact-management',
    title: 'Artifact Management',
    evidenceSkillTokens: [],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'gitops',
    title: 'GitOps',
    evidenceSkillTokens: ['ArgoCD'],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'service-mesh',
    title: 'Service Mesh',
    evidenceSkillTokens: [],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'cloud-design-patterns',
    title: 'Cloud Design Patterns',
    evidenceSkillTokens: [],
    coveredRoadmapConcepts: [
      'Backends for Frontends',
      'Gateway Aggregation',
      'Idempotent Consumer',
      'Publisher-Subscriber',
      'Rate Limiting',
      'Retry',
      'Sidecar',
      'Static Content Hosting',
    ],
  },
] satisfies readonly DevOpsRoadmapSkillInventoryNode[];

export const devOpsRoadmapSkillInventoryGaps = [
  {
    nodeId: 'cloud-providers',
    recommendedItems: ['Autoscaling'],
  },
  {
    nodeId: 'infrastructure-monitoring',
    recommendedItems: ['SLIs/SLOs', 'Incident response'],
  },
  {
    nodeId: 'service-mesh',
    recommendedItems: [
      'Istio',
      'Linkerd',
      'Consul',
      'mTLS',
      'Traffic splitting',
      'Retries/timeouts',
      'Circuit breaking',
      'Service discovery',
      'Mesh observability',
    ],
  },
  {
    nodeId: 'cloud-design-patterns',
    recommendedItems: [
      'Fault tolerance',
      'Disaster recovery',
      'Blue-green deployment',
      'Canary deployment',
      'Immutable infrastructure',
      'Queue-based load leveling',
    ],
  },
] satisfies readonly DevOpsRoadmapSkillInventoryGap[];
