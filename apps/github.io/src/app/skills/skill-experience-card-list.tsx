import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import type { Experience } from '../experience/experience.types';

export interface SkillExperienceCardListProps {
  readonly experiences: readonly Experience[];
}

export interface SkillExperienceCardProps {
  readonly experience: Experience;
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
}: SkillExperienceCardListProps): ReactElement {
  return (
    <ul aria-label="Skill experience" {...stylex.props(styles.list)}>
      {experiences.map((experience) => (
        <li key={experience.id} {...stylex.props(styles.item)}>
          <VStack paddingBlock={2}>
            <SkillExperienceCard experience={experience} />
          </VStack>
        </li>
      ))}
    </ul>
  );
}

export function SkillExperienceCard({
  experience,
}: SkillExperienceCardProps): ReactElement {
  return (
    <Card width="100%">
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

        {experience.technologies.length > 0 ? (
          <HStack as="ul" gap={1} wrap="wrap" xstyle={styles.tokenList}>
            {experience.technologies.map((technology) => (
              <li key={technology} {...stylex.props(styles.tokenItem)}>
                <Token label={technology} size="sm" />
              </li>
            ))}
          </HStack>
        ) : null}
      </VStack>
    </Card>
  );
}
