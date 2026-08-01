import { EmptyState } from '@astryxdesign/core/EmptyState';
import { VStack } from '@astryxdesign/core/Layout';

import { SkillCard } from './skill-card';
import type { SkillListProps } from './skill-list.types';

export function SkillCardList({
  skills,
  heading = 'Skills',
  emptyMessage = 'No skills have been supplied.',
  variant = 'default',
}: SkillListProps) {
  return (
    <section aria-label={heading}>
      {skills.length === 0 ? (
        <EmptyState headingLevel={3} isCompact title={emptyMessage} />
      ) : (
        <VStack gap={3}>
          {skills.map((skill) => (
            <SkillCard
              isFullWidth
              key={skill.id}
              skill={skill}
              variant={variant}
            />
          ))}
        </VStack>
      )}
    </section>
  );
}
