import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';

import { skills } from './skill-list.data';
import meta, {
  DesktopTableDetail,
  InteractiveSkillTable,
} from './skill-table.stories';

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

describe('SkillTable stories', () => {
  it('publishes the table in the Skills hierarchy', () => {
    expect(meta.title).toBe('Components/Skills/Skill Table');
    expect(meta.excludeStories).toContain('InteractiveSkillTable');
    expect(DesktopTableDetail.loaders).toHaveLength(1);
  });

  it('opens resolved skill detail beside the table', () => {
    const { getAllByRole, getByRole } = render(
      <Theme theme={neutralTheme}>
        <InteractiveSkillTable skills={skills} />
      </Theme>,
    );

    fireEvent.click(getAllByRole('row', { name: /Kubernetes/ })[0]);

    expect(getByRole('region', { name: 'Kubernetes details' })).toBeTruthy();
  });
});
