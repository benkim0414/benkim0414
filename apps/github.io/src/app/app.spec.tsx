import { render } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('renders the skills-first page successfully', () => {
    const { getByRole, getByText } = render(<App />);
    const heading = getByRole('heading', { level: 1, name: 'Skills' });

    expect(getByRole('main', { name: 'Skills' })).toBeTruthy();
    expect(heading.closest('span')).toBeNull();
    expect(getByRole('combobox', { name: 'Search skills' })).toBeTruthy();
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('React')).toBeTruthy();
  });

  it('does not render the previous generic shell content', () => {
    const { queryByLabelText, queryByRole, queryByText } = render(<App />);

    expect(queryByRole('link', { name: 'Home' })).toBeNull();
    expect(queryByLabelText('Primary navigation')).toBeNull();
    expect(queryByText('Generic Layout Skeleton')).toBeNull();
    expect(queryByText('Content Region')).toBeNull();
    expect(queryByText('Footer Region')).toBeNull();
  });
});
