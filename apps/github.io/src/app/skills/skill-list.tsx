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
    <h2 className="m-0 text-2xl" id={headingId}>
      {heading}
    </h2>
  );

  return (
    <section className="grid gap-4" aria-labelledby={headingId}>
      {skills.length === 0 ? (
        <>
          <div className="grid gap-3">{headingElement}</div>
          <EmptyState headingLevel={3} isCompact title={emptyMessage} />
        </>
      ) : (
        <List
          className="w-full"
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
