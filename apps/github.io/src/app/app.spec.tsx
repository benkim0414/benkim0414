import { readFileSync } from 'node:fs';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, vi } from 'vitest';

import App, { AppProviders, AppRoutes } from './app';
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

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="location">{location.pathname}</output>;
}

function renderAppRoutes(path: string, includeLocation = false) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProviders>
        {includeLocation ? <LocationProbe /> : null}
        <AppRoutes />
      </AppProviders>
    </MemoryRouter>,
  );
}

function renderRootAppRoutes(path: string) {
  return render(
    <MemoryRouter basename="/" initialEntries={[path]}>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </MemoryRouter>,
  );
}

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    window.localStorage.clear();
  });

  it('uses dark mode by default', () => {
    render(<App />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('restores a saved light mode preference', () => {
    window.localStorage.setItem('theme-mode', 'light');

    render(<App />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('switches to light mode and saves the selection', () => {
    const { getByRole } = render(<App />);

    fireEvent.click(getByRole('button', { name: 'Switch to light mode' }));

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem('theme-mode')).toBe('light');
    expect(
      getByRole('button', { name: 'Switch to dark mode' }),
    ).toBeTruthy();
  });

  it('renders the home route inside the global navigation frame', () => {
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
    const navigation = getByRole('navigation', { name: 'Global navigation' });
    const shell = navigation.closest('[data-height="fill"]');

    if (!(shell instanceof HTMLElement)) {
      throw new Error('Expected the global navigation layout shell.');
    }

    expect(shell.dataset.height).toBe('fill');
    expect(shell.className).not.toMatch(
      /\b(?:mx-auto|h-dvh|min-h-screen|w-full|max-w-md|overflow-hidden)\b/,
    );
    expect(main.className).toContain('astryx-stack');
    expect(shell.querySelectorAll('.astryx-layout-content')).toHaveLength(1);
    expect(queryByText('Ben Kim')).toBeNull();
    expect(queryByLabelText('Skill breadcrumb')).toBeNull();
    fireEvent.click(getByRole('button', { name: 'Navigation' }));
    expect(
      within(getByRole('dialog', { name: 'Navigation' })).getByRole('link', {
        name: 'Skills',
      }),
    ).toBeTruthy();
    expect(queryByRole('search', { name: 'Skill search' })).toBeNull();
    expect(queryByRole('combobox', { name: 'Search skills' })).toBeNull();
    expect(getByRole('button', { name: 'Search' })).toBeTruthy();
    expect(
      getByRole('heading', {
        level: 1,
        name: 'DevOps engineering practice',
      }),
    ).toBeTruthy();
    expect(getByRole('heading', { level: 2, name: 'Top skills' })).toBeTruthy();
    expect(getByLabelText('Highlighted skills')).toBeTruthy();
    const showAll = getByRole('link', { name: 'Show all' });

    expect(showAll.getAttribute('href')).toBe('/skills');
    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(getAllByTestId('dora-capability-card')).toHaveLength(10);
    expect(getByRole('link', { name: 'Learn more' })).toBeTruthy();
    expect(getByText('DORA capabilities')).toBeTruthy();
  });

  it('navigates from home search to the selected skill page', async () => {
    const { getByRole, queryByRole } = render(<App />);

    fireEvent.click(getByRole('button', { name: 'Search' }));
    fireEvent.change(getByRole('combobox', { name: 'Search' }), {
      target: { value: 'terraform' },
    });
    const terraformOption = await waitFor(() =>
      getByRole('option', { name: 'Terraform' }),
    );
    expect(within(terraformOption).queryByRole('img')).toBeNull();
    fireEvent.click(terraformOption);

    const heading = getByRole('heading', { level: 1, name: 'Terraform' });

    expect(heading).toBeTruthy();
    expect(document.activeElement).toBe(heading);
    expect(queryByRole('main', { name: 'Home' })).toBeNull();
  });

  it('does not render generic navigation or desktop shell content', () => {
    const { getByRole, queryByLabelText, queryByText } = render(<App />);

    expect(getByRole('link', { name: 'Home' })).toBeTruthy();
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

  it.each([
    ['/skills', 'Skills'],
    ['/skills/kubernetes', 'Kubernetes'],
  ])(
    'renders %s from the root deployment path without the recovery page',
    (path, pageHeading) => {
      const { getByRole, queryByRole } = renderRootAppRoutes(path);

      expect(getByRole('heading', { level: 1, name: pageHeading })).toBeTruthy();
      expect(
        queryByRole('heading', { level: 1, name: 'Skill not found' }),
      ).toBeNull();
    },
  );

  it('configures BrowserRouter with Vite base URL', () => {
    const appSource = readFileSync('src/app/app.tsx', 'utf8');

    expect(appSource).toContain(
      '<BrowserRouter basename={import.meta.env.BASE_URL}>',
    );
  });

  it.each([
    ['/', 'DevOps engineering practice', 1],
    ['/roadmap', 'DevOps roadmap', 2],
    ['/skills', 'Skills', 1],
    ['/skills/kubernetes', 'Kubernetes', 1],
  ])(
    'renders one shell-owned scroll region at %s',
    (path, pageHeading, headingLevel) => {
      const { getAllByRole, getByRole } = renderAppRoutes(path);
      const shell = getByRole('navigation', {
        name: 'Global navigation',
      }).closest('[data-height="fill"]');

      if (!(shell instanceof HTMLElement)) {
        throw new Error('Expected the global navigation layout shell.');
      }

      expect(
        getAllByRole('navigation', { name: 'Global navigation' }),
      ).toHaveLength(1);
      expect(getAllByRole('button', { name: 'Search' })).toHaveLength(1);
      expect(shell.querySelectorAll('.astryx-layout-content')).toHaveLength(1);
      expect(
        getByRole('heading', { level: headingLevel, name: pageHeading }),
      ).toBeTruthy();
    },
  );

  it('renders the DevOps roadmap page for its clean route', () => {
    const { getByRole, getByText } = renderAppRoutes('/roadmap');

    expect(
      getByRole('heading', { level: 2, name: 'DevOps roadmap' }),
    ).toBeTruthy();
    expect(getByText('About this roadmap')).toBeTruthy();
    expect(getByRole('list', { name: 'DevOps Roadmap' })).toBeTruthy();
  });

  it('navigates from detail search to the selected skill route', async () => {
    const { getByRole, getByTestId } = renderAppRoutes(
      '/skills/kubernetes',
      true,
    );

    fireEvent.click(getByRole('button', { name: 'Search' }));
    fireEvent.change(getByRole('combobox', { name: 'Search' }), {
      target: { value: 'terraform' },
    });
    fireEvent.click(
      await waitFor(() => getByRole('option', { name: 'Terraform' })),
    );

    expect(getByRole('heading', { level: 1, name: 'Terraform' })).toBeTruthy();
    expect(getByTestId('location').textContent).toBe('/skills/terraform');
  });

  it.each([
    ['description', 'scoped IAM'],
    ['category', 'IaC'],
    ['keyword', 'provisioning'],
  ])(
    'finds and navigates to Terraform from its %s search data',
    async (_matchKind, query) => {
      const { getByRole, getByTestId } = renderAppRoutes('/skills', true);

      fireEvent.click(getByRole('button', { name: 'Search' }));
      fireEvent.change(getByRole('combobox', { name: 'Search' }), {
        target: { value: query },
      });
      fireEvent.click(
        await waitFor(() => getByRole('option', { name: 'Terraform' })),
      );

      expect(getByTestId('location').textContent).toBe('/skills/terraform');
    },
  );

  it('renders the complete alphabetical linked catalog at /skills', () => {
    const { getByRole } = renderAppRoutes('/skills');
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
    const { getByRole, queryByRole } = renderAppRoutes('/skills/kubernetes');

    expect(getByRole('heading', { level: 1, name: 'Kubernetes' })).toBeTruthy();
    expect(
      getByRole('heading', { level: 2, name: 'Experience' }),
    ).toBeTruthy();
    expect(
      queryByRole('heading', { level: 2, name: 'In practice' }),
    ).toBeNull();
  });

  it('renders React skill detail for its clean route', () => {
    const { getByRole } = renderAppRoutes('/skills/react');

    expect(getByRole('heading', { level: 1, name: 'React' })).toBeTruthy();
  });

  it('keeps the unknown skill recovery region in the shell scroll owner', () => {
    const { getByRole } = renderAppRoutes('/skills/not-real');
    const main = getByRole('main');
    const shell = getByRole('navigation', {
      name: 'Global navigation',
    }).closest('[data-height="fill"]');

    if (!(shell instanceof HTMLElement)) {
      throw new Error('Expected the global navigation layout shell.');
    }

    expect(
      getByRole('heading', { level: 1, name: 'Skill not found' }),
    ).toBeTruthy();
    expect(getByRole('button', { name: 'Search' })).toBeTruthy();
    expect(main.dataset.layout).toBe('full-width');
    expect(main.className).toContain('astryx-stack');
    const layoutContents = shell.querySelectorAll('.astryx-layout-content');

    expect(layoutContents).toHaveLength(1);
    expect(layoutContents[0].contains(main)).toBe(true);
    expect(
      getByRole('link', { name: 'Back to Skills' }).getAttribute('href'),
    ).toBe('/skills');
  });

  it('renders the skill not found page for an unknown route', () => {
    const { getByRole, queryByRole } = renderAppRoutes('/not-a-route');
    const main = getByRole('main');

    expect(
      getByRole('heading', { level: 1, name: 'Skill not found' }),
    ).toBeTruthy();
    expect(queryByRole('button', { name: 'Search' })).toBeNull();
    expect(main.dataset.layout).toBe('standalone');
    expect(getByRole('link', { name: 'Back home' }).getAttribute('href')).toBe(
      '/',
    );
  });
});
