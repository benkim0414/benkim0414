import { render, screen } from '@testing-library/react';

import { CapabilityEvidence } from './capability-evidence';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

function evidence(
  overrides: Partial<CapabilityEvidenceItem>,
): CapabilityEvidenceItem {
  return {
    id: 'evidence',
    title: 'Long evidence title that should not render when label exists',
    label: 'Evidence',
    type: 'learning',
    capabilityKeys: ['flexible-infrastructure'],
    summary: 'Public-safe evidence summary.',
    isPublic: true,
    strength: 'strong',
    ...overrides,
  };
}

describe('CapabilityEvidence', () => {
  it('renders skill evidence with the existing skill token', () => {
    render(
      <CapabilityEvidence
        evidence={evidence({ label: undefined, title: 'Kubernetes', type: 'skill' })}
      />,
    );

    expect(screen.getByTestId('skill-token')).toBeTruthy();
    expect(screen.getByText('Kubernetes')).toBeTruthy();
  });

  it.each([
    ['learning', 'Learning evidence: Kubernetes'],
    ['experience', 'Experience evidence: CI/CD workflow'],
    ['education', 'Education evidence: Computer Science'],
  ] as const)('renders %s evidence as a compact token', (type, label) => {
    render(
      <CapabilityEvidence
        evidence={evidence({
          label: label.split(': ')[1],
          type,
          proofUrl: 'https://example.com/proof',
        })}
      />,
    );

    expect(screen.getByLabelText(label)).toBeTruthy();
    expect(screen.getByRole('link', { name: label }).getAttribute('href')).toBe(
      'https://example.com/proof',
    );
  });

  it('renders certification evidence through CertificationCitation', () => {
    render(
      <CapabilityEvidence
        citationNumber={3}
        evidence={evidence({
          label: 'CKA',
          proofUrl: 'https://example.com/cka',
          technologies: ['Kubernetes'],
          type: 'certification',
        })}
      />,
    );

    expect(screen.getByRole('doc-noteref', { name: 'Citation 3: CKA' })).toBeTruthy();
  });

  it('renders project evidence as a citation', () => {
    render(
      <CapabilityEvidence
        citationNumber={4}
        evidence={evidence({
          label: undefined,
          proofUrl: 'https://github.com/benkim0414/devops-roadmap',
          title: 'Long public repository project evidence title',
          type: 'project',
        })}
      />,
    );

    expect(
      screen.getByRole('doc-noteref', { name: 'Citation 4: devops-roadmap' }),
    ).toBeTruthy();
  });

  it('does not filter evidence marked non-public', () => {
    render(
      <CapabilityEvidence
        evidence={evidence({
          isPublic: false,
          label: 'Renderer only',
          type: 'experience',
        })}
      />,
    );

    expect(
      screen.getByLabelText('Experience evidence: Renderer only'),
    ).toBeTruthy();
  });
});
