import { render, within } from '@testing-library/react';
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
  it('owns a centered mobile shell with one scrollable labelled main', () => {
    const { getByRole } = renderSkillsPage();
    const main = getByRole('main', { name: 'Skills' });
    const navigation = getByRole('navigation', { name: 'Skills navigation' });
    const shell = main.parentElement;

    expect(getByRole('heading', { level: 1, name: 'Skills' })).toBeTruthy();
    expect(shell).toBe(navigation.parentElement);
    expect(shell?.className).toContain('max-w-md');
    expect(shell?.className).toContain('h-dvh');
    expect(shell?.className).toContain('overflow-hidden');
    expect(navigation.className).toContain('shrink-0');
    expect(main.className).toContain('min-h-0');
    expect(main.className).toContain('flex-1');
    expect(main.className).toContain('astryx-stack');
  });

  it('sorts a copy of supplied skills and links every row to its detail route', () => {
    const suppliedSkills = ['typescript', 'argo', 'docker'].map((id) => {
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

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/skills/argo',
      '/skills/docker',
      '/skills/typescript',
    ]);
    expect(suppliedSkills.map((skill) => skill.id)).toEqual(originalOrder);
  });

  it('uses the existing Astryx empty state for an empty catalog', () => {
    const { getByRole, getByText } = renderSkillsPage([]);

    expect(getByRole('status')).toBeTruthy();
    expect(getByText('No skills have been supplied.')).toBeTruthy();
  });
});
