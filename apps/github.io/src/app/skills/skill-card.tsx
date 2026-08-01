import * as stylex from '@stylexjs/stylex';
import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import { useId, type ReactElement } from 'react';

import { CertificationCitation } from '../certifications/certification-citation';
import { SkillCategory } from './skill-category';
import { SkillRating } from './skill-rating';
import type { Skill } from './skill-list.types';

export interface SkillCardProps {
  skill: Skill;
}

const styles = stylex.create({
  root: {
    display: 'block',
    width: {
      default: `calc(${spacingVars['--spacing-12']} * 7)`,
      '@media (max-width: 640px)': `calc(${spacingVars['--spacing-12']} * 5)`,
    },
  },
  citationList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
    padding: 0,
    margin: 0,
    listStyle: 'none',
  },
  citationItem: {
    display: 'inline-flex',
    maxWidth: '100%',
  },
});

export function SkillCard({ skill }: SkillCardProps): ReactElement {
  const certifications = skill.certifications ?? [];
  const titleId = useId();

  return (
    <Card padding={4} xstyle={styles.root}>
      <article
        aria-labelledby={titleId}
        data-testid="skill-card"
      >
        <VStack gap={3}>
          <VStack gap={2} hAlign="start">
            <HStack gap={1} wrap="wrap">
              {skill.categories.map((category) => (
                <SkillCategory key={category} name={category} />
              ))}
            </HStack>
            <VStack gap={1} hAlign="start">
              <VStack
                gap={0.5}
                hAlign="start"
                data-testid="skill-card-title-rating"
              >
                <Heading id={titleId} level={4} accessibilityLevel={3}>
                  {skill.name}
                </Heading>
                <SkillRating level={skill.level} />
              </VStack>
              <Text type="supporting" as="p">
                {skill.description}
              </Text>
            </VStack>
          </VStack>

          {certifications.length > 0 ? (
            <ul {...stylex.props(styles.citationList)}>
              {certifications.map((certification, index) => (
                <li
                  {...stylex.props(styles.citationItem)}
                  key={`${certification.title}-${certification.url}-${certification.expiresAt}`}
                >
                  <CertificationCitation {...certification} number={index + 1} />
                </li>
              ))}
            </ul>
          ) : null}
        </VStack>
      </article>
    </Card>
  );
}
