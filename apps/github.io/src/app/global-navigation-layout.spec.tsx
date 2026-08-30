import type { ComponentProps, ReactNode } from 'react';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { IconButton } from '@astryxdesign/core/IconButton';
import { LinkProvider } from '@astryxdesign/core/Link';
import {
  colorVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import * as stylex from '@stylexjs/stylex';

import { GlobalNavigationLayout } from './global-navigation-layout';
import { RouterLink } from './router-link';

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

const styles = stylex.create({
  blueIconLink: {
    color: colorVars['--color-icon-blue'],
  },
});

vi.mock('@astryxdesign/core/CommandPalette', () => ({
  CommandPalette: ({
    emptyBootstrapText,
    input,
    isOpen,
    label,
    onValueChange,
    searchSource,
  }: {
    emptyBootstrapText: ReactNode;
    input: ReactNode;
    isOpen: boolean;
    label: string;
    onValueChange?: (value: string) => void;
    searchSource: {
      bootstrap: () => Array<{
        auxiliaryData: { group: string };
        href: string;
        id: string;
        label: string;
      }>;
    };
  }) => {
    if (!isOpen) {
      return null;
    }

    const items = searchSource.bootstrap();
    if (items.length === 0) {
      return (
        <div aria-label={label} role="dialog">
          {input}
          {emptyBootstrapText}
        </div>
      );
    }

    const groups = [...new Set(items.map((item) => item.auxiliaryData.group))];

    return (
      <div aria-label={label} role="dialog">
        {input}
        <div role="listbox">
          {groups.map((group) => (
            <div key={group}>
              <div>{group}</div>
              {items
                .filter((item) => item.auxiliaryData.group === group)
                .map((item) => (
                  <div
                    aria-label={item.label}
                    aria-selected={false}
                    key={item.id}
                    onClick={() => onValueChange?.(item.id)}
                    role="option"
                  >
                    {item.label}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  },
  CommandPaletteInput: (props: ComponentProps<'input'>) => (
    <input
      aria-controls="command-results"
      aria-expanded
      role="combobox"
      {...props}
    />
  ),
}));

function RouteContent() {
  return <p>Route content</p>;
}

function Location() {
  const location = useLocation();

  return <output data-testid="location">{location.pathname}</output>;
}

function renderGlobalLayout(initialEntry = '/') {
  const view = render(
    <Theme theme={neutralTheme}>
      <LinkProvider component={RouterLink}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Location />
          <Routes>
            <Route element={<GlobalNavigationLayout />}>
              <Route index element={<RouteContent />} />
              <Route path="roadmap" element={<RouteContent />} />
              <Route path="skills" element={<RouteContent />} />
              <Route path="skills/:skillId" element={<RouteContent />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </LinkProvider>
    </Theme>,
  );

  return view;
}

function expectTooltipFor(control: HTMLElement, text: string) {
  const describedBy = control.getAttribute('aria-describedby');

  expect(describedBy).toBeTruthy();

  const matchingTooltip = describedBy
    ?.split(' ')
    .map((id) => control.ownerDocument.getElementById(id))
    .find(
      (element) =>
        element?.getAttribute('role') === 'tooltip' &&
        element.textContent?.trim() === text,
    );

  expect(matchingTooltip).toBeTruthy();
}

describe('GlobalNavigationLayout', () => {
  it('renders one heading-free global nav above routed content', () => {
    const { container, getByRole, getByText, queryByRole } =
      renderGlobalLayout();
    const navigation = getByRole('navigation', { name: 'Global navigation' });
    const shell = navigation.closest('[data-height="fill"]');

    if (!(shell instanceof HTMLElement)) {
      throw new Error('Expected the global navigation layout shell.');
    }

    expect(getByRole('button', { name: 'Search' })).toBeTruthy();
    expect(queryByRole('heading', { name: /skills/i })).toBeNull();
    expect(getByText('Route content')).toBeTruthy();
    expect(shell.className).toContain('astryx-layout');
    expect(shell.className).not.toMatch(
      /\b(?:mx-auto|h-dvh|min-h-screen|w-full|max-w-md|overflow-hidden)\b/,
    );
    expect(navigation.parentElement?.parentElement?.className).toContain(
      'astryx-layout-header',
    );
    expect(navigation.className).toContain('astryx-top-nav');
    expect(container.querySelectorAll('.astryx-top-nav')).toHaveLength(1);
    expect(container.querySelectorAll('.astryx-layout-content')).toHaveLength(
      1,
    );
    expect(
      getByText('Route content').closest('.astryx-layout-content'),
    ).toBeTruthy();
  });

  it('keeps primary page links out of the top navigation', () => {
    const { getByRole, queryByRole } = renderGlobalLayout();
    const navigation = getByRole('navigation', { name: 'Global navigation' });

    expect(getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/');
    expect(queryByRole('link', { name: 'Roadmap' })).toBeNull();
    expect(queryByRole('link', { name: 'Skills' })).toBeNull();
    expect(
      within(navigation).getAllByRole('link').map(
        (link) => link.getAttribute('aria-label') ?? link.textContent?.trim(),
      ),
    ).toEqual(['Home', 'GitHub']);
    expect(getByRole('link', { name: 'GitHub' }).getAttribute('href')).toBe(
      'https://github.com/benkim0414',
    );
  });

  it('opens an end-side navigation drawer with the primary route links', async () => {
    const { getByRole } = renderGlobalLayout();

    fireEvent.click(getByRole('button', { name: 'Navigation' }));

    const drawer = getByRole('dialog', { name: 'Navigation' });
    expect(drawer.getAttribute('data-side')).toBe('end');
    expect(drawer.hasAttribute('open')).toBe(true);
    expect(
      within(drawer).getByRole('link', { name: 'Skills' }).getAttribute('href'),
    ).toBe('/skills');
    expect(
      within(drawer).getByRole('link', { name: 'Roadmap' }).getAttribute('href'),
    ).toBe('/roadmap');

    fireEvent.click(within(drawer).getByRole('button', { name: 'Close navigation' }));
    await waitFor(() => expect(drawer.hasAttribute('open')).toBe(false));
  });

  it('renders Home as an icon-only link at the start of the global nav', () => {
    const { getByRole } = renderGlobalLayout();
    const navigation = getByRole('navigation', { name: 'Global navigation' });
    const homeLink = getByRole('link', { name: 'Home' });

    expect(navigation.firstElementChild?.contains(homeLink)).toBe(true);
    expect(homeLink.textContent?.trim()).toBe('');
    expect(homeLink.querySelector('svg')).toBeTruthy();
  });

  it('renders the navigation trigger after the GitHub profile icon link', () => {
    const { getByRole } = renderGlobalLayout();
    const navigation = getByRole('navigation', { name: 'Global navigation' });
    const searchButton = getByRole('button', { name: 'Search' });
    const githubLink = getByRole('link', { name: 'GitHub' });
    const navigationButton = getByRole('button', { name: 'Navigation' });

    expect(navigation.contains(searchButton)).toBe(true);
    expect(navigation.contains(githubLink)).toBe(true);
    expect(searchButton.compareDocumentPosition(githubLink)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(githubLink.compareDocumentPosition(navigationButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(githubLink.textContent?.trim()).toBe('');
    expect(githubLink.querySelector('svg')).toBeTruthy();
  });

  it('opens the global GitHub profile link in a separate browsing context', () => {
    const { getByRole } = renderGlobalLayout();

    const githubLink = getByRole('link', { name: 'GitHub' });

    expect(githubLink.getAttribute('target')).toBe('_blank');
    expect(githubLink.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders an Astryx attribution footer with an external profile link', () => {
    const { container, getByRole, getByText } = renderGlobalLayout();
    const footer = getByRole('contentinfo');
    const profileLink = within(footer).getByRole('link', {
      name: /@benkim0414/i,
    });

    expect(getByText('Route content').compareDocumentPosition(footer)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(within(footer).getByRole('img', { name: 'Astryx' })).toBeTruthy();
    expect(footer.textContent).toContain('Built with');
    expect(footer.textContent).toContain('by');
    expect(footer.textContent).toContain('@benkim0414');
    expect(footer.textContent).not.toContain('Astryx');
    expect(profileLink.getAttribute('href')).toBe(
      'https://github.com/benkim0414',
    );
    expect(profileLink.getAttribute('target')).toBe('_blank');
    expect(profileLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(container.querySelectorAll('footer')).toHaveLength(1);
  });

  it('provides tooltips for global nav icon controls', () => {
    const { getByRole } = renderGlobalLayout();

    expectTooltipFor(getByRole('link', { name: 'Home' }), 'Home');
    expectTooltipFor(
      getByRole('button', { name: 'Search' }),
      'Search',
    );
    expectTooltipFor(
      getByRole('button', { name: 'Navigation' }),
      'Navigation',
    );
    expectTooltipFor(getByRole('link', { name: 'GitHub' }), 'GitHub');
  });

  it('colors the Home icon link with the blue icon color', () => {
    const { getByRole } = render(
      <Theme theme={neutralTheme}>
        <MemoryRouter initialEntries={['/roadmap']}>
          <GlobalNavigationLayout />
          <IconButton
            href="/"
            icon={<span />}
            label="Blue icon control"
            size="sm"
            variant="ghost"
            xstyle={styles.blueIconLink}
          />
        </MemoryRouter>
      </Theme>,
    );
    const homeLink = getByRole('link', { name: 'Home' });
    const blueIconControl = getByRole('link', {
      name: 'Blue icon control',
    });

    expect(getComputedStyle(homeLink).color).toBe(
      getComputedStyle(blueIconControl).color,
    );
  });

  it('keeps the selected Home icon link blue', () => {
    const { getByRole } = renderGlobalLayout();
    const homeLink = getByRole('link', { name: 'Home' });
    const icon = homeLink.querySelector('svg');

    expect(homeLink.getAttribute('aria-current')).toBe('page');
    expect(icon?.getAttribute('color')).toBe('var(--color-icon-blue)');
  });

  it('applies the Astryx blue token directly to the Home heroicon', () => {
    const { getByRole } = renderGlobalLayout();
    const icon = getByRole('link', { name: 'Home' }).querySelector('svg');

    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('color')).toBe('var(--color-icon-blue)');
  });

  it.each([
    ['Skills', '/skills'],
    ['Roadmap', '/roadmap'],
  ])(
    'navigates to %s and dismisses the drawer',
    async (label, path) => {
      const { getByRole, getByTestId, getByText } = renderGlobalLayout();
      const shellScrollOwner = getByText('Route content').closest(
        '.astryx-layout-content',
      );

      if (!(shellScrollOwner instanceof HTMLElement)) {
        throw new Error('Expected the shell scroll owner.');
      }

      shellScrollOwner.scrollTop = 160;
      expect(shellScrollOwner.scrollTop).toBe(160);

      fireEvent.click(getByRole('button', { name: 'Navigation' }));
      const drawer = getByRole('dialog', { name: 'Navigation' });
      fireEvent.click(within(drawer).getByRole('link', { name: label }));

      expect(getByTestId('location').textContent).toBe(path);
      expect(shellScrollOwner.scrollTop).toBe(0);
      await waitFor(() => expect(drawer.hasAttribute('open')).toBe(false));
    },
  );

  it.each([
    ['/', 'Home'],
    ['/roadmap', 'Roadmap'],
    ['/skills', 'Skills'],
    ['/skills/kubernetes', 'Skills'],
  ])(
    'marks only %s primary drawer navigation item as current',
    (path, currentLink) => {
      const { getByRole } = renderGlobalLayout(path);
      fireEvent.click(getByRole('button', { name: 'Navigation' }));
      const drawer = getByRole('dialog', { name: 'Navigation' });

      for (const label of ['Roadmap', 'Skills']) {
        expect(
          within(drawer).getByRole('link', { name: label }).getAttribute('aria-current'),
        ).toBe(label === currentLink ? 'page' : null);
      }
    },
  );

  it('opens search and navigates a selected skill result', () => {
    const { getByRole, getByTestId } = renderGlobalLayout();

    fireEvent.click(getByRole('button', { name: 'Search' }));
    expect(getByRole('dialog', { name: 'Search' })).toBeTruthy();
    expect(
      getByRole('combobox', { name: 'Search' }).getAttribute('placeholder'),
    ).toBe('Search...');

    fireEvent.click(getByRole('option', { name: 'Terraform' }));
    expect(getByTestId('location').textContent).toBe('/skills/terraform');
  });

  it('labels search list items by certifications, skills, and projects', () => {
    const { getByRole, getAllByRole } = renderGlobalLayout();

    fireEvent.click(getByRole('button', { name: 'Search' }));

    expect(getAllByRole('option').map((option) => option.textContent)).toEqual(
      expect.arrayContaining(['CKA', 'Terraform', 'benkim0414/dotfiles']),
    );
    expect(
      Array.from(getByRole('listbox').children).map(
        (group) => group.firstElementChild?.textContent,
      ),
    ).toEqual(['Certifications', 'Skills', 'Projects']);
  });

  it('opens selected certification and project results externally', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const { getByRole } = renderGlobalLayout();

    fireEvent.click(getByRole('button', { name: 'Search' }));
    fireEvent.click(getByRole('option', { name: 'CKA' }));
    fireEvent.click(getByRole('option', { name: 'benkim0414/dotfiles' }));

    expect(open).toHaveBeenNthCalledWith(
      1,
      'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-02c68021-40fe-473f-8087-6309221395ca-certificate.pdf',
      '_blank',
      'noopener,noreferrer',
    );
    expect(open).toHaveBeenNthCalledWith(
      2,
      'https://github.com/benkim0414/dotfiles',
      '_blank',
      'noopener,noreferrer',
    );
  });
});
