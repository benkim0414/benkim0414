import { useId } from 'react';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { List } from '@astryxdesign/core/List';

import { SkillListItem } from './skill-list-item';
import type { SkillListProps } from './skill-list.types';

export function SkillList({
  skills,
  heading = 'Skills',
  emptyMessage = 'No skills have been supplied.',
}: SkillListProps) {
  const headingId = useId();

  return (
    <section className="skill-list" aria-labelledby={headingId}>
      <div className="skill-list__header">
        <h2 id={headingId}>{heading}</h2>
      </div>

      {skills.length === 0 ? (
        <EmptyState headingLevel={3} isCompact title={emptyMessage} />
      ) : (
        <List className="skill-list__items" density="compact" hasDividers>
          {skills.map((skill) => (
            <SkillListItem key={skill.id} skill={skill} />
          ))}
        </List>
      )}
    </section>
  );
}
