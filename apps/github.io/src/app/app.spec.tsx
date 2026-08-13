import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, vi } from 'vitest';

import App, { AppRoutes } from './app';
import { skills } from './skills/skill-list.data';

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
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('renders the home page with a scroll-persistent search nav', () => {
    const {
      getAllByTestId,
      getByLabelText,
      getByRole,
      getByText,
      queryByLabelText,
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
    expect(queryByLabelText('Skill breadcrumb')).toBeNull();
    expect(queryByRole('link', { name: 'Skills' })).toBeNull();
    expect(queryByRole('search', { name: 'Skill search' })).toBeNull();
    expect(queryByRole('combobox', { name: 'Search skills' })).toBeNull();
    expect(getByRole('button', { name: 'Search skills' })).toBeTruthy();
    expect(getByRole('heading', { level: 1, name: 'Home' })).toBeTruthy();
    expect(getByRole('heading', { level: 2, name: 'Top skills' })).toBeTruthy();
    expect(getByLabelText('Highlighted skills')).toBeTruthy();
    const showAll = getByRole('link', { name: 'Show all' });

    expect(showAll.getAttribute('href')).toBe('/skills');
    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(getAllByTestId('dora-capability-card')).toHaveLength(10);
    expect(getByRole('link', { name: 'Learn more' })).toBeTruthy();
    expect(getByText('DORA capabilities')).toBeTruthy();
  });

  it('replaces home content with the selected skill page', async () => {
    const { getByRole, queryByRole } = render(<App />);

    fireEvent.click(getByRole('button', { name: 'Search skills' }));
    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'terraform' },
    });
    const terraformOption = await waitFor(() =>
      getByRole('option', { name: 'Terraform' }),
    );
    expect(within(terraformOption).queryByRole('img')).toBeNull();
    fireEvent.click(terraformOption);

    expect(getByRole('heading', { level: 1, name: 'Terraform' })).toBeTruthy();
    expect(queryByRole('main', { name: 'Home' })).toBeNull();
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

describe('AppRoutes', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('renders the complete alphabetical linked catalog at /skills', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/skills']}>
        <AppRoutes />
      </MemoryRouter>,
    );
    const main = getByRole('main', { name: 'Skills' });
    const links = within(main).getAllByRole('link');
    const expectedSkills = [...skills].sort((left, right) =>
      left.name.localeCompare(right.name),
    );

    expect(links).toHaveLength(skills.length);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      expectedSkills.map((skill) => `/skills/${skill.id}`),
    );
    expectedSkills.forEach((skill) => {
      expect(within(main).getAllByText(skill.name)).toHaveLength(1);
    });
  });

  it('renders Kubernetes skill detail for its clean route', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/skills/kubernetes']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(getByRole('heading', { level: 1, name: 'Kubernetes' })).toBeTruthy();
    expect(
      getByRole('heading', { level: 2, name: 'In practice' }),
    ).toBeTruthy();
  });

  it('renders React skill detail for its clean route', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/skills/react']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(getByRole('heading', { level: 1, name: 'React' })).toBeTruthy();
  });

  it('renders the skill not found page for an unknown skill route', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/skills/not-real']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(
      getByRole('heading', { level: 1, name: 'Skill not found' }),
    ).toBeTruthy();
  });

  it('renders the skill not found page for an unknown route', () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={['/not-a-route']}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(
      getByRole('heading', { level: 1, name: 'Skill not found' }),
    ).toBeTruthy();
  });
});
