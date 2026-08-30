import meta, {
  MultipleExperiences,
} from './skill-experience-card-list.stories';

describe('SkillExperienceCardList stories', () => {
  it('uses a dedicated list example with multiple cards', () => {
    expect(meta.title).toBe('Components/Skills/Skill Experience Card List');
    expect(MultipleExperiences.args?.experiences).toHaveLength(2);
    expect(
      MultipleExperiences.args?.experiences?.map((experience) => experience.id),
    ).toEqual([
      'aws-codepipeline-codebuild-multistage-delivery',
      'kubernetes-gitops-runtime-operations',
    ]);
  });
});
