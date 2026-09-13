import { HStack, VStack } from '@astryxdesign/core/Layout';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import type { Experience } from '../experience/experience.types';
import { SkillExperienceCardShell } from './skill-experience-card-shell';
import { getSkillDetailPath } from './skill-route';
import { SkillKeyOutcomes } from './skill-key-outcomes';
import type { Skill } from './skill-list.types';
import { SkillToken } from './skill-token';

export interface SkillExperienceCardListProps {
  readonly experiences: readonly Experience[];
  readonly skills?: readonly Skill[];
}

export interface SkillExperienceCardProps {
  readonly experience: Experience;
  readonly relevantSkillLabels?: readonly string[];
  readonly relevantSkills?: readonly RelevantSkill[];
}

interface RelevantSkill {
  readonly id: string;
  readonly name: string;
}

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  item: {
    listStyle: 'none',
  },
  tokenList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  tokenItem: {
    display: 'inline-flex',
    maxWidth: '100%',
    listStyle: 'none',
  },
});

export function SkillExperienceCardList({
  experiences,
  skills = [],
}: SkillExperienceCardListProps): ReactElement {
  return (
    <ul aria-label="Skill experience" {...stylex.props(styles.list)}>
      {experiences.map((experience) => (
        <li key={experience.id} {...stylex.props(styles.item)}>
          <VStack paddingBlock={2}>
            <SkillExperienceCard
              experience={experience}
              relevantSkills={getRelevantSkills(experience, skills)}
            />
          </VStack>
        </li>
      ))}
    </ul>
  );
}

export function SkillExperienceCard({
  experience,
  relevantSkillLabels = [],
  relevantSkills,
}: SkillExperienceCardProps): ReactElement {
  const resolvedRelevantSkills =
    relevantSkills ??
    relevantSkillLabels.map((label) => ({
      id: label,
      name: label,
    }));

  return (
    <SkillExperienceCardShell
      outcomeCount={experience.narrative.length}
      skillCount={resolvedRelevantSkills.length}
      summary={experience.summary}
      title={experience.title}
    >
      <SkillKeyOutcomes outcomes={experience.narrative} />

      {resolvedRelevantSkills.length > 0 ? (
        <HStack
          aria-label="Relevant skills"
          as="ul"
          wrap="wrap"
          xstyle={styles.tokenList}
          data-wrap="true"
        >
          {resolvedRelevantSkills.map((skill) => (
            <li key={skill.id} {...stylex.props(styles.tokenItem)}>
              <SkillToken
                href={relevantSkills ? getSkillDetailPath(skill.id) : undefined}
                label={skill.name}
                variant="neutral"
              />
            </li>
          ))}
        </HStack>
      ) : null}
    </SkillExperienceCardShell>
  );
}

function getRelevantSkills(
  experience: Experience,
  skills: readonly Skill[],
): readonly RelevantSkill[] {
  const skillById = new Map(skills.map((skill) => [skill.id, skill]));

  return experience.skillIds
    .map((skillId) => skillById.get(skillId))
    .filter((skill): skill is Skill => Boolean(skill))
    .map(({ id, name }) => ({ id, name }));
}
