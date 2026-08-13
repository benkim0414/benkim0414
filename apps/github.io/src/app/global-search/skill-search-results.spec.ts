import { skills } from '../skills/skill-list.data';
import { createSkillSearchResults } from './skill-search-results';

describe('createSkillSearchResults', () => {
  it('creates domain-neutral destinations in the Skills group', () => {
    const [result] = createSkillSearchResults([
      skills.find((skill) => skill.id === 'terraform')!,
    ]);

    expect(result).toMatchObject({
      id: 'skill:terraform',
      label: 'Terraform',
      href: '/skills/terraform',
      group: 'Skills',
    });
    expect(result).not.toHaveProperty('skill');
  });

  it('preserves description, category, and keyword matching data', () => {
    const terraform = skills.find((skill) => skill.id === 'terraform')!;
    const [result] = createSkillSearchResults([terraform]);

    expect(result.keywords).toEqual([
      terraform.description,
      ...terraform.categories,
      ...terraform.keywords,
    ]);
  });
});
