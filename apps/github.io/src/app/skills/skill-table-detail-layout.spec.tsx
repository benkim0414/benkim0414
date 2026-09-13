import { fireEvent, render } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { vi } from 'vitest';

import { resolveSkillDetail } from './skill-detail-resolver';
import { skillDetailSources } from './skill-detail-sources';
import type { ResolvedSkillDetail } from './skill-detail.types';
import {
  COMPACT_SURFACE_QUERY,
  SkillTableDetailLayout,
  TABLE_QUERY,
  type SkillTableDetailLayoutProps,
} from './skill-table-detail-layout';

const mediaMatches = new Map<string, boolean>();
const mediaListeners = new Map<
  string,
  Set<(event: MediaQueryListEvent) => void>
>();

function setMediaMatches(matches: Record<string, boolean>) {
  for (const [query, value] of Object.entries(matches)) {
    mediaMatches.set(query, value);
    for (const listener of mediaListeners.get(query) ?? []) {
      listener({ matches: value, media: query } as MediaQueryListEvent);
    }
  }
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

function requiredDetail(skillId: string): ResolvedSkillDetail {
  const result = resolveSkillDetail(skillId, skillDetailSources);

  if (result.status !== 'found') {
    throw new Error(`Expected ${skillId} detail fixture.`);
  }

  return result.value;
}

const kubernetesDetail = requiredDetail('kubernetes');

function renderLayout({
  skills = skillDetailSources.skills,
  query = '',
  selectedCategories = [],
  activeDetail = kubernetesDetail,
  onSkillActivate = vi.fn(),
  onClose = vi.fn(),
}: Partial<SkillTableDetailLayoutProps> = {}) {
  return {
    onClose,
    ...render(
      <Theme theme={neutralTheme}>
        <SkillTableDetailLayout
          activeDetail={activeDetail}
          activeSkillId={activeDetail?.skill.id ?? null}
          query={query}
          selectedCategories={selectedCategories}
          skills={skills}
          onClose={onClose}
          onQueryChange={vi.fn()}
          onSelectedCategoriesChange={vi.fn()}
          onSkillActivate={onSkillActivate}
        />
      </Theme>,
    ),
  };
}

describe('SkillTableDetailLayout', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open');
    };
  });

  afterEach(() => {
    mediaMatches.clear();
    mediaListeners.clear();
  });

  it('hosts the active detail in a resizable end panel on non-compact surfaces', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getByRole, queryByRole } = renderLayout();

    expect(getByRole('region', { name: 'Kubernetes details' })).toBeTruthy();
    expect(
      getByRole('separator', { name: 'Resize skill details' }),
    ).toBeTruthy();
    expect(queryByRole('dialog', { name: 'Kubernetes details' })).toBeNull();
  });

  it('keeps the close control in a separate top-right header row', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getByRole } = renderLayout();
    const closeButton = getByRole('button', {
      name: 'Close Kubernetes details',
    });
    const heading = getByRole('heading', { name: 'Kubernetes' });

    expect(closeButton.parentElement?.contains(heading)).toBe(false);
    expect(closeButton.compareDocumentPosition(heading)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('keeps a long detail scroll scoped to the bounded desktop panel', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getByRole } = renderLayout();
    const detailPanel = getByRole('region', { name: 'Kubernetes details' });
    const layout = detailPanel.closest('[data-height]');
    const tableContent = layout?.querySelector('.astryx-layout-content');

    expect(layout?.getAttribute('data-height')).toBe('fill');
    expect(tableContent).toBeTruthy();

    tableContent!.scrollTop = 48;
    fireEvent.scroll(detailPanel, { target: { scrollTop: 240 } });

    expect(detailPanel.scrollTop).toBe(240);
    expect(tableContent!.scrollTop).toBe(48);
  });

  it('closes an active panel with Escape and requests focus restoration', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { onClose } = renderLayout();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith(true);
  });

  it('uses a tall bottom sheet on compact surfaces and restores focus for each close path', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: true,
    });
    const { getByRole, onClose, queryByRole } = renderLayout();
    const dialog = getByRole('dialog', { name: 'Kubernetes details' });

    expect(
      queryByRole('separator', { name: 'Resize skill details' }),
    ).toBeNull();
    expect(dialog.textContent).toContain('Primary use');

    fireEvent.keyDown(dialog, { key: 'Escape' });
    fireEvent.click(getByRole('button', { name: 'Close Kubernetes details' }));

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenNthCalledWith(1, true);
    expect(onClose).toHaveBeenNthCalledWith(2, true);
  });
});
