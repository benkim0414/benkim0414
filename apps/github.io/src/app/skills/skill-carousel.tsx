import { Carousel } from '@astryxdesign/core/Carousel';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import type { ReactElement } from 'react';

import { SkillCard } from './skill-card';
import type { Skill, SkillSurfaceVariant } from './skill-list.types';

export interface SkillCarouselProps {
  skills: readonly Skill[];
  ariaLabel?: string;
  emptyMessage?: string;
  variant?: SkillSurfaceVariant;
}

export function SkillCarousel({
  skills,
  ariaLabel = 'Skills carousel',
  emptyMessage = 'No skills have been supplied.',
  variant = 'default',
}: SkillCarouselProps): ReactElement {
  if (skills.length === 0) {
    return <EmptyState headingLevel={3} isCompact title={emptyMessage} />;
  }

  return (
    <Carousel
      aria-label={ariaLabel}
      className="skill-carousel"
      gap={3}
      hasSnap
    >
      {skills.map((skill, index) => (
        <SkillCard
          key={`${skill.id}-${index}`}
          skill={skill}
          variant={variant}
        />
      ))}
    </Carousel>
  );
}
