import { Avatar } from '@astryxdesign/core/Avatar';

import type { Skill } from './skill-list.types';

interface SkillLogoProps {
  skill: Skill;
}

export function SkillLogo({ skill }: SkillLogoProps) {
  return (
    <Avatar
      aria-hidden="true"
      className="skill-logo"
      data-icon-slug={skill.iconSlug}
      name={skill.name}
    />
  );
}
