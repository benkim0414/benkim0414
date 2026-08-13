import type { ComponentProps, ReactNode } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';

import { GlobalNavigationLayout } from './global-navigation-layout';

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
      <MemoryRouter initialEntries={[initialEntry]}>
        <Location />
        <Routes>
          <Route element={<GlobalNavigationLayout />}>
            <Route index element={<RouteContent />} />
            <Route path="skills/:skillId" element={<RouteContent />} />
          </Route>
        </Routes>
      </MemoryRouter>
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

    expect(getByRole('button', { name: 'Search skills' })).toBeTruthy();
    expect(queryByRole('heading', { name: /skills/i })).toBeNull();
    expect(getByText('Route content')).toBeTruthy();
    expect(shell?.className).toContain('astryx-layout');
    expect(shell?.className).toContain('max-w-md');
    expect(shell?.className).toContain('h-dvh');
    expect(navigation.parentElement?.parentElement?.className).toContain(
      'astryx-layout-header',
    );
    expect(navigation.className).toContain('astryx-top-nav');
    expect(container.querySelectorAll('.astryx-top-nav')).toHaveLength(1);
  });

  it('opens search and navigates a selected skill result', () => {
    const { getByRole, getByTestId } = renderGlobalLayout();

    fireEvent.click(getByRole('button', { name: 'Search skills' }));
    expect(getByRole('dialog', { name: 'Search skills' })).toBeTruthy();

    fireEvent.click(getByRole('option', { name: 'Terraform' }));
    expect(getByTestId('location').textContent).toBe('/skills/terraform');
  });
});
