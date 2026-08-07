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

if (!flexibleInfrastructure || !continuousIntegration) {
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
      screen.getByText(
        doraCapabilityDescriptions['continuous-integration'],
      ),
    ).toBeTruthy();
    expect(screen.getByTestId('dora-capability-card')).toBeTruthy();
  });

  it('renders evidence rows in skill, certification, other order without visible row labels', () => {
    render(
      <DoraCapabilityCard
        capability={flexibleInfrastructure}
        description={doraCapabilityDescriptions['flexible-infrastructure']}
        evidence={devOpsCapabilityEvidenceItems}
        scores={curatedDevOpsCapabilityRadarScores}
      />,
    );

    const rows = screen.getAllByTestId('dora-capability-evidence-row');

    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.getAttribute('data-group'))).toEqual([
      'skills',
      'certifications',
      'other',
    ]);
    expect(screen.queryByText('Skills')).toBeNull();
    expect(screen.queryByText('Certifications')).toBeNull();
    expect(screen.queryByText('Other')).toBeNull();
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

    const row = screen.getByTestId('dora-capability-evidence-row');

    expect(
      within(row)
        .getAllByRole('group')
        .map((group) => group.getAttribute('aria-label')),
    ).toEqual([
      'Experience evidence: Terraform pipelines',
      'Experience evidence: CodeBuild PR gates',
      'Experience evidence: Nx affected',
      'Experience evidence: GitOps handoff',
      'Experience evidence: Tag reliability',
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

    expect(
      screen.getByRole('group', { name: 'Experience evidence: CI' }),
    ).toBeTruthy();
    expect(
      screen.queryByRole('group', { name: 'Experience evidence: Versioning' }),
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

    const row = screen.getByTestId('dora-capability-evidence-row');

    expect(row.getAttribute('data-wrap')).toBe('true');
    expect(
      screen.getByRole('list', {
        name: 'Continuous Integration other evidence',
      }),
    ).toBe(row);
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
  });
});
