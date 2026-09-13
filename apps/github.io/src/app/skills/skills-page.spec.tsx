import { act, fireEvent, render, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { vi } from 'vitest';

import { skills } from './skill-list.data';
import type { Skill } from './skill-list.types';
import { SkillsPage } from './skills-page';
import {
  COMPACT_SURFACE_QUERY,
  TABLE_QUERY,
} from './skill-table-detail-layout';

const mediaMatches = new Map<string, boolean>();
const mediaListeners = new Map<
  string,
  Set<(event: MediaQueryListEvent) => void>
>();

function setMediaMatches(matches: Record<string, boolean>) {
  act(() => {
    for (const [query, value] of Object.entries(matches)) {
      mediaMatches.set(query, value);
      for (const listener of mediaListeners.get(query) ?? []) {
        listener({ matches: value, media: query } as MediaQueryListEvent);
      }
    }
  });
}

vi.stubGlobal('matchMedia', (query: string): MediaQueryList => ({
  addEventListener: (_type, listener) => {
    const listeners = mediaListeners.get(query) ?? new Set();
    listeners.add(listener as (event: MediaQueryListEvent) => void);
    mediaListeners.set(query, listeners);
  },
  addListener: vi.fn(),
  dispatchEvent: vi.fn(),
  get matches() {
    return mediaMatches.get(query) ?? false;
  },
  media: query,
  onchange: null,
  removeEventListener: (_type, listener) => {
    mediaListeners
      .get(query)
      ?.delete(listener as (event: MediaQueryListEvent) => void);
  },
  removeListener: vi.fn(),
}));

const renderSkillsPage = (suppliedSkills?: readonly Skill[]) =>
  render(
    <Theme theme={neutralTheme}>
      <SkillsPage skills={suppliedSkills} />
    </Theme>,
  );

describe('SkillsPage', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open');
    };
  });

  const tableSkills = ['kubernetes', 'terraform', 'docker'].map((id) => {
    const skill = skills.find((candidate) => candidate.id === id);

    if (!skill) {
      throw new Error(`Expected ${id} in the canonical skill catalog.`);
    }

    return skill;
  });

  beforeEach(() => {
    window.history.replaceState({}, '', '/skills');
  });

  afterEach(() => {
    mediaMatches.clear();
    mediaListeners.clear();
  });

  it('renders a non-scrollable main without page-local navigation', () => {
    const { container, getByRole, queryByRole } = renderSkillsPage();
    const main = getByRole('main', { name: 'Skills' });

    expect(getByRole('heading', { level: 1, name: 'Skills' })).toBeTruthy();
    expect(getByRole('heading', { level: 2, name: 'Skills' })).toBeTruthy();
    expect(main.getAttribute('aria-labelledby')).toBe('skills-page-title');
    expect(queryByRole('navigation')).toBeNull();
    expect(main.className).toContain('astryx-stack');
    expect(container.querySelectorAll('.astryx-layout-content')).toHaveLength(
      0,
    );
  });

  it('uses Astryx heading type scales for the page and filter labels', () => {
    const { getByRole } = renderSkillsPage();
    const skillsHeading = getByRole('heading', { level: 2, name: 'Skills' });

    expect(skillsHeading.className).toContain('astryx-heading');
    expect(skillsHeading.getAttribute('data-level')).toBe('2');

    fireEvent.click(getByRole('button', { name: 'Filter skills' }));

    const filterHeading = getByRole('heading', {
      level: 3,
      name: 'Filter skills',
    });

    expect(filterHeading.className).toContain('astryx-heading');
    expect(filterHeading.getAttribute('data-level')).toBe('3');
  });

  it('sorts a copy of supplied skills and links every card to its detail route', () => {
    const suppliedSkills = ['typescript', 'argo-cd', 'docker'].map((id) => {
      const skill = skills.find((candidate) => candidate.id === id);

      if (!skill) {
        throw new Error(`Expected ${id} in the canonical skill catalog.`);
      }

      return skill;
    });
    const originalOrder = suppliedSkills.map((skill) => skill.id);
    const { getByRole } = renderSkillsPage(suppliedSkills);
    const main = getByRole('main', { name: 'Skills' });
    const links = within(main).getAllByRole('link');

    expect(within(main).getAllByTestId('skill-card')).toHaveLength(3);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/skills/argo-cd',
      '/skills/docker',
      '/skills/typescript',
    ]);
    expect(suppliedSkills.map((skill) => skill.id)).toEqual(originalOrder);
  });

  it('filters the catalog by text found only in a skill description', () => {
    const suppliedSkills = ['typescript', 'argo-cd', 'docker'].map((id) => {
      const skill = skills.find((candidate) => candidate.id === id);

      if (!skill) {
        throw new Error(`Expected ${id} in the canonical skill catalog.`);
      }

      return skill;
    });
    const { getByRole, queryByText } = renderSkillsPage(suppliedSkills);

    fireEvent.change(getByRole('textbox', { name: 'Search skills' }), {
      target: { value: 'reconciliation' },
    });

    expect(getByRole('heading', { level: 3, name: 'Argo CD' })).toBeTruthy();
    expect(queryByText('Docker')).toBeNull();
    expect(queryByText('TypeScript')).toBeNull();
  });

  it('combines search with OR category filters and clears active filters', () => {
    const suppliedSkills = ['typescript', 'argo-cd', 'docker'].map((id) => {
      const skill = skills.find((candidate) => candidate.id === id);

      if (!skill) {
        throw new Error(`Expected ${id} in the canonical skill catalog.`);
      }

      return skill;
    });
    const { getByRole, queryByText } = renderSkillsPage(suppliedSkills);

    fireEvent.change(getByRole('textbox', { name: 'Search skills' }), {
      target: { value: 'delivery' },
    });
    fireEvent.click(getByRole('button', { name: 'Filter skills' }));
    fireEvent.click(getByRole('checkbox', { name: 'CI/CD' }));

    expect(getByRole('heading', { level: 3, name: 'Argo CD' })).toBeTruthy();
    expect(queryByText('Docker')).toBeNull();

    fireEvent.click(getByRole('button', { name: 'Clear Search skills' }));
    fireEvent.click(getByRole('checkbox', { name: 'Container' }));

    expect(getByRole('heading', { level: 3, name: 'Argo CD' })).toBeTruthy();
    expect(getByRole('heading', { level: 3, name: 'Docker' })).toBeTruthy();
    expect(queryByText('TypeScript')).toBeNull();

    fireEvent.click(getByRole('button', { name: 'Clear filters' }));

    expect(getByRole('heading', { level: 3, name: 'TypeScript' })).toBeTruthy();

    fireEvent.change(getByRole('textbox', { name: 'Search skills' }), {
      target: { value: 'no matching skill' },
    });

    expect(
      getByRole('heading', {
        level: 3,
        name: 'No skills match your search or filters.',
      }),
    ).toBeTruthy();
  });

  it('uses the existing Astryx empty state for an empty catalog', () => {
    const { getByText } = renderSkillsPage([]);
    const message = getByText('No skills have been supplied.');

    expect(message.closest('[role="status"]')).toBeTruthy();
  });

  it('uses cards below the table breakpoint and the table above it', () => {
    const { getAllByTestId, getByRole, queryAllByTestId, queryByRole } =
      renderSkillsPage(tableSkills);

    expect(getAllByTestId('skill-card')).toHaveLength(3);
    expect(queryByRole('table')).toBeNull();

    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });

    expect(getByRole('table')).toBeTruthy();
    expect(queryAllByTestId('skill-card')).toHaveLength(0);
  });

  it('gives the desktop master-detail layout the page height it needs to contain scrolling', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getByRole } = renderSkillsPage(tableSkills);

    expect(getByRole('main', { name: 'Skills' }).style.height).toBe('100%');
    expect(
      getByRole('table').closest('[data-height]')?.getAttribute('data-height'),
    ).toBe('fill');
  });

  it('keeps table selection in page state, swaps reusable details, and restores row focus on close', async () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getByRole, getByText, queryByRole } = renderSkillsPage(tableSkills);
    const kubernetesRow = getByRole('row', { name: /Kubernetes/ });

    fireEvent.click(kubernetesRow);

    expect(window.location.pathname).toBe('/skills');
    expect(kubernetesRow.getAttribute('aria-current')).toBe('true');
    expect(getByRole('region', { name: 'Kubernetes details' })).toBeTruthy();
    expect(
      within(getByRole('region', { name: 'Kubernetes details' })).getByText(
        'Cloud-native platform operations',
      ),
    ).toBeTruthy();
    expect(
      getByRole('heading', {
        level: 3,
        name: 'Production Kubernetes platform operations on Amazon EKS',
      }),
    ).toBeTruthy();
    expect(
      getByRole('heading', { level: 3, name: 'benkim0414/homelab' }),
    ).toBeTruthy();

    const terraformRow = getByRole('row', { name: /Terraform/ });
    fireEvent.click(terraformRow);

    expect(queryByRole('region', { name: 'Kubernetes details' })).toBeNull();
    expect(getByRole('region', { name: 'Terraform details' })).toBeTruthy();

    fireEvent.click(getByRole('button', { name: 'Close Terraform details' }));

    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );

    expect(document.activeElement).toBe(terraformRow);
  });

  it('clears an active selection without restoring focus when filtering removes its row', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const focusFrame = vi.spyOn(window, 'requestAnimationFrame');
    const { getByRole, queryByRole } = renderSkillsPage(tableSkills);

    fireEvent.click(getByRole('row', { name: /Terraform/ }));
    fireEvent.change(getByRole('textbox', { name: 'Skill name' }), {
      target: { value: 'Kubernetes' },
    });

    expect(queryByRole('region', { name: 'Terraform details' })).toBeNull();
    expect(focusFrame).not.toHaveBeenCalled();
  });

  it.each(['close control', 'Escape'])(
    'restores the selected row after the compact sheet exits via %s following a desktop resize',
    async (dismissal) => {
      setMediaMatches({
        [TABLE_QUERY]: true,
        [COMPACT_SURFACE_QUERY]: false,
      });
      const { getByRole } = renderSkillsPage(tableSkills);
      const row = getByRole('row', { name: /Kubernetes/ });

      fireEvent.click(row);
      getByRole('textbox', { name: 'Skill name' }).focus();
      setMediaMatches({ [COMPACT_SURFACE_QUERY]: true });

      const dialog = getByRole('dialog', {
        name: 'Kubernetes details',
      }) as HTMLDialogElement;
      const sheet = dialog.querySelector<HTMLElement>('.astryx-bottom-sheet');
      if (!sheet) {
        throw new Error('Expected the Astryx bottom sheet panel.');
      }
      // JSDOM does not resolve Astryx's CSS duration tokens. Supply the browser
      // timing at the DOM boundary so the real sheet waits for transitionend.
      sheet.style.transitionProperty = 'transform';
      sheet.style.transitionDuration = '0.4s';
      sheet.style.transitionDelay = '0s';

      if (dismissal === 'Escape') {
        fireEvent.keyDown(dialog, { key: 'Escape' });
      } else {
        fireEvent.click(
          getByRole('button', { name: 'Close Kubernetes details' }),
        );
      }

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      expect(dialog.open).toBe(true);
      expect(dialog.textContent).toContain('Primary use');

      const transitionEnd = new Event('transitionend', { bubbles: true });
      Object.defineProperty(transitionEnd, 'propertyName', {
        value: 'transform',
      });
      fireEvent(sheet, transitionEnd);

      expect(dialog.open).toBe(false);
      expect(document.activeElement).toBe(row);
      expect(window.location.pathname).toBe('/skills');
    },
  );

  it('keeps controlled filters visible across responsive collection changes', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getAllByTestId, getByRole } = renderSkillsPage(tableSkills);

    fireEvent.change(getByRole('textbox', { name: 'Skill name' }), {
      target: { value: 'Kubernetes' },
    });
    setMediaMatches({
      [TABLE_QUERY]: false,
      [COMPACT_SURFACE_QUERY]: false,
    });

    expect(getAllByTestId('skill-card')).toHaveLength(1);
    expect(getByRole('heading', { level: 3, name: 'Kubernetes' })).toBeTruthy();

    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });

    expect(
      within(getByRole('table')).getByRole('row', { name: /Kubernetes/ }),
    ).toBeTruthy();
  });

  it('clears temporary detail selection through a table-mobile-table resize and focuses the remounted row on dismissal', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getByRole, queryByRole } = renderSkillsPage(tableSkills);
    const originalRow = getByRole('row', { name: /Kubernetes/ });
    fireEvent.click(originalRow);

    setMediaMatches({ [TABLE_QUERY]: false });
    expect(originalRow.isConnected).toBe(false);
    expect(getByRole('link', { name: /Kubernetes/ }).getAttribute('href')).toBe(
      '/skills/kubernetes',
    );

    setMediaMatches({ [TABLE_QUERY]: true });
    const remountedRow = getByRole('row', { name: /Kubernetes/ });
    expect(queryByRole('region', { name: 'Kubernetes details' })).toBeNull();
    expect(remountedRow.getAttribute('aria-current')).toBeNull();

    fireEvent.click(remountedRow);
    act(() =>
      getByRole('button', { name: 'Close Kubernetes details' }).focus(),
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).not.toBe(remountedRow);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(document.activeElement).toBe(remountedRow);
    expect(window.location.pathname).toBe('/skills');
  });
});
