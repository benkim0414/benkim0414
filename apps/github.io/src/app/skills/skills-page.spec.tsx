import { fireEvent, render, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { vi } from 'vitest';

import { skills } from './skill-list.data';
import type { Skill } from './skill-list.types';
import { SkillsPage } from './skills-page';

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

const renderSkillsPage = (suppliedSkills?: readonly Skill[]) =>
  render(
    <Theme theme={neutralTheme}>
      <SkillsPage skills={suppliedSkills} />
    </Theme>,
  );

describe('SkillsPage', () => {
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
});
