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

  it('summarizes long fallback titles into compact evidence labels', () => {
    expect(
      getCapabilityEvidenceLabel(
        evidence({
          title:
            'Operational ownership across distributed deployment environments',
          type: 'experience',
        }),
      ),
    ).toBe('Deployment ownership');
  });

  it('keeps short fallback titles unchanged', () => {
    expect(
      getCapabilityEvidenceLabel(
        evidence({
          title: 'CI/CD workflow',
          type: 'experience',
        }),
      ),
    ).toBe('CI/CD workflow');
  });

  it('detects HTTPS GitHub repository URLs but not profiles or pull requests', () => {
    expect(
      isGithubRepositoryUrl('https://github.com/benkim0414/devops-roadmap'),
    ).toBe(true);
    expect(
      isGithubRepositoryUrl('http://www.github.com/benkim0414/devops-roadmap'),
    ).toBe(false);
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

  it.each(['education', 'experience', 'learning'] as const)(
    'uses type fallback icons for %s evidence even with known technologies',
    (type) => {
      const icon = getCapabilityEvidenceIcon(
        evidence({ technologies: ['Kubernetes'], type }),
      );
      const { container } = render(<>{icon}</>);

      expect(
        container.querySelector(
          '[data-testid="capability-evidence-fallback-icon"]',
        ),
      ).toBeTruthy();
      expect(container.textContent).toBe('');
    },
  );

  it('uses a fallback icon when no technology brand exists', () => {
    const icon = getCapabilityEvidenceIcon(
      evidence({ technologies: ['Unknown'] }),
    );
    const { container } = render(<>{icon}</>);

    expect(container.querySelector('.astryx-icon, svg')).toBeTruthy();
  });
});
