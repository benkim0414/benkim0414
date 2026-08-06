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
  it('renders the mobile-only skills page with a scroll-persistent search nav', () => {
    const {
      getAllByTestId,
      getByLabelText,
      getByRole,
      getByText,
      queryByRole,
      queryByText,
    } = render(<App />);
    const main = getByRole('main', { name: 'Skills' });
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
    expect(main.className).toContain('overflow-y-auto');
    expect(navigation).toBeTruthy();
    expect(queryByText('Ben Kim')).toBeNull();
    expect(queryByRole('search', { name: 'Skill search' })).toBeNull();
    expect(queryByRole('combobox', { name: 'Search skills' })).toBeNull();
    expect(getByRole('button', { name: 'Search skills' })).toBeTruthy();
    expect(getByRole('heading', { level: 1, name: 'Skills' })).toBeTruthy();
    expect(getByLabelText('Highlighted skills')).toBeTruthy();
    expect(getAllByTestId('skill-card')).toHaveLength(22);
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('React')).toBeTruthy();
  });

  it('filters only the full skills list from the command palette', async () => {
    const { getAllByTestId, getByLabelText, getByRole } = render(<App />);

    fireEvent.click(getByRole('button', { name: 'Search skills' }));
    expect(getByRole('dialog', { name: 'Search skills' })).toBeTruthy();
    expect(
      await waitFor(() => getByRole('group', { name: 'Skills' })),
    ).toBeTruthy();
    expect(
      await waitFor(() => getByRole('option', { name: /Terraform/ })),
    ).toBeTruthy();
    expect(getByRole('option', { name: /React/ })).toBeTruthy();
    const terraformOption = getByRole('option', { name: /Terraform/ });
    const terraformAvatar = within(terraformOption).getByRole('img', {
      name: 'Terraform',
    });
    const terraformAvatarContent =
      terraformAvatar.firstElementChild as HTMLElement;

    expect(terraformAvatar.getAttribute('data-size')).toBe('tiny');
    expect(terraformAvatarContent.style.getPropertyValue('--x-width')).toBe(
      '20px',
    );
    expect(terraformAvatarContent.style.getPropertyValue('--x-height')).toBe(
      '20px',
    );

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'terraform' },
    });
    fireEvent.click(
      await waitFor(() => getByRole('option', { name: /Terraform/ })),
    );

    const carousel = getByLabelText('Highlighted skills');
    const list = getByRole('region', { name: 'All skills' });

    expect(getAllByTestId('skill-card')).toHaveLength(6);
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
