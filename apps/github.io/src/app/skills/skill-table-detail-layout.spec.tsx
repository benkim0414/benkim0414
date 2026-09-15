import { fireEvent, render } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { vi } from 'vitest';

import { resolveSkillDetail } from './skill-detail-resolver';
import { skillDetailSources } from './skill-detail-sources';
import type { ResolvedSkillDetail } from './skill-detail.types';
import {
  SkillTableDetailLayout,
  type SkillTableDetailLayoutProps,
} from './skill-table-detail-layout';
import { COMPACT_SURFACE_QUERY, TABLE_QUERY } from './skill-table-responsive';

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

function LocationProbe() {
  const location = useLocation();

  return <output data-testid="location">{`${location.pathname}${location.hash}`}</output>;
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
      <MemoryRouter basename="/portfolio" initialEntries={['/portfolio/skills']}>
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
          <LocationProbe />
        </Theme>
      </MemoryRouter>,
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
    const { container, getByRole, queryByRole } = renderLayout();

    expect(getByRole('region', { name: 'Kubernetes details' })).toBeTruthy();
    expect(
      getByRole('separator', { name: 'Resize skill details' }),
    ).toBeTruthy();
    expect(queryByRole('dialog', { name: 'Kubernetes details' })).toBeNull();
    expect(
      container.querySelectorAll('#skill-experience-narrative-heading'),
    ).toHaveLength(1);
  });

  it('places the table controls in the shared header above the detail panel', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getByRole } = renderLayout();
    const controls = getByRole('textbox', { name: 'Skill name' });
    const header = getByRole('toolbar', { name: 'Skill table controls' });
    const detailPanel = getByRole('region', { name: 'Kubernetes details' });

    expect(header.contains(controls)).toBe(true);
    expect(header.compareDocumentPosition(detailPanel)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('shares the title row with a far-right close control', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getByRole } = renderLayout();
    const closeButton = getByRole('button', {
      name: 'Close Kubernetes details',
    });
    const heading = getByRole('heading', { name: 'Kubernetes' });

    expect(closeButton.parentElement?.contains(heading)).toBe(true);
    expect(heading.compareDocumentPosition(closeButton)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('uses the compact skill inspector hierarchy', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getByRole, queryByRole } = renderLayout();
    const detailPanel = getByRole('region', { name: 'Kubernetes details' });

    expect(
      getByRole('link', { name: 'View Kubernetes details' }).getAttribute(
        'href',
      ),
    ).toBe('/skills/kubernetes');
    expect(detailPanel.querySelectorAll('.astryx-divider')).toHaveLength(2);
    expect(queryByRole('heading', { name: 'Projects' })).toBeNull();
  });

  it('renders inspector experience as unframed Item summary rows', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { container, getByRole } = renderLayout();
    const detailPanel = getByRole('region', { name: 'Kubernetes details' });

    expect(
      getByRole('heading', { level: 3, name: 'Experience' }),
    ).toBeTruthy();
    expect(
      detailPanel.querySelector(
        `.astryx-badge[title="${
          kubernetesDetail.experiences.length +
          kubernetesDetail.experienceEvidence.length
        }"]`,
      ),
    ).toBeTruthy();
    expect(detailPanel.textContent).toContain('Experience');
    const experience = kubernetesDetail.experiences.find((item) =>
      item.title.includes('Production Kubernetes platform operations'),
    );

    expect(experience).toBeTruthy();
    const experienceItem = getByRole('link', {
      name: /Production Kubernetes platform operations on Amazon EKS/,
    });

    expect(experienceItem.parentElement?.classList).toContain('astryx-item');
    const relevantSkillsLabel = Array.from(
      experienceItem.parentElement?.querySelectorAll('span') ?? [],
    ).find((element) => element.textContent === 'Relevant skills');

    expect(relevantSkillsLabel).toBeTruthy();
    if (!relevantSkillsLabel) {
      throw new Error('Expected the Item end slot to include Relevant skills.');
    }

    fireEvent.click(relevantSkillsLabel);
    expect(container.querySelector('[data-testid="location"]')?.textContent).toBe(
      `/skills/kubernetes#experience-${experience?.id}`,
    );
    expect(detailPanel.querySelectorAll('.astryx-card')).toHaveLength(0);
    expect(
      detailPanel.querySelectorAll('.astryx-collapsible-trigger'),
    ).toHaveLength(0);
    expect(detailPanel.textContent).toContain('Highlights');
    expect(detailPanel.textContent).toContain('Relevant skills');
    expect(detailPanel.querySelectorAll('.astryx-list')).toHaveLength(0);
    expect(detailPanel.querySelectorAll('[aria-label="Relevant skills"]')).toHaveLength(0);
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

  it('keeps an active panel open when a foreground control handles Escape', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getByRole, onClose } = renderLayout();
    const closeButton = getByRole('button', {
      name: 'Close Kubernetes details',
    });
    closeButton.addEventListener('keydown', (event) => event.preventDefault());

    fireEvent.keyDown(closeButton, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
    expect(getByRole('region', { name: 'Kubernetes details' })).toBeTruthy();
  });

  it('keeps an active panel open while Escape cancels text composition', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getByRole, onClose } = renderLayout();

    fireEvent.keyDown(document, { key: 'Escape', isComposing: true });

    expect(onClose).not.toHaveBeenCalled();
    expect(getByRole('region', { name: 'Kubernetes details' })).toBeTruthy();
  });

  it('keeps an active panel open for the legacy IME key code', () => {
    setMediaMatches({
      [TABLE_QUERY]: true,
      [COMPACT_SURFACE_QUERY]: false,
    });
    const { getByRole, onClose } = renderLayout();

    fireEvent.keyDown(document, { key: 'Escape', keyCode: 229 });

    expect(onClose).not.toHaveBeenCalled();
    expect(getByRole('region', { name: 'Kubernetes details' })).toBeTruthy();
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
