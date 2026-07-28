import { render } from '@testing-library/react';

import { getCapabilityEvidenceIcon } from './capability-evidence-icon';
import { getCapabilityEvidenceLabel } from './capability-evidence-label';
import {
  getGithubRepositoryLabel,
  isGithubRepositoryUrl,
} from './capability-evidence-url';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

function evidence(
  overrides: Partial<CapabilityEvidenceItem>,
): CapabilityEvidenceItem {
  return {
    id: 'evidence',
    title:
      'Very long capability evidence title that should not be compact text',
    type: 'learning',
    capabilityKeys: ['flexible-infrastructure'],
    summary: 'Public-safe evidence summary for helper tests.',
    isPublic: true,
    strength: 'strong',
    ...overrides,
  };
}

describe('capability evidence compact helpers', () => {
  it('prefers explicit compact labels over long titles', () => {
    expect(getCapabilityEvidenceLabel(evidence({ label: 'CKA' }))).toBe('CKA');
  });

  it('derives a known technology label before falling back to title', () => {
    expect(
      getCapabilityEvidenceLabel(
        evidence({
          technologies: ['Kubernetes'],
          title: 'Long Kubernetes learning path',
        }),
      ),
    ).toBe('Kubernetes');
  });

  it('detects HTTPS GitHub repository URLs but not profiles or pull requests', () => {
    expect(
      isGithubRepositoryUrl('https://github.com/benkim0414/devops-roadmap'),
    ).toBe(true);
    expect(
      isGithubRepositoryUrl('http://www.github.com/benkim0414/devops-roadmap'),
    ).toBe(true);
    expect(
      isGithubRepositoryUrl('git@github.com:benkim0414/devops-roadmap.git'),
    ).toBe(false);
    expect(
      isGithubRepositoryUrl('ftp://github.com/benkim0414/devops-roadmap'),
    ).toBe(false);
    expect(isGithubRepositoryUrl('https://github.com/benkim0414')).toBe(false);
    expect(
      isGithubRepositoryUrl(
        'https://github.com/benkim0414/devops-roadmap/pull/1',
      ),
    ).toBe(false);
    expect(isGithubRepositoryUrl('https://github.com/orgs/example')).toBe(
      false,
    );
    expect(isGithubRepositoryUrl('https://github.com/topics/react')).toBe(
      false,
    );
  });

  it('derives a repository label from a GitHub repository URL', () => {
    expect(
      getGithubRepositoryLabel('https://github.com/benkim0414/devops-roadmap'),
    ).toBe('devops-roadmap');
  });

  it('prefers known technology icons over type fallback icons', () => {
    const icon = getCapabilityEvidenceIcon(
      evidence({ technologies: ['Kubernetes'], type: 'learning' }),
    );
    const { container } = render(<>{icon}</>);

    expect(container.querySelector('svg path')?.getAttribute('d')).toBeTruthy();
    expect(container.textContent).toBe('');
  });

  it('uses a fallback icon when no technology brand exists', () => {
    const icon = getCapabilityEvidenceIcon(
      evidence({ technologies: ['Unknown'] }),
    );
    const { container } = render(<>{icon}</>);

    expect(container.querySelector('.astryx-icon, svg')).toBeTruthy();
  });
});
