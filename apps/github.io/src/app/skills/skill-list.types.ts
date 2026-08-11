import type { CertificationRecord } from '../certifications/certification.types';

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

export type SkillCertification = Omit<CertificationRecord, 'id'>;

export interface Skill {
  id: string;
  name: string;
  description: string;
  categories: readonly SkillCategory[];
  level: 1 | 2 | 3 | 4 | 5;
  iconSlug: string;
  keywords: readonly string[];
  certifications?: readonly SkillCertification[];
}

export type SkillSurfaceVariant = 'default' | 'compact';

export interface SkillListProps {
  skills: readonly Skill[];
  heading?: string;
  emptyMessage?: string;
  isHeadingHidden?: boolean;
  variant?: SkillSurfaceVariant;
}
