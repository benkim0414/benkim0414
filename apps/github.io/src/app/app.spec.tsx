import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';

import App from './app';

vi.stubGlobal(
  'ResizeObserver',
  class ResizeObserverMock {
    observe(): void {
      // Astryx only needs the observer API to exist in jsdom.
    }

    unobserve(): void {
      // Astryx only needs the observer API to exist in jsdom.
    }

    disconnect(): void {
      // Astryx only needs the observer API to exist in jsdom.
    }
  },
);

vi.stubGlobal('matchMedia', (query: string) => ({
  addEventListener: vi.fn(),
  addListener: vi.fn(),
  dispatchEvent: vi.fn(),
  matches: false,
  media: query,
  onchange: null,
  removeEventListener: vi.fn(),
  removeListener: vi.fn(),
}));

describe('App', () => {
  it('renders the mobile-only skills page successfully', () => {
    const { getAllByTestId, getByLabelText, getByRole, getByText } = render(
      <App />,
    );
    const main = getByRole('main', { name: 'Skills' });

    expect(main.className).toContain('max-w-md');
    expect(getByRole('navigation', { name: 'Mobile navigation' }))
      .toBeTruthy();
    expect(getByText('Ben Kim')).toBeTruthy();
    expect(getByRole('heading', { level: 1, name: 'Skills' })).toBeTruthy();
    expect(getByRole('search', { name: 'Skill search' })).toBeTruthy();
    expect(getByRole('combobox', { name: 'Search skills' })).toBeTruthy();
    expect(getByLabelText('Highlighted skills')).toBeTruthy();
    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('React')).toBeTruthy();
  });

  it('filters only the full skills list from the top search', async () => {
    const { getAllByTestId, getByLabelText, getByRole } = render(<App />);

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'terraform' },
    });
    fireEvent.click(
      await waitFor(() => getByRole('option', { name: '"terraform"' })),
    );

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
