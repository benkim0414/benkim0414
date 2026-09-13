import meta, { MobileCompact } from './skill-experience-card.stories';

describe('SkillExperienceCard stories', () => {
  it('keeps a small-screen review surface for long content', () => {
    expect(meta.title).toBe('Components/Skills/Skill Experience Card');
    expect(MobileCompact.args?.experience?.title).toContain(
      'intentionally long wrapping title',
    );
    expect(MobileCompact.globals?.viewport).toEqual({
      value: 'mobile1',
      isRotated: false,
    });
  });
});
