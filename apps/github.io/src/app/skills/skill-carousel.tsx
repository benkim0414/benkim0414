import { Carousel } from '@astryxdesign/core/Carousel';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { ReactElement } from 'react';

import { SkillCard } from './skill-card';
import type { Skill } from './skill-list.types';

export interface SkillCarouselProps {
  skills: readonly Skill[];
  emptyMessage?: string;
}

export function SkillCarousel({
  skills,
  emptyMessage = 'No skills have been supplied.',
}: SkillCarouselProps): ReactElement {
  if (skills.length === 0) {
    return <EmptyState headingLevel={3} isCompact title={emptyMessage} />;
  }

  return (
    <Carousel aria-label="Skills carousel" gap={3} hasSnap>
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </Carousel>
  );
}
