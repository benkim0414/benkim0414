import meta, {
  MultipleKeyOutcomes,
} from './skill-experience-list.stories';

describe('SkillExperienceList stories', () => {
  it('uses a capability example with multiple key outcomes', () => {
    expect(meta.title).toBe('Components/Skills/Skill Experience List');
    expect(
      MultipleKeyOutcomes.args?.evidence?.[0].details?.facts,
    ).toHaveLength(3);
  });
});
