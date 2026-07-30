import { HStack } from '@astryxdesign/core/Layout';
import { ListItem } from '@astryxdesign/core/List';

import { SkillAvatar } from './skill-avatar';
import { SkillCategory } from './skill-category';
import { SkillRating } from './skill-rating';
import type { Skill } from './skill-list.types';

interface SkillListItemProps {
  skill: Skill;
}

export function SkillListItem({ skill }: SkillListItemProps) {
  return (
    <ListItem
      endContent={
        <HStack gap={2} vAlign="center">
          {skill.categories.map((category) => (
            <SkillCategory key={category} name={category} />
          ))}
          <SkillRating level={skill.level} />
        </HStack>
      }
      label={skill.name}
      startContent={<SkillAvatar skill={skill} />}
    />
  );
}
