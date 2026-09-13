import type { Skill, SkillCategory } from './skill-list.types';
import { skillMatchesQuery } from './skill-search';

export function filterSkills(
  skills: readonly Skill[],
  query: string,
  selectedCategories: readonly SkillCategory[],
): Skill[] {
  return skills.filter(
    (skill) =>
      skillMatchesQuery(skill, query) &&
      (selectedCategories.length === 0 ||
        selectedCategories.some((category) =>
          skill.categories.includes(category),
        )),
  );
}
