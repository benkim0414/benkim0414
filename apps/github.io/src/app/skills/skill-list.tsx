import { EmptyState } from '@astryxdesign/core/EmptyState';
import { List } from '@astryxdesign/core/List';

import { SkillListItem } from './skill-list-item';
import type { SkillListProps } from './skill-list.types';

export function SkillList({
  skills,
  heading = 'Skills',
  emptyMessage = 'No skills have been supplied.',
  variant = 'default',
  getSkillHref,
}: SkillListProps) {
  return (
    <section aria-label={heading}>
      {skills.length === 0 ? (
        <EmptyState headingLevel={3} isCompact title={emptyMessage} />
      ) : (
        <List className="w-full" density="compact">
          {skills.map((skill) => (
            <SkillListItem
              href={getSkillHref?.(skill)}
              key={skill.id}
              skill={skill}
              variant={variant}
            />
          ))}
        </List>
      )}
    </section>
  );
}
