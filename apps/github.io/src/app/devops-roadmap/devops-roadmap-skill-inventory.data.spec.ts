import { kubernetesCertifications } from '../certifications/kubernetes-certifications.data';
import {
  devOpsRoadmapSkillInventoryGaps,
  devOpsRoadmapSkillInventoryNodes,
} from './devops-roadmap-skill-inventory.data';
import {
  devOpsRoadmapDescriptions,
  devOpsRoadmapItems,
} from './devops-roadmap.data';

const roadmapSuggestedConceptsByNodeId = {
  'learn-programming-language': ['Python', 'Go', 'JavaScript'],
  'operating-system': [
    'FreeBSD',
    'Ubuntu / Debian',
    'RHEL / Derivatives',
  ],
  'terminal-knowledge': [
    'Bash',
    'Process Monitoring',
    'Performance Monitoring',
    'Networking Tools',
    'Text Manipulation',
    'Vim / Nano / Emacs',
  ],
  'version-control-systems': ['Git'],
  'vcs-hosting': ['GitHub', 'GitLab'],
  containers: ['Docker'],
  'networking-protocols': ['DNS', 'HTTP', 'HTTPS', 'SSL / TLS', 'SSH'],
  'setup-x': [
    'Forward Proxy',
    'Reverse Proxy',
    'Caching Server',
    'Firewall',
    'Load Balancer',
    'Nginx',
  ],
  'cloud-providers': ['AWS', 'Azure', 'Google Cloud'],
  serverless: ['AWS Lambda', 'Cloudflare'],
  provisioning: ['Terraform'],
  'configuration-management': ['Ansible'],
  'ci-cd-tools': ['GitLab CI', 'Circle CI', 'GitHub Actions'],
  'secret-management': ['Vault', 'AWS Secrets Manager', 'Sealed Secrets'],
  'infrastructure-monitoring': ['Prometheus', 'Grafana', 'Datadog'],
  'logs-management': ['Loki', 'Elastic Stack'],
  'container-orchestration': ['Kubernetes'],
  'application-monitoring': ['Prometheus'],
  'artifact-management': ['Artifactory'],
  gitops: ['ArgoCD'],
  'service-mesh': ['Istio', 'Consul'],
  'cloud-design-patterns': [
    'Ambassador',
    'Anti-Corruption Layer',
    'Asynchronous Request-Reply',
    'Backends for Frontends',
    'Bulkhead',
    'Cache-Aside',
    'Choreography',
    'Circuit Breaker',
    'Claim Check',
    'Compensating Transaction',
    'Competing Consumers',
    'Compute Resource Consolidation',
    'CQRS',
    'Deployment Stamps',
    'Event Sourcing',
    'External Configuration Store',
    'Federated Identity',
    'Gatekeeper',
    'Gateway Aggregation',
    'Gateway Offloading',
    'Gateway Routing',
    'Geode',
    'Health Endpoint Monitoring',
    'Idempotent Consumer',
    'Index Table',
    'Leader Election',
    'Materialized View',
    'Messaging Bridge',
    'Pipes and Filters',
    'Priority Queue',
    'Publisher-Subscriber',
    'Quarantine',
    'Queue-Based Load Leveling',
    'Rate Limiting',
    'Retry',
    'Saga',
    'Scheduler Agent Supervisor',
    'Sequential Convoy',
    'Sharding',
    'Sidecar',
    'Static Content Hosting',
    'Strangler Fig',
    'Throttling',
    'Valet Key',
  ],
} satisfies Record<string, readonly string[]>;

