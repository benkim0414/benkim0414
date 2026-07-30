import * as stylex from '@stylexjs/stylex';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Layout';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import { useId, type ReactElement } from 'react';

import { CertificationCitation } from '../certifications/certification-citation';
import { SkillCategory } from './skill-category';
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
  title: {
    margin: 0,
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-heading-3-size'],
    lineHeight: typeScaleVars['--text-heading-3-leading'],
  },
  description: {
    margin: 0,
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
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
          <VStack gap={1} hAlign="start">
            <SkillCategory name={skill.category} />
            <h3 id={titleId} {...stylex.props(styles.title)}>
              {skill.name}
            </h3>
            <p {...stylex.props(styles.description)}>{skill.description}</p>
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
