import { render } from '@testing-library/react';

import { TopBar } from './top-bar';

describe('TopBar', () => {
  it('renders the brand link and primary navigation', () => {
    const { getByLabelText, getByRole } = render(
      <TopBar
        brandLabel="App Shell"
        navItems={[
          { label: 'Overview', href: '#overview' },
          { label: 'Work', href: '#work' },
        ]}
      />
    );

    expect(getByRole('link', { name: 'Home' }).textContent).toBe('App Shell');
    expect(getByLabelText('Primary navigation')).toBeTruthy();
    expect(getByRole('link', { name: 'Overview' }).getAttribute('href')).toBe(
      '#overview'
    );
    expect(getByRole('link', { name: 'Work' }).getAttribute('href')).toBe(
      '#work'
    );
  });
});
