import { render } from '@testing-library/react';

import { PlaceholderSection } from './placeholder-section';

describe('PlaceholderSection', () => {
  it('renders placeholder section content', () => {
    const { getByRole, getByText } = render(
      <PlaceholderSection
        id="overview"
        label="Section 01"
        title="Content Region"
        body="Reserved space for future profile content."
      />
    );

    expect(getByText('Section 01')).toBeTruthy();
    expect(
      getByRole('heading', { level: 2, name: 'Content Region' })
    ).toBeTruthy();
    expect(
      getByText('Reserved space for future profile content.')
    ).toBeTruthy();
  });
});
