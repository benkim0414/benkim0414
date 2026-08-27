import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import type { Experience } from '../experience/experience.types';
import type { Skill } from './skill-list.types';

export interface SkillExperienceCardListProps {
  readonly experiences: readonly Experience[];
  readonly skills?: readonly Skill[];
}

export interface SkillExperienceCardProps {
  readonly experience: Experience;
  readonly relevantSkillLabels?: readonly string[];
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
              relevantSkillLabels={getRelevantSkillLabels(experience, skills)}
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
}: SkillExperienceCardProps): ReactElement {
  return (
    <Card padding={4} width="100%">
      <VStack gap={3}>
        <VStack gap={1}>
          <Heading level={3}>{experience.title}</Heading>
          <Text as="p" type="body">
            {experience.summary}
          </Text>
        </VStack>

        <VStack gap={2}>
          {experience.narrative.map((paragraph) => (
            <Text key={paragraph} as="p" type="body" color="secondary">
              {paragraph}
            </Text>
          ))}
        </VStack>

        {relevantSkillLabels.length > 0 ? (
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              Relevant skills
            </Text>
            <HStack
              aria-label="Relevant skills"
              as="ul"
              wrap="wrap"
              xstyle={styles.tokenList}
              data-wrap="true"
            >
              {relevantSkillLabels.map((skillLabel) => (
                <li key={skillLabel} {...stylex.props(styles.tokenItem)}>
                  <Token label={skillLabel} size="sm" />
                </li>
              ))}
            </HStack>
          </VStack>
        ) : null}
      </VStack>
    </Card>
  );
}

function getRelevantSkillLabels(
  experience: Experience,
  skills: readonly Skill[],
): readonly string[] {
  const skillById = new Map(skills.map((skill) => [skill.id, skill.name]));

  return experience.skillIds
    .map((skillId) => skillById.get(skillId))
    .filter((skillLabel): skillLabel is string => Boolean(skillLabel));
}
