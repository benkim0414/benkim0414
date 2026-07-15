import { useId } from 'react';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { List } from '@astryxdesign/core/List';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import { SkillListItem } from './skill-list-item';
import type { SkillListProps } from './skill-list.types';

export function SkillList({
  skills,
  heading = 'Skills',
  emptyMessage = 'No skills have been supplied.',
  isHeadingHidden = false,
}: SkillListProps) {
  const headingId = useId();
  const headingElement = isHeadingHidden ? (
    <VisuallyHidden as="h2" id={headingId}>
      {heading}
    </VisuallyHidden>
  ) : (
    <h2 className="skill-list__heading" id={headingId}>
      {heading}
    </h2>
  );

  return (
    <section className="skill-list" aria-labelledby={headingId}>
      {skills.length === 0 ? (
        <>
          <div className="skill-list__header">{headingElement}</div>
          <EmptyState headingLevel={3} isCompact title={emptyMessage} />
        </>
      ) : (
        <List
          className="skill-list__items"
          density="compact"
          hasDividers
          header={headingElement}
        >
          {skills.map((skill) => (
            <SkillListItem key={skill.id} skill={skill} />
          ))}
        </List>
      )}
    </section>
  );
}
