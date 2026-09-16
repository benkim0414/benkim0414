import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { DoraCapabilityCard } from './dora-capability-card';
import { doraCapabilityDescriptions } from './dora-capability-card.evidence';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { COMPACT_SURFACE_QUERY } from '../skills/skill-table-responsive';

const flexibleInfrastructure = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'flexible-infrastructure',
);
const continuousIntegration = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'continuous-integration',
);
const continuousDelivery = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'continuous-delivery',
);
const deploymentAutomation = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'deployment-automation',
);
const testAutomation = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'test-automation',
);
const monitoringObservability = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'monitoring-observability',
);
const pervasiveSecurity = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'pervasive-security',
);
const documentationQuality = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'documentation-quality',
);
const versionControl = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'version-control',
);
const trunkBasedDevelopment = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'trunk-based-development',
);

if (
  !flexibleInfrastructure ||
  !continuousIntegration ||
  !continuousDelivery ||
  !deploymentAutomation ||
  !testAutomation ||
  !monitoringObservability ||
  !pervasiveSecurity ||
  !documentationQuality ||
  !versionControl ||
  !trunkBasedDevelopment
) {
  throw new Error('Missing DORA capability fixture');
}

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

function setCompactSurface(isCompact: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query === COMPACT_SURFACE_QUERY ? isCompact : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function evidence(
  overrides: Partial<CapabilityEvidenceItem>,
): CapabilityEvidenceItem {
  return {
    id: 'evidence',
    title: 'Evidence',
    label: 'Evidence',
    type: 'experience',
    capabilityKeys: ['continuous-integration'],
    summary: 'Public-safe DORA capability card component test evidence.',
    isPublic: true,
    strength: 'strong',
    ...overrides,
  };
}

describe('DoraCapabilityCard', () => {
  it('starts compact evidence collapsed with count badges and reveals rows on request', () => {
    setCompactSurface(true);

    render(
      <DoraCapabilityCard
        capability={flexibleInfrastructure}
        description={doraCapabilityDescriptions['flexible-infrastructure']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const disclosure = screen.getByRole('button', {
      name: 'Relevant experience 5 Certifications 2 Technical skills 12',
    });

    expect(disclosure.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(disclosure);

    expect(disclosure.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: 'Relevant experience' })).toBe(
      disclosure,
    );
    expect(screen.getAllByText('Relevant experience')).toHaveLength(2);
    const rows = screen.getAllByTestId('dora-capability-evidence-row');

    expect(rows).toHaveLength(3);
    expect(
      screen
        .getAllByTestId('dora-capability-evidence-group-label')
        .map((label) => label.parentElement?.textContent),
    ).toEqual(['Certifications', 'Technical skills']);
    expect(disclosure.closest('[data-testid="dora-capability-card"]')?.querySelectorAll('.astryx-badge')).toHaveLength(0);
  });

  it('includes learning evidence in the disclosure count', () => {
    setCompactSurface(true);

    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={[
          evidence({
            id: 'learning',
            type: 'learning',
            label: 'Delivery foundations',
          }),
        ]}
      />,
    );

    expect(screen.getByRole('button', { name: 'Learning 1' })).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Learning' })).toBeTruthy();
  });

  it.each([
    [
      testAutomation,
      'Built automated test coverage across database-backed services, affected quality gates, service generators, Prometheus rules, and container health checks.',
      [
        'PostgreSQL test environments',
        'Alert-rule tests',
        'Container smoke tests',
        'Generator tests',
        'Affected-change quality gates',
      ],
      [
        'AWS CodeBuild',
        'PostgreSQL',
        'AWS Systems Manager Parameter Store',
        'Jest',
        'Testcontainers',
        'Nx',
        'GitHub Actions',
        'Docker',
        'TypeScript',
        'Prometheus',
        'promtool',
      ],
    ],
    [
      monitoringObservability,
      'Built a version-controlled cloud native observability platform with tested workload alerts, routed notifications, suppression controls, and encrypted alert destinations.',
      [
        'Observability stack',
        'Workload alerts',
        'Notification routing',
        'Alert suppression',
        'Encrypted destinations',
      ],
      [
        'Prometheus',
        'promtool',
        'Alertmanager',
        'Loki',
        'Grafana',
        'Alloy',
        'Kubernetes',
        'Helm',
        'Argo CD',
        'Kustomize',
        'Sealed Secrets',
        'AWS EventBridge',
        'AWS Lambda',
      ],
    ],
    [
      pervasiveSecurity,
      'Implemented Terraform-managed least-privilege access, complete MFA coverage, identity security alerting, IRSA workload identity, and encrypted secret delivery.',
      [
        'Terraform scoped IAM',
        'MFA coverage',
        'IAM security alerts',
        'Shared IRSA modules',
        'Automated secret delivery',
      ],
      [
        'Terraform',
        'AWS IAM',
        'IRSA',
        'OpenID Connect',
        'Kubernetes',
        'Kubernetes RBAC',
        'Sealed Secrets',
        'Argo CD',
        'AWS EventBridge',
        'AWS Lambda',
        'Docker',
        'Amazon ECR',
      ],
    ],
    [
      documentationQuality,
      'Maintained a structured, indexed, and current documentation system, integrating documentation with engineering changes and cross-verifying operational claims.',
      [
        'Documentation corpus',
        'Indexed solutions',
        'Documentation currency',
        'Docs with changes',
        'Verified claims',
      ],
      ['Markdown', 'YAML', 'Git'],
    ],
  ] as const)(
    'renders the exact production %s rows without internal dates',
    (capability, summary, experienceLabels, skillTitles) => {
      const { container } = render(
        <DoraCapabilityCard
          capability={capability}
          description={doraCapabilityDescriptions[capability.key]}
          evidence={devOpsCapabilityEvidenceItems}
          scores={curatedDevOpsCapabilityRadarScores}
        />,
      );

      const experienceRow = screen.getByRole('list', {
        name: 'Relevant experience',
      });
      const skillRow = screen.getByRole('list', { name: 'Technical skills' });
      const rows = screen.getAllByTestId('dora-capability-evidence-row');
      const skillTokens = within(skillRow).getAllByTestId('skill-token');

      expect(screen.getByText(summary)).toBeTruthy();
      expect(rows.map((row) => row.getAttribute('data-group'))).toEqual(
        capability.key === 'monitoring-observability'
          ? ['applied', 'certifications', 'skills']
          : ['applied', 'skills'],
      );
      expect(
        within(experienceRow)
          .getAllByRole('group')
          .map((group) => group.getAttribute('aria-label')),
      ).toEqual(
        experienceLabels.map((label) => `Experience evidence: ${label}`),
      );
      expect(skillTokens.map((token) => token.textContent)).toEqual(
        skillTitles,
      );
      expect(
        within(skillRow)
          .getAllByRole('group')
          .map((group) => group.getAttribute('aria-label')),
      ).toEqual(skillTitles.map((title) => `Skill evidence: ${title}`));
      expect(
        experienceRow.compareDocumentPosition(skillRow) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(container.textContent).not.toMatch(/\b20\d{2}-\d{2}-\d{2}\b/);
    },
  );

  it('renders the full capability title and description', () => {
    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Continuous Integration' }),
    ).toBeTruthy();
    expect(
      screen.getByText(doraCapabilityDescriptions['continuous-integration']),
    ).toBeTruthy();
    expect(screen.getByTestId('dora-capability-card')).toBeTruthy();
  });

  it('uses the Astryx full-width card contract', () => {
    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const cardSurface = screen.getByTestId(
      'dora-capability-card',
    ).parentElement;

    if (!(cardSurface instanceof HTMLElement)) {
      throw new Error('Expected the DORA capability card surface.');
    }

    expect(cardSurface.style.getPropertyValue('--x-width')).toBe('100%');
  });

  it.each([
    [
      continuousIntegration,
      doraCapabilityDescriptions['continuous-integration'],
      'Built and evolved CI from reusable AWS CodePipeline and CodeBuild pipelines to monorepo GitHub Actions, with affected quality gates and immutable artifacts.',
    ],
    [
      continuousDelivery,
      doraCapabilityDescriptions['continuous-delivery'],
      'Built approval-gated and GitOps delivery across AWS CodePipeline and GitHub Actions, with immutable artifacts, automated migrations, and reliable Kubernetes reconciliation.',
    ],
  ] as const)(
    'renders the %s description before its experience summary with uniform prose typography',
    (capability, description, summary) => {
      render(
        <DoraCapabilityCard
          capability={capability}
          description={description}
          evidence={devOpsCapabilityEvidenceItems}
          scores={curatedDevOpsCapabilityRadarScores}
        />,
      );

      const descriptionText = screen.getByText(description);
      const summaryText = screen.getByText(summary);
      const card = screen.getByTestId('dora-capability-card');

      expect(descriptionText.tagName).toBe('P');
      expect(descriptionText.getAttribute('data-type')).toBe('body');
      expect(descriptionText.getAttribute('data-color')).toBe('secondary');
      expect(summaryText.tagName).toBe('P');
      expect(summaryText.getAttribute('data-type')).toBe('body');
      expect(summaryText.getAttribute('data-color')).toBe('secondary');
      expect(
        descriptionText.compareDocumentPosition(summaryText) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(card.querySelector('blockquote')).toBeNull();
      expect(screen.queryByText(/my experience/i)).toBeNull();
    },
  );

  it('renders the approved Continuous Delivery experience and skill rows', () => {
    render(
      <DoraCapabilityCard
        capability={continuousDelivery}
        description={doraCapabilityDescriptions['continuous-delivery']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const experienceRow = screen.getByRole('list', {
      name: 'Relevant experience',
    });
    const skillRow = screen.getByRole('list', { name: 'Technical skills' });

    expect(within(experienceRow).getAllByRole('listitem')).toHaveLength(5);
    expect(within(skillRow).getAllByRole('listitem')).toHaveLength(14);
    expect(
      within(experienceRow)
        .getAllByRole('group')
        .map((group) => group.getAttribute('aria-label')),
    ).toEqual([
      'Experience evidence: Approval-gated deployment automation',
      'Experience evidence: Automated deployment process',
      'Experience evidence: Version-controlled environment state',
      'Experience evidence: Same package across environments',
      'Experience evidence: Automated database migrations',
    ]);
  });

  it.each([
    [
      deploymentAutomation,
      doraCapabilityDescriptions['deployment-automation'],
      'Built merge-triggered deployment automation across environments, with generator-based onboarding, automated secret delivery, and deterministic Kubernetes rendering.',
      [
        'Merge-triggered deployments',
        'Environment-neutral deploys',
        'Generator-based onboarding',
        'Automated secret delivery',
        'Deterministic overlays',
      ],
      [
        'AWS CodePipeline',
        'Terraform',
        'GitHub Actions',
        'Argo CD',
        'GitOps',
        'Docker',
        'Amazon ECR',
        'Kubernetes',
        'OpenID Connect',
        'Nx',
        'GitHub API',
        'Kustomize',
        'Sealed Secrets',
      ],
      ['applied', 'certifications', 'skills'],
    ],
    [
      flexibleInfrastructure,
      doraCapabilityDescriptions['flexible-infrastructure'],
      'Built reusable Terraform and Kubernetes foundations with workload identity, scoped IAM, delivery-platform provisioning, and GitOps-managed environments.',
      [
        'Terraform cloud foundations',
        'Shared IRSA modules',
        'Terraform scoped IAM',
        'Reusable Terraform CI pipelines',
        'Version-controlled environment state',
      ],
      [
        'Terraform',
        'AWS',
        'Kubernetes',
        'kubectl',
        'Helm',
        'Docker',
        'Amazon ECR',
        'AWS IAM',
        'IRSA',
        'Kustomize',
        'Argo CD',
        'GitOps',
      ],
      ['applied', 'certifications', 'skills'],
    ],
  ] as const)(
    'renders the exact production %s evidence rows',
    (
      capability,
      description,
      summary,
      experienceLabels,
      skillTitles,
      expectedGroups,
    ) => {
      render(
        <DoraCapabilityCard
          capability={capability}
          description={description}
          evidence={devOpsCapabilityEvidenceItems}
          scores={curatedDevOpsCapabilityRadarScores}
        />,
      );

      const experienceRow = screen.getByRole('list', {
        name: 'Relevant experience',
      });
      const skillRow = screen.getByRole('list', { name: 'Technical skills' });
      const rows = screen.getAllByTestId('dora-capability-evidence-row');

      expect(screen.getByText(summary)).toBeTruthy();
      expect(rows.map((row) => row.getAttribute('data-group'))).toEqual(
        expectedGroups,
      );
      expect(within(experienceRow).getAllByRole('listitem')).toHaveLength(5);
      expect(within(skillRow).getAllByRole('listitem')).toHaveLength(
        skillTitles.length,
      );
      expect(
        within(experienceRow)
          .getAllByRole('group')
          .map((group) => group.getAttribute('aria-label')),
      ).toEqual(
        experienceLabels.map((label) => `Experience evidence: ${label}`),
      );
      expect(
        within(skillRow)
          .getAllByRole('group')
          .map((group) => group.getAttribute('aria-label')),
      ).toEqual(skillTitles.map((title) => `Skill evidence: ${title}`));
    },
  );

  it.each([
    [
      versionControl,
      doraCapabilityDescriptions['version-control'],
      'Built and maintained version-controlled delivery platforms spanning reusable Terraform pipelines and GitOps-managed Kubernetes environments, with traceable infrastructure, configuration, automation, and database changes.',
      [
        'Reusable Terraform CI pipelines',
        'Automated deployment process',
        'Version-controlled environment state',
        'Automated database migrations',
        'Merge-preserved history',
      ],
      13,
    ],
    [
      trunkBasedDevelopment,
      doraCapabilityDescriptions['trunk-based-development'],
      'Created and maintained single-trunk delivery repositories, integrating short-lived branches and small change batches with merge-preserved history and affected quality gates.',
      [
        'Single trunk repositories',
        'Short-lived branch flow',
        'Small change landings',
        'Affected-change quality gates',
        'Merge-preserved history',
      ],
      6,
    ],
  ] as const)(
    'renders %s with its curated summary before technical skills',
    (capability, description, summary, experienceLabels, skillCount) => {
      const { container } = render(
        <DoraCapabilityCard
          capability={capability}
          description={description}
          evidence={devOpsCapabilityEvidenceItems}
          scores={curatedDevOpsCapabilityRadarScores}
        />,
      );

      const experienceRow = screen.getByRole('list', {
        name: 'Relevant experience',
      });
      const skillRow = screen.getByRole('list', { name: 'Technical skills' });

      expect(screen.getByText(summary)).toBeTruthy();
      expect(experienceRow).toBeTruthy();
      expect(skillRow).toBeTruthy();
      expect(within(experienceRow).getAllByRole('listitem')).toHaveLength(5);
      expect(within(skillRow).getAllByRole('listitem')).toHaveLength(
        skillCount,
      );
      expect(
        within(experienceRow)
          .getAllByRole('group')
          .map((group) => group.getAttribute('aria-label')),
      ).toEqual(
        experienceLabels.map((label) => `Experience evidence: ${label}`),
      );
      expect(
        experienceRow.compareDocumentPosition(skillRow) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(container.textContent).not.toContain('2024-02-28');
      expect(container.textContent).not.toContain('2026-08-09');
    },
  );

  it('renders Version Control skills neutrally with known logos and fallback coverage', () => {
    render(
      <DoraCapabilityCard
        capability={versionControl}
        description={doraCapabilityDescriptions['version-control']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const skillRow = screen.getByRole('list', { name: 'Technical skills' });
    const skillTokens = within(skillRow).getAllByTestId('skill-token');
    expect(skillTokens).toHaveLength(13);
    expect(
      screen.getByRole('group', { name: 'Skill evidence: GitHub' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('group', { name: 'Skill evidence: AWS CodePipeline' }),
    ).toBeTruthy();
    expect(
      screen
        .getByText('GitHub')
        .closest('[data-testid="skill-token"]')
        ?.querySelector('path')
        ?.getAttribute('fill'),
    ).toBe('#181717');
    expect(
      screen
        .getByText('AWS CodePipeline')
        .closest('[data-testid="skill-token"]')
        ?.querySelector('img')
        ?.getAttribute('src'),
    ).toMatch(/assets\/.*\.svg/);
    expect(
      screen
        .getByText('Conventional Commits')
        .closest('[data-testid="skill-token"]')
        ?.getAttribute('style'),
    ).toBeNull();
    expect(
      screen
        .getByText('Conventional Commits')
        .closest('[data-testid="skill-token"]')
        ?.querySelector('path')
        ?.getAttribute('fill'),
    ).toBe('#FE5196');
    expect(
      skillTokens.every((token) => token.getAttribute('style') === null),
    ).toBe(true);
  });

  it('does not render a summary for capabilities without one', () => {
    const description =
      doraCapabilityDescriptions['flexible-infrastructure'];

    render(
      <DoraCapabilityCard
        capability={flexibleInfrastructure}
        description={description}
        evidence={devOpsCapabilityEvidenceItems}
        scores={undefined}
      />,
    );

    const card = screen.getByTestId('dora-capability-card');
    const prose = card.querySelectorAll(
      'p[data-type="body"][data-color="secondary"]',
    );

    expect(prose).toHaveLength(1);
    expect(prose.item(0).textContent).toBe(description);
    expect(card.querySelector('blockquote')).toBeNull();
  });

  it('labels certification evidence between experience and technical skills', () => {
    render(
      <DoraCapabilityCard
        capability={flexibleInfrastructure}
        description={doraCapabilityDescriptions['flexible-infrastructure']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const rows = screen.getAllByTestId('dora-capability-evidence-row');
    const experienceRow = screen.getByRole('list', {
      name: 'Relevant experience',
    });
    const certificationRow = screen.getByRole('list', {
      name: 'Certifications',
    });
    const skillRow = screen.getByRole('list', { name: 'Technical skills' });

    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.getAttribute('data-group'))).toEqual([
      'applied',
      'certifications',
      'skills',
    ]);
    expect(screen.getAllByText('Relevant experience')).toHaveLength(2);
    expect(screen.getByText('Certifications')).toBeTruthy();
    expect(screen.getByText('Technical skills')).toBeTruthy();
    expect(screen.queryByText('Learning')).toBeNull();

    expect(certificationRow).toBe(rows[1]);
    expect(
      within(certificationRow)
        .getAllByRole('doc-noteref')
        .map((citation) => citation.textContent),
    ).toEqual(['KCNA', 'CKA']);
    expect(
      experienceRow.compareDocumentPosition(certificationRow) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      certificationRow.compareDocumentPosition(skillRow) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it.each([
    [continuousDelivery, ['CKAD']],
    [deploymentAutomation, ['CKAD']],
    [monitoringObservability, ['CKA', 'CKAD']],
    [flexibleInfrastructure, ['KCNA', 'CKA']],
  ] as const)(
    'renders the approved %s certification citations in registry order',
    (capability, certificationLabels) => {
      render(
        <DoraCapabilityCard
          capability={capability}
          description={doraCapabilityDescriptions[capability.key]}
          evidence={devOpsCapabilityEvidenceItems}
          scores={curatedDevOpsCapabilityRadarScores}
        />,
      );

      expect(
        within(screen.getByRole('list', { name: 'Certifications' }))
          .getAllByRole('doc-noteref')
          .map((citation) => citation.textContent),
      ).toEqual(certificationLabels);
    },
  );

  it('omits the certification row for unaffected capabilities', () => {
    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    expect(
      screen.queryByRole('list', { name: 'Certifications' }),
    ).toBeNull();
  });

  it('delegates evidence rendering to CapabilityEvidence', () => {
    render(
      <DoraCapabilityCard
        capability={flexibleInfrastructure}
        description={doraCapabilityDescriptions['flexible-infrastructure']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    expect(screen.getAllByTestId('skill-token')).toHaveLength(12);
    expect(
      screen.getByRole('group', { name: 'Skill evidence: Kubernetes' }),
    ).toBeTruthy();
    expect(
      screen.queryByRole('group', {
        name: 'Certification evidence: Kubernetes cert',
      }),
    ).toBeNull();
    expect(
      screen.queryByRole('group', { name: 'Learning evidence: Workloads' }),
    ).toBeNull();
  });

  it('uses curated score order within each evidence group', () => {
    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const appliedRow = screen.getByRole('list', {
      name: 'Relevant experience',
    });
    const skillRow = screen.getByRole('list', { name: 'Technical skills' });

    expect(within(appliedRow).getAllByRole('listitem')).toHaveLength(5);
    expect(within(skillRow).getAllByRole('listitem')).toHaveLength(13);
    expect(appliedRow.getAttribute('data-group')).toBe('applied');
    expect(skillRow.getAttribute('data-group')).toBe('skills');

    expect(
      within(appliedRow)
        .getAllByRole('group')
        .map((group) => group.getAttribute('aria-label')),
    ).toEqual([
      'Experience evidence: Reusable Terraform CI pipelines',
      'Experience evidence: Automated pull-request test gates',
      'Experience evidence: Affected-change quality gates',
      'Experience evidence: Automated deployment process',
      'Experience evidence: Reliable Kustomize tag updates',
    ]);
  });

  it('falls back to capability key filtering when scores are omitted', () => {
    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={[
          evidence({
            id: 'ci',
            label: 'CI',
            capabilityKeys: ['continuous-integration'],
          }),
          evidence({
            id: 'version-control',
            label: 'Versioning',
            capabilityKeys: ['version-control'],
          }),
        ]}
      />,
    );

    const row = screen.getByRole('list', { name: 'Relevant experience' });

    expect(row.getAttribute('data-group')).toBe('applied');
    expect(
      within(row).getByRole('group', { name: 'Experience evidence: CI' }),
    ).toBeTruthy();
    expect(
      within(row).queryByRole('group', {
        name: 'Experience evidence: Versioning',
      }),
    ).toBeNull();
  });

  it('marks evidence rows as wrapping lists', () => {
    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const row = screen.getByRole('list', { name: 'Relevant experience' });

    expect(row.getAttribute('data-wrap')).toBe('true');
    expect(screen.getByRole('list', { name: 'Relevant experience' })).toBe(row);
  });

  it('omits evidence rows when no evidence matches', () => {
    render(
      <DoraCapabilityCard
        capability={continuousIntegration}
        description={doraCapabilityDescriptions['continuous-integration']}
        evidence={[]}
        scores={[]}
      />,
    );

    expect(screen.queryByTestId('dora-capability-evidence-row')).toBeNull();
    expect(screen.queryByText('Relevant experience')).toBeNull();
    expect(screen.queryByText('Certifications')).toBeNull();
    expect(screen.queryByText('Technical skills')).toBeNull();
  });
});
