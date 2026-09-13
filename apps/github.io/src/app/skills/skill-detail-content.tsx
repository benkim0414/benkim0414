import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { CertificationCitation } from '../certifications/certification-citation';
import { CountBadge } from '../count-badge';
import { ProjectCard } from '../projects/project-card';
import { SkillCategory } from './skill-category';
import type { ResolvedSkillDetail } from './skill-detail.types';
import { SkillExperienceCardList } from './skill-experience-card-list';
import { SkillExperienceList } from './skill-experience-list';
import { SkillConfidence } from './skill-confidence';

export interface SkillDetailContentProps {
  readonly detail: ResolvedSkillDetail;
}

const styles = stylex.create({
  metadataCard: {
    backgroundColor: colorVars['--color-background-surface'],
  },
  metadataValueList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  metadataValueItem: {
    display: 'inline-flex',
    maxWidth: '100%',
    listStyle: 'none',
  },
});

export function SkillDetailContent({
  detail,
}: SkillDetailContentProps): ReactElement {
  const certifications = detail.skill.certifications ?? [];
  const hasExperience =
    detail.experiences.length > 0 || detail.experienceEvidence.length > 0;

  return (
    <VStack gap={6}>
      <Card variant="muted" width="100%" xstyle={styles.metadataCard}>
        <MetadataList data-testid="skill-metadata">
          <MetadataListItem label="Primary use">
            <Text type="supporting">{detail.skill.primaryUse}</Text>
          </MetadataListItem>

          <MetadataListItem label="Categories">
            <HStack
              as="ul"
              gap={1}
              wrap="wrap"
              xstyle={styles.metadataValueList}
            >
              {detail.skill.categories.map((category) => (
                <li key={category} {...stylex.props(styles.metadataValueItem)}>
                  <SkillCategory name={category} />
                </li>
              ))}
            </HStack>
          </MetadataListItem>

          <MetadataListItem label="Confidence">
            <SkillConfidence confidence={detail.skill.confidence} />
          </MetadataListItem>

          {certifications.length > 0 ? (
            <MetadataListItem label="Certifications">
              <HStack
                as="ul"
                gap={2}
                wrap="wrap"
                xstyle={styles.metadataValueList}
              >
                {certifications.map((certification, index) => (
                  <li
                    key={`${certification.title}-${certification.url}-${certification.expiresAt}`}
                    {...stylex.props(styles.metadataValueItem)}
                  >
                    <CertificationCitation
                      {...certification}
                      number={index + 1}
                    />
                  </li>
                ))}
              </HStack>
            </MetadataListItem>
          ) : null}
        </MetadataList>
      </Card>

      {hasExperience ? (
        <section aria-labelledby="skill-experience-narrative-heading">
          <VStack gap={3}>
            <HStack gap={2} vAlign="center">
              <Heading id="skill-experience-narrative-heading" level={2}>
                Experience
              </Heading>
              <CountBadge count={detail.experiences.length} />
            </HStack>

            {detail.experiences.length > 0 ? (
              <SkillExperienceCardList
                experiences={detail.experiences}
                skills={detail.relatedSkills}
              />
            ) : null}

            {detail.experienceEvidence.length > 0 ? (
              <SkillExperienceList
                evidence={detail.experienceEvidence}
                skills={detail.relatedSkills}
              />
            ) : null}
          </VStack>
        </section>
      ) : null}

      {detail.projects.length > 0 ? (
        <section aria-labelledby="skill-projects-heading">
          <VStack gap={3}>
            <Heading id="skill-projects-heading" level={2}>
              Projects
            </Heading>
            {detail.projects.map((project) => (
              <ProjectCard key={project.id} isFullWidth project={project} />
            ))}
          </VStack>
        </section>
      ) : null}
    </VStack>
  );
}
