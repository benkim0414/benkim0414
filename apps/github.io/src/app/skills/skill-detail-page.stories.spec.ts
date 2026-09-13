import meta, { TabletOutline } from './skill-detail-page.stories';

describe('SkillDetailPage stories', () => {
  it('keeps the tablet Outline review surface on enriched skill data', () => {
    expect(meta.title).toBe('Components/Skills/Skill Detail Page');
    expect(TabletOutline.args?.detail?.skill.id).toBe('kubernetes');
    expect(TabletOutline.parameters?.viewport?.defaultViewport).toBe('tablet');
  });
});
