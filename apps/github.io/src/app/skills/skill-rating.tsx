import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import type { Skill } from './skill-list.types';

interface SkillRatingProps {
  level: Skill['level'];
}

export function SkillRating({ level }: SkillRatingProps) {
  return (
    <span className="skill-rating">
      <VisuallyHidden>{level} out of 5</VisuallyHidden>
      <span className="skill-rating__stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index}>{index < level ? '★' : '☆'}</span>
        ))}
      </span>
      <span className="skill-rating__compact" aria-hidden="true">
        <span>★</span>
        <span>
          {level}
          /5
        </span>
      </span>
    </span>
  );
}
