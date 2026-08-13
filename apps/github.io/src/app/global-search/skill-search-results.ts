import type { Skill } from '../skills/skill-list.types';
import type { GlobalSearchResult } from './global-search.types';

export function createSkillSearchResults(
  skills: readonly Skill[],
): GlobalSearchResult[] {
  return skills.map((skill) => ({
    id: `skill:${skill.id}`,
    label: skill.name,
    href: `/skills/${skill.id}`,
    group: 'Skills',
    keywords: [
      skill.description,
      ...skill.categories,
      ...skill.keywords,
    ],
  }));
}
