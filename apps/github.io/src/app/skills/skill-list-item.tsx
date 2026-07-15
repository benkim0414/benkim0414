import { ListItem } from '@astryxdesign/core/List';

import { SkillAvatar } from './skill-avatar';
import { SkillCategory } from './skill-category';
import { SkillRating } from './skill-rating';
import type { Skill } from './skill-list.types';

interface SkillListItemProps {
  skill: Skill;
}

export function SkillListItem({ skill }: SkillListItemProps) {
  return (
    <ListItem
      endContent={<SkillRating level={skill.level} />}
      label={
        <div className="skill-list__item-copy">
          <span className="skill-list__name">{skill.name}</span>
          <SkillCategory name={skill.category} />
        </div>
      }
      startContent={<SkillAvatar skill={skill} />}
    />
  );
}
