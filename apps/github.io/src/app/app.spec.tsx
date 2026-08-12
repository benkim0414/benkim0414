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

HTMLDialogElement.prototype.showModal = vi.fn(function showModal(
  this: HTMLDialogElement,
) {
  this.open = true;
});
HTMLDialogElement.prototype.close = vi.fn(function close(
  this: HTMLDialogElement,
) {
  this.open = false;
});

describe('App', () => {
  it('renders the home page with a scroll-persistent search nav', () => {
    const {
      getAllByTestId,
      getByLabelText,
      getByRole,
      getByText,
      queryByRole,
      queryByText,
    } = render(<App />);
    const main = getByRole('main', { name: 'Home' });
    const navigation = getByRole('navigation', { name: 'Mobile navigation' });
    const mobileShell = main.parentElement;

    expect(mobileShell).toBe(navigation.parentElement);
    expect(mobileShell?.className).toContain('max-w-md');
    expect(mobileShell?.className).toContain('h-dvh');
    expect(mobileShell?.className).toContain('min-h-screen');
    expect(mobileShell?.className).toContain('flex');
    expect(mobileShell?.className).toContain('overflow-hidden');
    expect(main.className).not.toContain('min-h-screen');
    expect(navigation.className).toContain('shrink-0');
    expect(main.className).toContain('flex-1');
    expect(main.className).toContain('astryx-stack');
    expect(navigation).toBeTruthy();
    expect(queryByText('Ben Kim')).toBeNull();
    expect(queryByRole('search', { name: 'Skill search' })).toBeNull();
    expect(queryByRole('combobox', { name: 'Search skills' })).toBeNull();
    expect(getByRole('button', { name: 'Search skills' })).toBeTruthy();
    expect(getByRole('heading', { level: 1, name: 'Home' })).toBeTruthy();
    expect(getByRole('heading', { level: 2, name: 'Top skills' })).toBeTruthy();
    expect(getByLabelText('Highlighted skills')).toBeTruthy();
    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(getAllByTestId('dora-capability-card')).toHaveLength(10);
    expect(getByRole('link', { name: /Learn more about DORA/ })).toBeTruthy();
    expect(getByText('DORA capabilities')).toBeTruthy();
  });

  it('keeps home content unchanged when a skill command is selected', async () => {
    const { getAllByTestId, getByLabelText, getByRole } = render(<App />);
    const capabilityCardsBefore = getAllByTestId('dora-capability-card').map(
      (card) => card.textContent,
    );

    fireEvent.click(getByRole('button', { name: 'Search skills' }));
    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'terraform' },
    });
    const terraformOption = await waitFor(() =>
      getByRole('option', { name: 'Terraform' }),
    );
    expect(within(terraformOption).queryByRole('img')).toBeNull();
    fireEvent.click(terraformOption);

    expect(
      within(getByLabelText('Highlighted skills')).getAllByTestId('skill-card'),
    ).toHaveLength(5);
    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(getAllByTestId('dora-capability-card')).toHaveLength(10);
    expect(
      getAllByTestId('dora-capability-card').map((card) => card.textContent),
    ).toEqual(capabilityCardsBefore);
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
