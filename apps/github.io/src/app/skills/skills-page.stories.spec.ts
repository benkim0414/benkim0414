import meta, { Empty, FilterControlsOpen } from './skills-page.stories';

describe('SkillsPage stories', () => {
  it('publishes the page and empty state in the Skills hierarchy', () => {
    expect(meta.title).toBe('GitHub.io/Skills/Skills Page');
    expect(Empty.args).toEqual({ skills: [] });
    expect(FilterControlsOpen.play).toBeTypeOf('function');
  });
});
