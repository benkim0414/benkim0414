export const skillCategories = [
  'Language',
  'Runtime',
  'Framework',
  'Cloud',
  'Container',
  'CI/CD',
  'IaC',
  'Observability',
  'Database',
  'Build',
  'Testing',
  'Design System',
  'Tooling',
] as const;

export type SkillCategory = (typeof skillCategories)[number];

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: 1 | 2 | 3 | 4 | 5;
  iconSlug: string;
  keywords: readonly string[];
}

export interface SkillListProps {
  skills: readonly Skill[];
  heading?: string;
}
