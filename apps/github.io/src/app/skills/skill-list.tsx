import { useMemo, useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { List, ListItem } from '@astryxdesign/core/List';
import { TextInput } from '@astryxdesign/core/TextInput';

import { SkillLogo } from './skill-logo';
import { SkillRating } from './skill-rating';
import type { Skill, SkillListProps } from './skill-list.types';

export function skillMatchesQuery(skill: Skill, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return true;
  }

  return [skill.name, skill.category, ...skill.keywords].some((value) =>
    value.toLowerCase().includes(normalizedQuery)
  );
}

export function SkillList({ skills, heading = 'Skills' }: SkillListProps) {
  const [query, setQuery] = useState('');
  const filteredSkills = useMemo(
    () => skills.filter((skill) => skillMatchesQuery(skill, query)),
    [query, skills]
  );

  return (
    <section className="skill-list" aria-labelledby="skill-list-heading">
      <div className="skill-list__header">
        <h2 id="skill-list-heading">{heading}</h2>
        <TextInput
          isLabelHidden
          label="Search skills"
          onChange={setQuery}
          placeholder="Search skills"
          value={query}
        />
      </div>

      {filteredSkills.length > 0 ? (
        <List className="skill-list__items" density="compact" hasDividers>
          {filteredSkills.map((skill) => (
            <ListItem
              key={skill.id}
              endContent={<SkillRating level={skill.level} />}
              label={
                <div className="skill-list__item-copy">
                  <span className="skill-list__name">{skill.name}</span>
                  <Badge label={skill.category} />
                </div>
              }
              startContent={<SkillLogo skill={skill} />}
            />
          ))}
        </List>
      ) : (
        <p className="skill-list__empty">No skills match your search.</p>
      )}
    </section>
  );
}
