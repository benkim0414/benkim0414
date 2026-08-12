import { BreadcrumbItem, Breadcrumbs } from '@astryxdesign/core/Breadcrumbs';
import { Blockquote } from '@astryxdesign/core/Blockquote';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, type ReactElement } from 'react';

import { CertificationCitation } from '../certifications/certification-citation';
import { ProjectCard } from '../projects/project-card';
import { SkillCategory } from './skill-category';
import type { ResolvedSkillDetail } from './skill-detail.types';
import { SkillExperienceList } from './skill-experience-list';
import { SkillRating } from './skill-rating';

export interface SkillDetailPageProps {
  detail: ResolvedSkillDetail;
}

const styles = stylex.create({
  page: {
    width: '100%',
    maxWidth: `calc(${spacingVars['--spacing-12']} * 14)`,
    marginInline: 'auto',
  },
  certificationList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  certificationItem: {
    display: 'inline-flex',
    maxWidth: '100%',
    listStyle: 'none',
  },
});

export function SkillDetailPage({ detail }: SkillDetailPageProps): ReactElement {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousSkillIdRef = useRef(detail.skill.id);
  const certifications = detail.skill.certifications ?? [];

  useEffect(() => {
    if (previousSkillIdRef.current !== detail.skill.id) {
      headingRef.current?.focus();
    }

    previousSkillIdRef.current = detail.skill.id;
  }, [detail.skill.id]);

  return (
    <VStack
      as="main"
      gap={6}
      paddingBlock={6}
      paddingInline={4}
      xstyle={styles.page}
    >
      <Breadcrumbs label="Skill breadcrumb">
        <BreadcrumbItem href="/">Skills</BreadcrumbItem>
        <BreadcrumbItem isCurrent>{detail.skill.name}</BreadcrumbItem>
      </Breadcrumbs>

      <VStack gap={3} hAlign="start">
        <Heading ref={headingRef} level={1} tabIndex={-1}>
          {detail.skill.name}
        </Heading>
        <HStack gap={1} wrap="wrap">
          {detail.skill.categories.map((category) => (
            <SkillCategory key={category} name={category} />
          ))}
        </HStack>
        <SkillRating level={detail.skill.level} />
        <Text as="p" type="body" color="secondary">
          {detail.skill.description}
        </Text>
      </VStack>

      {detail.experienceSummary ? (
        <section aria-labelledby="skill-experience-heading">
          <VStack gap={3}>
            <Heading id="skill-experience-heading" level={2}>
              In practice
            </Heading>
            <Blockquote>{detail.experienceSummary}</Blockquote>
            <SkillExperienceList evidence={detail.experienceEvidence} />
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

      {certifications.length > 0 ? (
        <section aria-labelledby="skill-certifications-heading">
          <VStack gap={3}>
            <Heading id="skill-certifications-heading" level={2}>
              Certifications
            </Heading>
            <ul {...stylex.props(styles.certificationList)}>
              {certifications.map((certification, index) => (
                <li
                  key={`${certification.title}-${certification.url}-${certification.expiresAt}`}
                  {...stylex.props(styles.certificationItem)}
                >
                  <CertificationCitation {...certification} number={index + 1} />
                </li>
              ))}
            </ul>
          </VStack>
        </section>
      ) : null}
    </VStack>
  );
}
