import { Token } from '@astryxdesign/core/Token';

import type { SkillCategory as SkillCategoryName } from './skill-list.types';

interface SkillCategoryProps {
  name: SkillCategoryName;
}

export function SkillCategory({ name }: SkillCategoryProps) {
  return <Token label={name} size="sm" />;
}
