import { HStack, StackItem } from '@astryxdesign/core/Layout';
import { ListItem } from '@astryxdesign/core/List';
import { Text } from '@astryxdesign/core/Text';

import { SkillAvatar } from './skill-avatar';
import { SkillCategory } from './skill-category';
import { SkillRating } from './skill-rating';
import type { Skill, SkillSurfaceVariant } from './skill-list.types';

interface SkillListItemProps {
  skill: Skill;
  variant?: SkillSurfaceVariant;
  href?: string;
}

export function SkillListItem({
  skill,
  variant = 'default',
  href,
}: SkillListItemProps) {
  const shouldShowCategories = variant === 'default';
  const metadata = (
    <HStack gap={2} vAlign="center">
      {shouldShowCategories
        ? skill.categories.map((category) => (
            <SkillCategory key={category} name={category} />
          ))
        : null}
      <SkillRating level={skill.level} />
    </HStack>
  );

  if (href) {
    return (
      <ListItem
        href={href}
        label={
          <HStack gap={2} vAlign="center" width="100%">
            <SkillAvatar skill={skill} size="small" />
            <StackItem size="fill">
              <Text display="block" maxLines={1}>
                {skill.name}
              </Text>
            </StackItem>
            {metadata}
          </HStack>
        }
      />
    );
  }

  return (
    <ListItem
      endContent={metadata}
      label={skill.name}
      startContent={<SkillAvatar skill={skill} size="small" />}
    />
  );
}
