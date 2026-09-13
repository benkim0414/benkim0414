import * as skillsPageStories from './skills-page.stories';
import meta, { Empty, FilterControlsOpen } from './skills-page.stories';

describe('SkillsPage stories', () => {
  it('publishes the page and empty state in the Skills hierarchy', () => {
    expect(meta.title).toBe('Components/Skills/Skills Page');
    expect(meta.decorators).toHaveLength(1);
    expect(Empty.args).toEqual({ skills: [] });
    expect(FilterControlsOpen.play).toBeTypeOf('function');
  });

  it('publishes deterministic responsive visual states', () => {
    expect(skillsPageStories).toMatchObject({
      MobileCards: expect.any(Object),
      DesktopTableDetail: expect.any(Object),
      CoarseTabletBottomSheet: expect.any(Object),
    });
    expect(skillsPageStories.DesktopTableDetail.loaders).toHaveLength(1);
  });

  it.each([
    ['MobileCards', 'mobile1'],
    ['DesktopTableDetail', 'desktop'],
    ['CoarseTabletBottomSheet', 'tablet'],
    ['FilterControlsOpen', 'mobile1'],
  ] as const)(
    'pins %s to the supported %s viewport global',
    (name, viewport) => {
      expect(skillsPageStories[name].globals?.viewport).toEqual({
        value: viewport,
        isRotated: false,
      });
      expect(
        skillsPageStories[name].parameters?.viewport ?? {},
      ).not.toHaveProperty('defaultViewport');
    },
  );
});
