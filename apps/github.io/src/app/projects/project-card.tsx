import { Card } from '@astryxdesign/core/Card';
import { Citation } from '@astryxdesign/core/Citation';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useId, type ReactElement } from 'react';

import { getSkillBrand } from '../skills/skill-brand';
import { SkillToken } from '../skills/skill-token';
import type { Project } from './project-list.types';

export interface ProjectCardProps {
  isFullWidth?: boolean;
  project: Project;
}

const styles = stylex.create({
  root: {
    display: 'block',
  },
  skillList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
    padding: 0,
    margin: 0,
    listStyle: 'none',
  },
  skillItem: {
    display: 'inline-flex',
    maxWidth: '100%',
  },
});

export function ProjectCard({
  project,
}: ProjectCardProps): ReactElement {
  const titleId = useId();
  const githubBrand = getSkillBrand('GitHub');
  const githubSource = {
    title: 'GitHub',
    url: project.githubUrl,
    icon: githubBrand?.iconDataUrl,
  };

  return (
    <Card
      padding={4}
      width="100%"
      xstyle={styles.root}
    >
      <article aria-labelledby={titleId} data-testid="project-card">
        <VStack gap={4}>
          <VStack gap={2} hAlign="start">
            <Heading id={titleId} level={3}>
              {project.title}
            </Heading>
            <Text type="body" color="secondary" as="p">
              {project.description}
            </Text>
          </VStack>

          <VStack gap={2} hAlign="start">
            <Text type="supporting" color="secondary" as="p">
              Skills used
            </Text>
            <ul aria-label="Skills used" {...stylex.props(styles.skillList)}>
              {project.skills.map((skill) => (
                <li
                  key={`${skill.label}-${skill.brandLabel ?? skill.label}`}
                  {...stylex.props(styles.skillItem)}
                >
                  <SkillToken label={skill.label} brandLabel={skill.brandLabel} />
                </li>
              ))}
            </ul>
          </VStack>

          <VStack gap={2} hAlign="start">
            <Text type="supporting" color="secondary" as="p">
              Source
            </Text>
            <Citation number={1} source={githubSource} variant="label" />
          </VStack>
        </VStack>
      </article>
    </Card>
  );
}
