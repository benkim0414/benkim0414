import { render } from '@testing-library/react';

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
});
