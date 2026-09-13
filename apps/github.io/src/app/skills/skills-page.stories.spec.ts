import * as skillsPageStories from './skills-page.stories';
import meta, { Empty, FilterControlsOpen } from './skills-page.stories';

describe('SkillsPage stories', () => {
  it('publishes the page and empty state in the Skills hierarchy', () => {
    expect(meta.title).toBe('Components/Skills/Skills Page');
    expect(Empty.args).toEqual({ skills: [] });
    expect(FilterControlsOpen.play).toBeTypeOf('function');
  });

  it('publishes deterministic responsive visual states', () => {
    expect(skillsPageStories).toMatchObject({
      MobileCards: expect.any(Object),
      DesktopTableDetail: expect.any(Object),
      CoarseTabletBottomSheet: expect.any(Object),
    });
  });
});
