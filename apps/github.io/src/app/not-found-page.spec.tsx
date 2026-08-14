import { render } from '@testing-library/react';
import { LayoutContent, VStack } from '@astryxdesign/core/Layout';

import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  it('explains the missing skill and links back to the skill list', () => {
    const { getByRole, getByText } = render(<NotFoundPage />);

    expect(
      getByRole('heading', { level: 1, name: 'Skill not found' }),
    ).toBeTruthy();
    expect(getByText('The requested skill does not exist.')).toBeTruthy();
    expect(
      getByRole('link', { name: 'Back to Skills' }).getAttribute('href'),
    ).toBe('/skills');
  });

  it('uses distinct standalone route recovery copy', () => {
    const { getByRole } = render(<NotFoundPage recoveryDestination="home" />);

    expect(getByRole('link', { name: 'Back home' }).getAttribute('href')).toBe(
      '/',
    );
  });

  it('uses one scrollable Astryx content region inside the global frame', () => {
    const { container, getByTestId } = render(<NotFoundPage isFullWidth />);
    const { getByTestId: getControlByTestId } = render(
      <LayoutContent
        data-testid="scrollable-not-found-control"
        label="Control"
        padding={0}
        role="main"
      />,
    );
    const scrollableControl = getControlByTestId(
      'scrollable-not-found-control',
    );

    expect(container.querySelectorAll('.astryx-layout-content')).toHaveLength(
      1,
    );
    expect(getByTestId('not-found-page').className).toBe(
      scrollableControl.className,
    );
  });

  it('keeps the standalone wildcard page constrained without LayoutContent', () => {
    const { container, getByTestId } = render(
      <NotFoundPage recoveryDestination="home" />,
    );
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

    expect(container.querySelectorAll('.astryx-layout-content')).toHaveLength(
      0,
    );
    expect(getByTestId('not-found-page').className).not.toBe(
      getControlByTestId('unconstrained-not-found-control').className,
    );
  });
});
