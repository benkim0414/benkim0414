import { HStack } from '@astryxdesign/core/Layout';
import { ListItem } from '@astryxdesign/core/List';

import { SkillAvatar } from './skill-avatar';
import { SkillCategory } from './skill-category';
import { SkillRating } from './skill-rating';
import type { Skill, SkillSurfaceVariant } from './skill-list.types';

interface SkillListItemProps {
  skill: Skill;
  variant?: SkillSurfaceVariant;
}

export function SkillListItem({
  skill,
  variant = 'default',
}: SkillListItemProps) {
  const shouldShowCategories = variant === 'default';

  return (
    <ListItem
      endContent={
        <HStack gap={2} vAlign="center">
          {shouldShowCategories
            ? skill.categories.map((category) => (
                <SkillCategory key={category} name={category} />
              ))
            : null}
          <SkillRating level={skill.level} />
        </HStack>
      }
      label={skill.name}
      startContent={<SkillAvatar skill={skill} size="small" />}
    />
  );
}
