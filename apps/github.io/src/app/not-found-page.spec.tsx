import { render } from '@testing-library/react';
import { VStack } from '@astryxdesign/core/Layout';

import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  it('explains the missing skill and links back to the skill list', () => {
    const { getByRole, getByText } = render(<NotFoundPage />);

    expect(getByRole('heading', { level: 1, name: 'Skill not found' })).toBeTruthy();
    expect(getByText('The requested skill does not exist.')).toBeTruthy();
    expect(getByRole('link', { name: 'Back to Skills' }).getAttribute('href')).toBe(
      '/',
    );
  });

  it('uses an unconstrained layout only when rendered inside the global frame', () => {
    const { getByTestId, rerender } = render(<NotFoundPage />);
    const { getByTestId: getControlByTestId } = render(
      <VStack
        as="main"
        data-testid="unconstrained-not-found-control"
        gap={3}
        hAlign="start"
        paddingBlock={6}
        paddingInline={4}
      />,
    );
    const unconstrainedControl = getControlByTestId(
      'unconstrained-not-found-control',
    );

    expect(getByTestId('not-found-page').className).not.toBe(
      unconstrainedControl.className,
    );

    rerender(<NotFoundPage isFullWidth />);

    expect(getByTestId('not-found-page').className).toBe(
      unconstrainedControl.className,
    );
  });
});
