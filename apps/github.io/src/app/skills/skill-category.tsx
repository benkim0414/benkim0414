import { Badge, type BadgeVariant } from '@astryxdesign/core/Badge';

import type { SkillCategory as SkillCategoryName } from './skill-list.types';

export const skillCategoryBadgeVariants = [
  'blue',
  'cyan',
  'green',
  'orange',
  'pink',
  'purple',
  'teal',
  'yellow',
] as const satisfies readonly BadgeVariant[];

interface SkillCategoryProps {
  name: SkillCategoryName;
}

export function getSkillCategoryVariant(name: string): BadgeVariant {
  const normalizedName = name.trim().toLowerCase();
  let hash = 0;

  for (let index = 0; index < normalizedName.length; index += 1) {
    hash = normalizedName.charCodeAt(index) + ((hash << 5) - hash);
    hash |= 0;
  }

  const variantIndex = Math.abs(hash) % skillCategoryBadgeVariants.length;

  return skillCategoryBadgeVariants[variantIndex];
}

export function SkillCategory({ name }: SkillCategoryProps) {
  return <Badge label={name} variant={getSkillCategoryVariant(name)} />;
}
