import { describe, expect, it } from 'vitest';

import {
  projects,
  skillCategories,
  skillLevels,
  skills,
  skillsWithProjects,
} from './skills';

describe('skills data', () => {
  it('uses only supported skill levels', () => {
    const validLevels = new Set(Object.keys(skillLevels).map(Number));

    expect(skills.every((skill) => validLevels.has(skill.level))).toBe(true);
  });

  it('uses only approved skill categories', () => {
    const validCategories = new Set<string>(skillCategories);

    expect(skills.every((skill) => validCategories.has(skill.category))).toBe(true);
  });

  it('covers every approved category with placeholder content', () => {
    const coveredCategories = new Set(skills.map((skill) => skill.category));

    expect(skillCategories.every((category) => coveredCategories.has(category))).toBe(true);
  });

  it('includes usage context and related project references for every skill', () => {
    const projectIds = new Set(projects.map((project) => project.id));

    expect(
      skills.every(
        (skill) =>
          skill.summary.length > 0 &&
          skill.usage.length > 0 &&
          skill.tags.length > 0 &&
          skill.projectIds.length > 0 &&
          skill.projectIds.every((projectId) => projectIds.has(projectId))
      )
    ).toBe(true);
  });

  it('exports skills with resolved projects without network access', () => {
    expect(skillsWithProjects).toHaveLength(skills.length);
    expect(skillsWithProjects.every((skill) => skill.projects.length > 0)).toBe(true);
  });
});
