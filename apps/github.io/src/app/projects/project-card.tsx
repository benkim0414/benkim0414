import { Button } from '@astryxdesign/core/Button';
import { Card } from '@astryxdesign/core/Card';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useId, useState, type ReactElement } from 'react';

import { CountBadge } from '../count-badge';
import { getSkillBrand } from '../skills/skill-brand';
import { SkillToken } from '../skills/skill-token';
import type { Project } from './project-list.types';

const SMALL_VIEWPORT_QUERY = '(max-width: 640px)';

export interface ProjectCardProps {
  isFullWidth?: boolean;
  project: Project;
}

const styles = stylex.create({
  root: {
    display: 'block',
  },
  header: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  headingCopy: {
    minWidth: 0,
  },
  githubIcon: {
    display: 'block',
    width: spacingVars['--spacing-5'],
    height: spacingVars['--spacing-5'],
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
  const [areSkillsOpen, setAreSkillsOpen] = useState(shouldStartExpanded);
  const githubBrand = getSkillBrand('GitHub');
  const repositoryLinkLabel = `Open ${project.title} on GitHub`;

  return (
    <Card
      padding={4}
      width="100%"
      xstyle={styles.root}
    >
      <article aria-labelledby={titleId} data-testid="project-card">
        <VStack gap={4}>
          <HStack gap={3} xstyle={styles.header}>
            <VStack gap={2} hAlign="start" xstyle={styles.headingCopy}>
              <Heading id={titleId} level={3}>
                {project.title}
              </Heading>
              <Text type="body" color="secondary" as="p">
                {project.description}
              </Text>
            </VStack>
            <Button
              href={project.githubUrl}
              icon={
                <img
                  alt=""
                  aria-hidden="true"
                  src={githubBrand?.iconDataUrl}
                  {...stylex.props(styles.githubIcon)}
                />
              }
              isIconOnly
              label={repositoryLinkLabel}
              rel="noopener noreferrer"
              size="sm"
              target="_blank"
              tooltip={repositoryLinkLabel}
              variant="ghost"
            />
          </HStack>

          <Collapsible
            isOpen={areSkillsOpen}
            onOpenChange={setAreSkillsOpen}
            trigger={
              <HStack gap={2} vAlign="center">
                <Text type="supporting" color="secondary">
                  Skills used
                </Text>
                <CountBadge count={project.skills.length} />
              </HStack>
            }
          >
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
          </Collapsible>
        </VStack>
      </article>
    </Card>
  );
}

function shouldStartExpanded(): boolean {
  return (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function' ||
    !window.matchMedia(SMALL_VIEWPORT_QUERY).matches
  );
}
