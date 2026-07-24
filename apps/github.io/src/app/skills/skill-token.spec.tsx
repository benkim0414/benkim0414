import { render } from '@testing-library/react';

import { SkillToken } from './skill-token';

describe('SkillToken', () => {
  it('renders a mapped Simple Icons skill as a brand-colored token', () => {
    const { container, getByText } = render(<SkillToken label="Docker" />);
    const token = container.querySelector('[data-testid="skill-token"]');
    const icon = container.querySelector('svg');

    expect(token).toBeTruthy();
    expect(token?.className).toContain('astryx-token');
    expect(token?.getAttribute('style')).toContain(
      '--skill-token-background: #2496ED',
    );
    expect(token?.getAttribute('style')).toContain(
      '--skill-token-foreground: #111827',
    );
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('chooses the neutral foreground for a light brand background', () => {
    const { getByText } = render(<SkillToken label="GitLab CI" />);
    const token = getByText('GitLab CI').closest('[data-testid="skill-token"]');

    expect(token?.getAttribute('style')).toContain(
      '--skill-token-foreground: #111827',
    );
  });

  it('chooses the inverse foreground for a dark brand background', () => {
    const { getByText } = render(<SkillToken label="GitHub" />);
    const token = getByText('GitHub').closest('[data-testid="skill-token"]');

    expect(token?.getAttribute('style')).toContain(
      '--skill-token-foreground: #ffffff',
    );
  });

  it('keeps unmapped skills text-only with the purple roadmap treatment', () => {
    const { container, getByText } = render(
      <SkillToken label="Forward Proxy" />,
    );
    const token = container.querySelector('[data-testid="skill-token"]');

    expect(token).toBeTruthy();
    expect(token?.className).toContain('astryx-token');
    expect(token?.getAttribute('style')).toBeNull();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('keeps color-only brands text-only with the purple roadmap treatment', () => {
    const { container, getByText } = render(<SkillToken label="AWS" />);
    const token = container.querySelector('[data-testid="skill-token"]');

    expect(token).toBeTruthy();
    expect(token?.className).toContain('astryx-token');
    expect(token?.getAttribute('style')).toBeNull();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('keeps the visible label as the accessible token text', () => {
    const { getByText } = render(<SkillToken label="GitHub Actions" />);

    expect(getByText('GitHub Actions').textContent).toBe('GitHub Actions');
  });
});
