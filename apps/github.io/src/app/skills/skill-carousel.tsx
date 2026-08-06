import {
  Carousel,
  type CarouselProps,
} from '@astryxdesign/core/Carousel';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { VStack } from '@astryxdesign/core/Layout';
import type { ReactElement } from 'react';

import { SkillCard } from './skill-card';
import type { Skill, SkillSurfaceVariant } from './skill-list.types';

export interface SkillCarouselProps {
  skills: readonly Skill[];
  ariaLabel?: string;
  emptyMessage?: string;
  padding?: CarouselProps['padding'];
  variant?: SkillSurfaceVariant;
}

export function SkillCarousel({
  skills,
  ariaLabel = 'Skills carousel',
  emptyMessage = 'No skills have been supplied.',
  padding,
  variant = 'default',
}: SkillCarouselProps): ReactElement {
  if (skills.length === 0) {
    const emptyState = (
      <EmptyState headingLevel={3} isCompact title={emptyMessage} />
    );

    return padding == null ? (
      emptyState
    ) : (
      <VStack paddingInline={padding}>{emptyState}</VStack>
    );
  }

  return (
    <Carousel
      aria-label={ariaLabel}
      className="skill-carousel"
      gap={3}
      hasSnap
      padding={padding}
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
