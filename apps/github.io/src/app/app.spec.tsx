import { fireEvent, render, within } from '@testing-library/react';

import App from './app';

describe('App', () => {
  it('renders the mobile-only skills page successfully', () => {
    const { getAllByTestId, getByLabelText, getByRole, getByText } = render(
      <App />,
    );
    const main = getByRole('main', { name: 'Skills' });

    expect(main.className).toContain('max-w-md');
    expect(getByRole('heading', { level: 1, name: 'Skills' })).toBeTruthy();
    expect(getByRole('search', { name: 'Skill search' })).toBeTruthy();
    expect(getByRole('combobox', { name: 'Search skills' })).toBeTruthy();
    expect(getByLabelText('Highlighted skills')).toBeTruthy();
    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('React')).toBeTruthy();
  });

  it('filters only the full skills list from the top search', () => {
    const { getAllByTestId, getByLabelText, getByRole } = render(<App />);

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'terraform' },
    });

    const carousel = getByLabelText('Highlighted skills');
    const list = getByRole('region', { name: 'Skills' });

    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(within(carousel).getByRole('heading', { name: 'Kubernetes' }))
      .toBeTruthy();
    expect(within(list).getByText('Terraform')).toBeTruthy();
  });

  it('does not render generic navigation or desktop shell content', () => {
    const { queryByLabelText, queryByRole, queryByText } = render(<App />);

    expect(queryByRole('link', { name: 'Home' })).toBeNull();
    expect(queryByLabelText('Primary navigation')).toBeNull();
    expect(queryByText('Generic Layout Skeleton')).toBeNull();
    expect(queryByText('Content Region')).toBeNull();
    expect(queryByText('Footer Region')).toBeNull();
  });
});
