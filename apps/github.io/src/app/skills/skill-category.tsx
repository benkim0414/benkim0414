import { Badge } from '@astryxdesign/core/Badge';

import type { SkillCategory as SkillCategoryName } from './skill-list.types';

interface SkillCategoryProps {
  name: SkillCategoryName;
}

export function SkillCategory({ name }: SkillCategoryProps) {
  return <Badge label={name} />;
}
