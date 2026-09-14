import { Card } from '@astryxdesign/core/Card';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Heading } from '@astryxdesign/core/Heading';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useId, useState, type ReactElement } from 'react';
import { siGithub } from 'simple-icons';

import { CountBadge } from '../count-badge';
import { shouldStartCollapsibleExpanded } from '../responsive-collapsible';
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
  header: {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  headingCopy: {
    minWidth: 0,
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
  const [areSkillsOpen, setAreSkillsOpen] = useState(
    shouldStartCollapsibleExpanded,
  );
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
            <IconButton
              as="a"
              href={project.githubUrl}
              icon={<GitHubIcon />}
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

function GitHubIcon(): ReactElement {
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={16}
      viewBox="0 0 24 24"
      width={16}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={siGithub.path} />
    </svg>
  );
}
