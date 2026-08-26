import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import type { Experience } from '../experience/experience.types';

export interface SkillExperienceCardListProps {
  readonly experiences: readonly Experience[];
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

                <ExperienceMetadata experience={experience} />

                {experience.technologies.length > 0 ? (
                  <HStack
                    as="ul"
                    gap={1}
                    wrap="wrap"
                    xstyle={styles.tokenList}
                  >
                    {experience.technologies.map((technology) => (
                      <li
                        key={technology}
                        {...stylex.props(styles.tokenItem)}
                      >
                        <Token label={technology} size="sm" />
                      </li>
                    ))}
                  </HStack>
                ) : null}
              </VStack>
            </Card>
          </VStack>
        </li>
      ))}
    </ul>
  );
}

function ExperienceMetadata({
  experience,
}: {
  readonly experience: Experience;
}): ReactElement | null {
  const environments = experience.environments ?? [];

  if (!experience.role && environments.length === 0) return null;

  return (
    <MetadataList>
      {experience.role ? (
        <MetadataListItem label="Role">{experience.role}</MetadataListItem>
      ) : null}
      {environments.length > 0 ? (
        <MetadataListItem label="Environments">
          <HStack
            as="ul"
            gap={1}
            wrap="wrap"
            xstyle={styles.tokenList}
          >
            {environments.map(({ label }) => (
              <li key={label} {...stylex.props(styles.tokenItem)}>
                <Token label={label} size="sm" color="gray" />
              </li>
            ))}
          </HStack>
        </MetadataListItem>
      ) : null}
    </MetadataList>
  );
}
