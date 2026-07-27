import { render, screen } from '@testing-library/react';

import type {
  CapabilityEvidenceItem,
  DoraCapabilityScore,
} from './devops-capability-evidence.types';
import { DevOpsCapabilityBarList } from './devops-capability-bar-list';

describe('DevOpsCapabilityBarList', () => {
  const evidence = [
    {
      id: 'delivery-evidence',
      title: 'Delivery workflow ownership',
      type: 'experience',
      capabilityKeys: ['continuous-delivery'],
      summary: 'Public delivery experience summary.',
      isPublic: true,
      strength: 'primary',
    },
    {
      id: 'private-evidence',
      title: 'Private company deployment details',
      type: 'experience',
      capabilityKeys: ['continuous-delivery'],
      summary: 'Private deployment details.',
      isPublic: true,
      isSensitive: true,
      strength: 'primary',
    },
    {
      id: 'infrastructure-evidence',
      title: 'Infrastructure practice summary',
      type: 'learning',
      capabilityKeys: ['flexible-infrastructure'],
      summary:
        'Public infrastructure learning summary for a different capability.',
      isPublic: true,
      strength: 'strong',
    },
  ] satisfies readonly CapabilityEvidenceItem[];

  const scores = [
    {
      capabilityKey: 'continuous-integration',
      label: 'Continuous Integration',
      score: 3,
      maxScore: 5,
      evidenceIds: [],
      evidenceCounts: {},
    },
    {
      capabilityKey: 'continuous-delivery',
      label: 'Continuous Delivery',
      score: 5,
      maxScore: 5,
      evidenceIds: ['delivery-evidence'],
      strongestEvidenceId: 'delivery-evidence',
      evidenceCounts: { experience: 1 },
    },
    {
      capabilityKey: 'pervasive-security',
      label: 'Pervasive Security',
      score: 0,
      maxScore: 5,
      evidenceIds: [],
      evidenceCounts: {},
    },
  ] satisfies readonly DoraCapabilityScore[];

  it('renders ranked capabilities and omits zero-score capabilities', () => {
    render(<DevOpsCapabilityBarList evidence={evidence} scores={scores} />);

    const rows = screen.getByLabelText('DevOps capability score list').children;

    expect(rows[0]?.textContent).toContain('Continuous Delivery');
    expect(rows[1]?.textContent).toContain('Continuous Integration');
    expect(screen.queryByText('Pervasive Security')).toBeNull();
    expect(screen.getByText('Delivery workflow ownership')).toBeTruthy();
  });

  it('ignores a public strongest evidence item from another capability', () => {
    const mismatchedScore: DoraCapabilityScore = {
      ...scores[1],
      evidenceIds: ['infrastructure-evidence'],
      strongestEvidenceId: 'infrastructure-evidence',
    };

    render(
      <DevOpsCapabilityBarList
        evidence={evidence}
        scores={[mismatchedScore]}
      />,
    );

    expect(screen.getByText('Continuous Delivery')).toBeTruthy();
    expect(screen.queryByText('Infrastructure practice summary')).toBeNull();
  });

  it('renders nothing without scores', () => {
    const { container } = render(
      <DevOpsCapabilityBarList evidence={evidence} scores={[]} />,
    );

    expect(container.childElementCount).toBe(0);
  });
});
