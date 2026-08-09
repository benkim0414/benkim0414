import { render, screen, within } from '@testing-library/react';

import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { DoraCapabilityCard } from './dora-capability-card';
import { doraCapabilityDescriptions } from './dora-capability-card.evidence';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const flexibleInfrastructure = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'flexible-infrastructure',
);
const continuousIntegration = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'continuous-integration',
);
const continuousDelivery = doraCapabilityDefinitions.find(
  (capability) => capability.key === 'continuous-delivery',
);

if (!flexibleInfrastructure || !continuousIntegration || !continuousDelivery) {
  throw new Error('Missing DORA capability fixture');
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
    'renders the %s experience summary as supporting context',
    (capability, description, text) => {
      render(
        <DoraCapabilityCard
          capability={capability}
          description={description}
          evidence={devOpsCapabilityEvidenceItems}
          scores={curatedDevOpsCapabilityRadarScores}
        />,
      );

      expect(screen.getByText(text).tagName).toBe('SPAN');
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

  it('does not render a summary for capabilities without one', () => {
    render(
      <DoraCapabilityCard
        capability={flexibleInfrastructure}
        description={doraCapabilityDescriptions['flexible-infrastructure']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    expect(
      screen.queryByText(
        'Built and evolved CI from reusable AWS CodePipeline and CodeBuild pipelines to monorepo GitHub Actions, with affected quality gates and immutable artifacts.',
      ),
    ).toBeNull();
    expect(
      screen.queryByText(
        'Built approval-gated and GitOps delivery across AWS CodePipeline and GitHub Actions, with immutable artifacts, automated migrations, and reliable Kubernetes reconciliation.',
      ),
    ).toBeNull();
  });

  it('labels experience and skill rows without changing group order', () => {
    render(
      <DoraCapabilityCard
        capability={flexibleInfrastructure}
        description={doraCapabilityDescriptions['flexible-infrastructure']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const rows = screen.getAllByTestId('dora-capability-evidence-row');

    expect(rows).toHaveLength(4);
    expect(rows.map((row) => row.getAttribute('data-group'))).toEqual([
      'applied',
      'certifications',
      'skills',
      'learning',
    ]);
    expect(screen.getByText('Relevant experience')).toBeTruthy();
    expect(screen.getByText('Technical skills')).toBeTruthy();
    expect(screen.queryByText('Certifications')).toBeNull();
    expect(screen.queryByText('Learning')).toBeNull();

    expect(screen.getByRole('list', { name: 'Relevant experience' })).toBe(
      rows[0],
    );
    expect(
      screen.getByRole('list', {
        name: 'Flexible Infrastructure certification evidence',
      }),
    ).toBe(rows[1]);
    expect(screen.getByRole('list', { name: 'Technical skills' })).toBe(
      rows[2],
    );
    expect(
      screen.getByRole('list', {
        name: 'Flexible Infrastructure learning evidence',
      }),
    ).toBe(rows[3]);
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

    expect(screen.getByTestId('skill-token')).toBeTruthy();
    expect(
      screen.getByRole('group', { name: 'Skill evidence: Kubernetes' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('group', {
        name: 'Certification evidence: Kubernetes cert',
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole('group', { name: 'Learning evidence: Workloads' }),
    ).toBeTruthy();
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
    expect(screen.queryByText('Technical skills')).toBeNull();
  });
});
