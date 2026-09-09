import { HStack, StackItem } from '@astryxdesign/core/Layout';
import { ListItem } from '@astryxdesign/core/List';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import { SkillAvatar } from './skill-avatar';
import { SkillCategory } from './skill-category';
import { SkillConfidence } from './skill-confidence';
import type { Skill, SkillSurfaceVariant } from './skill-list.types';

interface SkillListItemProps {
  skill: Skill;
  variant?: SkillSurfaceVariant;
  href?: string;
}

const styles = stylex.create({
  linkedRoot: {
    paddingBlock: spacingVars['--spacing-0'],
    paddingInline: spacingVars['--spacing-0'],
  },
});

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
      <SkillConfidence
        confidence={skill.confidence}
        hasTooltip={!href}
        variant="token"
      />
    </HStack>
  );

  if (href) {
    return (
      <ListItem
        href={href}
        label={
          <HStack
            gap={2}
            paddingBlock={2}
            paddingInline={2}
            vAlign="center"
            width="100%"
          >
            <SkillAvatar
              isDecorative
              skill={skill}
              size="sm"
              tooltip={false}
            />
            <StackItem size="fill">
              <Text display="block" maxLines={1}>
                {skill.name}
              </Text>
            </StackItem>
            {metadata}
          </HStack>
        }
        xstyle={styles.linkedRoot}
      />
    );
  }

  return (
    <ListItem
      endContent={metadata}
      label={skill.name}
      startContent={
        <SkillAvatar skill={skill} size="sm" tooltip={false} />
      }
    />
  );
}
