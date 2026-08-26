import type { ComponentProps, ReactNode } from 'react';
import { fireEvent, render, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { IconButton } from '@astryxdesign/core/IconButton';
import { LinkProvider } from '@astryxdesign/core/Link';
import { TopNavItem } from '@astryxdesign/core/TopNav';
import {
  colorVars,
  fontWeightVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import * as stylex from '@stylexjs/stylex';

import { GlobalNavigationLayout } from './global-navigation-layout';
import { RouterLink } from './router-link';

const styles = stylex.create({
  selectedNavigationItem: {
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
      ':active': colorVars['--color-overlay-pressed'],
    },
    color: colorVars['--color-text-primary'],
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
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

describe('GlobalNavigationLayout', () => {
  it('renders one heading-free global nav above routed content', () => {
    const { container, getByRole, getByText, queryByRole } =
      renderGlobalLayout();
    const navigation = getByRole('navigation', { name: 'Global navigation' });
    const shell = navigation.closest('[data-height="fill"]');

    if (!(shell instanceof HTMLElement)) {
      throw new Error('Expected the global navigation layout shell.');
    }

    expect(getByRole('button', { name: 'Search skills' })).toBeTruthy();
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

  it('renders primary page links with their route destinations', () => {
    const { getByRole } = renderGlobalLayout();
    const navigation = getByRole('navigation', { name: 'Global navigation' });

    expect(getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/');
    expect(getByRole('link', { name: 'Roadmap' }).getAttribute('href')).toBe(
      '/roadmap',
    );
    expect(getByRole('link', { name: 'Skills' }).getAttribute('href')).toBe(
      '/skills',
    );
    expect(
      within(navigation).getAllByRole('link').map(
        (link) => link.getAttribute('aria-label') ?? link.textContent?.trim(),
      ),
    ).toEqual(['Home', 'Skills', 'Roadmap']);
  });

  it('renders Home as an icon-only link at the start of the global nav', () => {
    const { getByRole } = renderGlobalLayout();
    const navigation = getByRole('navigation', { name: 'Global navigation' });
    const homeLink = getByRole('link', { name: 'Home' });

    expect(navigation.firstElementChild?.contains(homeLink)).toBe(true);
    expect(homeLink.textContent?.trim()).toBe('');
    expect(homeLink.querySelector('svg')).toBeTruthy();
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

  it('resets the shell scroll owner when a top-nav link changes routes', () => {
    const { getByRole, getByTestId, getByText } = renderGlobalLayout();
    const shellScrollOwner = getByText('Route content').closest(
      '.astryx-layout-content',
    );

    if (!(shellScrollOwner instanceof HTMLElement)) {
      throw new Error('Expected the shell scroll owner.');
    }

    shellScrollOwner.scrollTop = 160;
    expect(shellScrollOwner.scrollTop).toBe(160);

    fireEvent.click(getByRole('link', { name: 'Roadmap' }));

    expect(getByTestId('location').textContent).toBe('/roadmap');
    expect(shellScrollOwner.scrollTop).toBe(0);
  });

  it.each([
    ['/', 'Home'],
    ['/roadmap', 'Roadmap'],
    ['/skills', 'Skills'],
    ['/skills/kubernetes', 'Skills'],
  ])(
    'marks only %s primary navigation item as current',
    (path, currentLink) => {
      const { getByRole } = renderGlobalLayout(path);

      for (const label of ['Home', 'Roadmap', 'Skills']) {
        expect(
          getByRole('link', { name: label }).getAttribute('aria-current'),
        ).toBe(label === currentLink ? 'page' : null);
      }
    },
  );

  it('keeps the selected navigation item text-only', () => {
    const { getByRole } = render(
      <Theme theme={neutralTheme}>
        <MemoryRouter initialEntries={['/roadmap']}>
          <GlobalNavigationLayout />
          <TopNavItem
            href="/control"
            isSelected
            label="Text-only selected control"
            xstyle={styles.selectedNavigationItem}
          />
          <TopNavItem href="/control" isSelected label="Selected control" />
        </MemoryRouter>
      </Theme>,
    );
    const selectedLink = getByRole('link', { name: 'Roadmap' });
    const textOnlySelectedControl = getByRole('link', {
      name: 'Text-only selected control',
    });
    const selectedControl = getByRole('link', { name: 'Selected control' });

    expect(selectedLink.className).toBe(textOnlySelectedControl.className);
    expect(selectedLink.className).not.toBe(selectedControl.className);
  });

  it('opens search and navigates a selected skill result', () => {
    const { getByRole, getByTestId } = renderGlobalLayout();

    fireEvent.click(getByRole('button', { name: 'Search skills' }));
    expect(getByRole('dialog', { name: 'Search skills' })).toBeTruthy();

    fireEvent.click(getByRole('option', { name: 'Terraform' }));
    expect(getByTestId('location').textContent).toBe('/skills/terraform');
  });
});
