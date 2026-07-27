import { render, screen } from '@testing-library/react';

import {
  devOpsCapabilityEvidenceItems,
  evidenceTypeLabels,
} from './devops-capability-evidence.data';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { DevOpsEvidenceTimeline } from './devops-evidence-timeline';

const timelineEvidence: CapabilityEvidenceItem[] = [
  {
    id: 'older-project',
    title: 'Older public project',
    type: 'project',
    endDate: '2025-06-15',
    capabilityKeys: ['documentation-quality'],
    summary: 'A public-safe project summary.',
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'newer-learning',
    title: 'Newer public learning',
    type: 'learning',
    date: '2026-03-01',
    capabilityKeys: ['flexible-infrastructure'],
    summary: 'A public-safe learning summary.',
    isPublic: true,
    strength: 'supporting',
  },
];

const undatedEvidence: CapabilityEvidenceItem = {
  id: 'undated-project',
  title: 'Undated public project',
  type: 'project',
  capabilityKeys: ['documentation-quality'],
  summary: 'A public-safe undated project summary.',
  isPublic: true,
  strength: 'supporting',
};

describe('DevOpsEvidenceTimeline', () => {
  it('renders dated evidence in reverse chronological order', () => {
    render(
      <DevOpsEvidenceTimeline
        evidence={timelineEvidence}
        evidenceTypeLabels={evidenceTypeLabels}
      />,
    );

    const listItems = screen.getAllByRole('listitem');

    expect(listItems.map((item) => item.querySelector('strong')?.textContent)).toEqual([
      'Newer public learning',
      'Older public project',
    ]);
    expect(screen.getByText('Learning')).toBeTruthy();
    expect(screen.getByText('Projects')).toBeTruthy();
    expect(screen.getByText('2025-06-15')).toBeTruthy();
  });

  it('returns no timeline for empty or undated evidence', () => {
    const { rerender } = render(
      <DevOpsEvidenceTimeline
        evidence={[]}
        evidenceTypeLabels={evidenceTypeLabels}
      />,
    );

    expect(
      screen.queryByRole('list', { name: 'DevOps capability evidence timeline' }),
    ).toBeNull();

    rerender(
      <DevOpsEvidenceTimeline
        evidence={[undatedEvidence]}
        evidenceTypeLabels={evidenceTypeLabels}
      />,
    );

    expect(
      screen.queryByRole('list', { name: 'DevOps capability evidence timeline' }),
    ).toBeNull();
  });

  it('does not render private or unsupported evidence', () => {
    render(
      <DevOpsEvidenceTimeline
        evidence={[
          ...devOpsCapabilityEvidenceItems,
          {
            ...devOpsCapabilityEvidenceItems[4],
            id: 'unsupported-skill',
            title: 'Unsupported skill',
            supportingEvidenceIds: [],
          },
          {
            ...devOpsCapabilityEvidenceItems[1],
            id: 'private-learning',
            title: 'Private learning',
            isSensitive: true,
          },
        ]}
        evidenceTypeLabels={evidenceTypeLabels}
      />,
    );

    expect(screen.queryByText('Unsupported skill')).toBeNull();
    expect(screen.queryByText('Private learning')).toBeNull();
  });
});
