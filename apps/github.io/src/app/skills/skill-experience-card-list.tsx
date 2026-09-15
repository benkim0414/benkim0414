import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { CountBadge } from '../count-badge';
import type { Experience } from '../experience/experience.types';
import { SkillExperienceCardShell } from './skill-experience-card-shell';
import { getSkillDetailPath } from './skill-route';
import { SkillKeyOutcomes } from './skill-key-outcomes';
import type { Skill } from './skill-list.types';
import { SkillToken } from './skill-token';

export interface SkillExperienceCardListProps {
  readonly appearance?: 'card' | 'plain';
  readonly detailSkillId?: string;
  readonly experiences: readonly Experience[];
  readonly skills?: readonly Skill[];
}

export interface SkillExperienceCardProps {
  readonly appearance?: 'card' | 'plain';
  readonly detailSkillId?: string;
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
  appearance = 'card',
  detailSkillId,
  experiences,
  skills = [],
}: SkillExperienceCardListProps): ReactElement {
  return (
    <VStack
      aria-label="Skill experience"
      as="ul"
      gap={appearance === 'plain' ? 0 : undefined}
      xstyle={styles.list}
    >
      {experiences.map((experience) => (
        <li key={experience.id} {...stylex.props(styles.item)}>
          <VStack paddingBlock={appearance === 'plain' ? undefined : 2}>
            <SkillExperienceCard
              appearance={appearance}
              detailSkillId={detailSkillId}
              experience={experience}
              relevantSkills={getRelevantSkills(experience, skills)}
            />
          </VStack>
        </li>
      ))}
    </VStack>
  );
}

export function SkillExperienceCard({
  appearance = 'card',
  detailSkillId,
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
      appearance={appearance}
      anchorId={`experience-${experience.id}`}
      href={
        appearance === 'plain' && detailSkillId
          ? `${getSkillDetailPath(detailSkillId)}#experience-${experience.id}`
          : undefined
      }
      outcomeCount={experience.narrative.length}
      skillCount={resolvedRelevantSkills.length}
      summary={experience.summary}
      title={experience.title}
    >
      <SkillKeyOutcomes outcomes={experience.narrative} />

      {resolvedRelevantSkills.length > 0 ? (
        <VStack gap={1}>
          {appearance === 'card' && experience.narrative.length > 0 ? (
            <HStack gap={2} vAlign="center">
              <Text type="supporting" color="secondary">
                Relevant skills
              </Text>
              <CountBadge count={resolvedRelevantSkills.length} />
            </HStack>
          ) : null}
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
                  href={
                    relevantSkills ? getSkillDetailPath(skill.id) : undefined
                  }
                  label={skill.name}
                  variant="neutral"
                />
              </li>
            ))}
          </HStack>
        </VStack>
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
