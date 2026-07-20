import { render } from '@testing-library/react';

import { SkillToken } from './skill-token';

describe('SkillToken', () => {
  it('renders a mapped Simple Icons skill as a brand-colored token', () => {
    const { container, getByText } = render(<SkillToken label="Docker" />);
    const token = getByText('Docker').closest('.skill-token');
    const icon = container.querySelector('.skill-token__icon');

    expect(token).toBeTruthy();
    expect(token?.getAttribute('data-has-icon')).toBe('true');
    expect(token?.getAttribute('data-token-color')).toBe('#2496ED');
    expect(token?.getAttribute('style')).toContain('--skill-token-background: #2496ED');
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps unmapped skills text-only with the purple roadmap treatment', () => {
    const { container, getByText } = render(<SkillToken label="Forward Proxy" />);
    const token = getByText('Forward Proxy').closest('.skill-token');

    expect(token).toBeTruthy();
    expect(token?.getAttribute('data-has-icon')).toBe('false');
    expect(token?.getAttribute('data-token-color')).toBeNull();
    expect(container.querySelector('.skill-token__icon')).toBeNull();
    expect(token?.classList.contains('skill-token--purple')).toBe(true);
  });

  it('keeps the visible label as the accessible token text', () => {
    const { getByText } = render(<SkillToken label="GitHub Actions" />);

    expect(getByText('GitHub Actions').textContent).toBe('GitHub Actions');
  });
});