describe('devOpsRoadmapSkillInventoryNodes', () => {
  it('gives every roadmap topic one concise description', () => {
    expect(Object.keys(devOpsRoadmapDescriptions)).toHaveLength(
      devOpsRoadmapItems.length,
    );

    for (const item of devOpsRoadmapItems) {
      expect(item.description.trim().length).toBeGreaterThan(0);
      expect(item.description.split(/\s+/).length).toBeGreaterThanOrEqual(10);
      expect(item.description.split(/\s+/).length).toBeLessThanOrEqual(20);
    }
  });

  it('shares canonical descriptions with the skill inventory', () => {
    expect(
      devOpsRoadmapSkillInventoryNodes.map(({ id, description }) => ({
        id,
        description,
      })),
    ).toEqual(
      devOpsRoadmapItems.map(({ id, description }) => ({ id, description })),
    );
  });

  it('stores only yellow roadmap.sh DevOps nodes using their exact titles', () => {
    expect(
      devOpsRoadmapSkillInventoryNodes.map(({ id, title }) => ({ id, title })),
    ).toEqual(devOpsRoadmapItems.map(({ id, title }) => ({ id, title })));
  });

  it('keeps gaps outside node display rows', () => {
    expect(
      devOpsRoadmapSkillInventoryNodes.every(
        (node) => !Object.prototype.hasOwnProperty.call(node, 'gaps'),
      ),
    ).toBe(true);
    expect(devOpsRoadmapSkillInventoryGaps.length).toBeGreaterThan(0);
  });

  it('stores clean evidence skill tokens without embedded levels', () => {
    const allSkillTokens = devOpsRoadmapSkillInventoryNodes.flatMap(
      (node) => node.evidenceSkillTokens,
    );
    const programmingLanguageNode = devOpsRoadmapSkillInventoryNodes.find(
      (node) => node.id === 'learn-programming-language',
    );

    expect(allSkillTokens).toContain('Python');
    expect(allSkillTokens).toContain('Node.js');
    expect(allSkillTokens).not.toContain('Python basic');
    expect(programmingLanguageNode?.coveredRoadmapConcepts).toEqual([]);
    expect(
      allSkillTokens.some((token) =>
        /\b(?:basic|working|strong|none)\b/i.test(token),
      ),
    ).toBe(false);
  });

  it('maps Operating System evidence to matching roadmap.sh suggestions', () => {
    const operatingSystemNode = devOpsRoadmapSkillInventoryNodes.find(
      (node) => node.id === 'operating-system',
    );

    expect(operatingSystemNode?.evidenceSkillTokens).toEqual([
      'macOS',
      'Ubuntu',
      'Debian',
      'Fedora',
    ]);
    expect(operatingSystemNode?.evidenceSkillTokens).not.toContain(
      'Docker containers',
    );
    expect(operatingSystemNode?.coveredRoadmapConcepts).toEqual([]);
  });

  it('keeps node evidence tokens scoped to direct roadmap-relevant skills', () => {
    const nodesById = new Map(
      devOpsRoadmapSkillInventoryNodes.map((node) => [node.id, node]),
    );

    expect(
      nodesById.get('terminal-knowledge')?.evidenceSkillTokens,
    ).toEqual([
      'Bash',
      'Process Monitoring',
      'Performance Monitoring',
      'Text Manipulation',
      'Neovim',
    ]);
    expect(nodesById.get('containers')?.evidenceSkillTokens).toEqual([
      'Docker',
      'LXC',
    ]);
    expect(
      nodesById.get('version-control-systems')?.evidenceSkillTokens,
    ).toEqual(['Git']);
    expect(nodesById.get('vcs-hosting')?.evidenceSkillTokens).toEqual([
      'GitHub',
      'GitLab',
    ]);
    expect(
      nodesById.get('networking-protocols')?.evidenceSkillTokens,
    ).toEqual(['DNS', 'HTTP', 'HTTPS', 'SSL / TLS', 'SSH']);
    expect(nodesById.get('setup-x')?.evidenceSkillTokens).toEqual([
      'Forward Proxy',
      'Reverse Proxy',
      'Load Balancer',
      'Nginx',
    ]);
    expect(nodesById.get('cloud-providers')?.evidenceSkillTokens).toEqual([
      'AWS',
      'Google Cloud',
    ]);
    expect(nodesById.get('serverless')?.evidenceSkillTokens).toEqual([
      'AWS Lambda',
    ]);
    expect(nodesById.get('provisioning')?.evidenceSkillTokens).toEqual([
      'Terraform',
    ]);
    expect(
      nodesById.get('configuration-management')?.evidenceSkillTokens,
    ).toEqual(['Ansible']);
    expect(nodesById.get('ci-cd-tools')?.evidenceSkillTokens).toEqual([
      'GitHub Actions',
      'GitLab CI',
    ]);
    expect(nodesById.get('secret-management')?.evidenceSkillTokens).toEqual([
      'Sealed Secrets',
      'AWS Secrets Manager',
    ]);
    expect(
      nodesById.get('infrastructure-monitoring')?.evidenceSkillTokens,
    ).toEqual(['Prometheus', 'Grafana']);
    expect(nodesById.get('logs-management')?.evidenceSkillTokens).toEqual([
      'Loki',
      'Elastic Stack',
    ]);
    expect(
      nodesById.get('container-orchestration')?.evidenceSkillTokens,
    ).toEqual(['Kubernetes', 'Amazon EKS']);
    expect(
      nodesById.get('application-monitoring')?.evidenceSkillTokens,
    ).toEqual(['Prometheus']);
    expect(nodesById.get('artifact-management')?.evidenceSkillTokens).toEqual([
      'Amazon ECR',
      'GitHub Packages',
    ]);
    expect(nodesById.get('gitops')?.evidenceSkillTokens).toEqual(['ArgoCD']);
    expect(nodesById.get('service-mesh')?.evidenceSkillTokens).toEqual([]);
    expect(nodesById.get('service-mesh')?.evidenceSkillTokens).not.toContain(
      'Envoy',
    );
    expect(
      nodesById.get('dev-environment-platform-engineering'),
    ).toBeUndefined();
    expect(nodesById.get('soft-skills-collaboration')).toBeUndefined();
    expect(
      nodesById.get('cloud-design-patterns')?.evidenceSkillTokens,
    ).toEqual([]);
    expect(
      nodesById.get('cloud-design-patterns')?.coveredRoadmapConcepts,
    ).toEqual([
      'Backends for Frontends',
      'Gateway Aggregation',
      'Idempotent Consumer',
      'Publisher-Subscriber',
      'Rate Limiting',
      'Retry',
      'Sidecar',
      'Static Content Hosting',
    ]);
  });

  it('uses roadmap alternatives as covered concepts for option-style nodes', () => {
    const nodesById = new Map(
      devOpsRoadmapSkillInventoryNodes.map((node) => [node.id, node]),
    );

    expect(nodesById.get('cloud-providers')?.coveredRoadmapConcepts).toEqual(
      [],
    );
    expect(nodesById.get('ci-cd-tools')?.coveredRoadmapConcepts).toEqual(
      [],
    );
    expect(nodesById.get('artifact-management')?.coveredRoadmapConcepts).toEqual(
      [],
    );
  });

  it('keeps covered concepts limited to roadmap.sh suggestions for the same node', () => {
    const unexpectedConcepts = devOpsRoadmapSkillInventoryNodes.flatMap(
      (node) => {
        const allowedConcepts = new Set(
          roadmapSuggestedConceptsByNodeId[node.id] ?? [],
        );

        return (node.coveredRoadmapConcepts ?? [])
          .filter((concept) => !allowedConcepts.has(concept))
          .map((concept) => `${node.id}:${concept}`);
      },
    );

    expect(unexpectedConcepts).toEqual([]);
  });

  it('does not duplicate evidence skill tokens as covered concepts', () => {
    const normalizeToken = (value: string) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

    const duplicateConcepts = devOpsRoadmapSkillInventoryNodes.flatMap(
      (node) => {
        const evidenceSkillTokens = new Set(
          node.evidenceSkillTokens.map(normalizeToken),
        );

        return (node.coveredRoadmapConcepts ?? [])
          .filter((concept) => evidenceSkillTokens.has(normalizeToken(concept)))
          .map((concept) => `${node.id}:${concept}`);
      },
    );

    expect(duplicateConcepts).toEqual([]);
  });

  it('stores Kubernetes certifications as the strongest evidence row', () => {
    const orchestrationNode = devOpsRoadmapSkillInventoryNodes.find(
      (node) => node.id === 'container-orchestration',
    );

    expect(orchestrationNode?.certifications).toEqual([
      kubernetesCertifications.cka,
      kubernetesCertifications.ckad,
      kubernetesCertifications.kcna,
    ]);
  });

  it('keeps recommended-but-uncovered items in a separate gap catalog', () => {
    const nodeIds = new Set(
      devOpsRoadmapSkillInventoryNodes.map((node) => node.id),
    );

    expect(
      devOpsRoadmapSkillInventoryGaps.every((gap) => nodeIds.has(gap.nodeId)),
    ).toBe(true);
    expect(devOpsRoadmapSkillInventoryGaps).toContainEqual({
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
    });
  });
});
