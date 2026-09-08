import { render } from '@testing-library/react';

import { CountBadge } from './count-badge';

describe('CountBadge', () => {
  it('renders a positive count with the neutral Astryx badge variant', () => {
    const { container, getByText } = render(<CountBadge count={3} />);

    expect(getByText('3')).toBeTruthy();
    expect(container.querySelector('.astryx-badge')?.className).toContain(
      'neutral',
    );
  });

  it('renders zero as a neutral badge', () => {
    const { container, getByText } = render(<CountBadge count={0} />);

    expect(getByText('0')).toBeTruthy();
    expect(container.querySelector('.astryx-badge')?.className).toContain(
      'neutral',
    );
  });
});
