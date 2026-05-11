import Fuse from 'fuse.js';

import {
  type Skill,
  type SkillCategory,
  type SkillLevel,
  skillCategories,
  skillLevels,
  skillsWithProjects,
} from '@/data/skills';

export type SearchableSkill = (typeof skillsWithProjects)[number];

export type SearchState = {
  query: string;
  categories: SkillCategory[];
  levels: SkillLevel[];
};

export const defaultSearchState: SearchState = {
  query: '',
  categories: [],
  levels: [],
};

const fuse = new Fuse(skillsWithProjects, {
  threshold: 0.35,
  ignoreLocation: true,
  keys: [
    { name: 'name', weight: 3 },
    { name: 'tags', weight: 2 },
    { name: 'summary', weight: 1.5 },
    { name: 'usage', weight: 1.5 },
    { name: 'projects.name', weight: 1.25 },
    { name: 'projects.summary', weight: 1 },
  ],
});

function hasCategory(value: string): value is SkillCategory {
  return skillCategories.includes(value as SkillCategory);
}

function hasLevel(value: string): value is `${SkillLevel}` {
  return Object.keys(skillLevels).includes(value);
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function searchSkills(state: SearchState): SearchableSkill[] {
  const query = state.query.trim();
  const queryResults = query
    ? fuse.search(query).map((result) => result.item)
    : [...skillsWithProjects];

  return queryResults.filter((skill) => {
    const categoryMatches =
      state.categories.length === 0 || state.categories.includes(skill.category);
    const levelMatches = state.levels.length === 0 || state.levels.includes(skill.level);

    return categoryMatches && levelMatches;
  });
}

export function parseSearchParams(params: URLSearchParams): SearchState {
  const categories = unique(params.getAll('category').filter(hasCategory));
  const levels = unique(
    params
      .getAll('level')
      .filter(hasLevel)
      .map((level) => Number(level) as SkillLevel)
  );

  return {
    query: params.get('q')?.trim() ?? '',
    categories,
    levels,
  };
}

export function serializeSearchState(state: SearchState): URLSearchParams {
  const params = new URLSearchParams();
  const query = state.query.trim();

  if (query) {
    params.set('q', query);
  }

  for (const category of state.categories) {
    params.append('category', category);
  }

  for (const level of state.levels) {
    params.append('level', String(level));
  }

  return params;
}

export function toggleFilter<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function projectText(skill: Pick<SearchableSkill, 'projects'>) {
  return skill.projects.map((project) => project.name).join(', ');
}

export type { Skill };
