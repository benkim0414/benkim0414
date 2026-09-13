import { BreadcrumbItem, Breadcrumbs } from '@astryxdesign/core/Breadcrumbs';
import { Grid } from '@astryxdesign/core/Grid';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/Layout';
import { Outline, type OutlineItem } from '@astryxdesign/core/Outline';
import { Text } from '@astryxdesign/core/Text';
import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef, type ReactElement } from 'react';

import { SkillDetailContent } from './skill-detail-content';
import type { ResolvedSkillDetail } from './skill-detail.types';

export interface SkillDetailPageProps {
  detail: ResolvedSkillDetail;
}

const outlineSections = {
  overview: { id: 'skill-overview-heading', label: 'Overview', level: 1 },
  experience: {
    id: 'skill-experience-narrative-heading',
    label: 'Experience',
    level: 2,
  },
  projects: { id: 'skill-projects-heading', label: 'Projects', level: 2 },
} as const satisfies Record<string, OutlineItem>;

const styles = stylex.create({
  pageLayout: {
    gridTemplateColumns: {
      default: 'minmax(0, 1fr)',
      '@media (min-width: 768px)': 'minmax(0, 1fr) 208px',
    },
  },
  outlineRail: {
    display: {
      default: 'none',
      '@media (min-width: 768px)': 'block',
    },
    position: 'sticky',
    top: 0,
    alignSelf: 'start',
  },
});

export function SkillDetailPage({
  detail,
}: SkillDetailPageProps): ReactElement {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const hasExperience =
    detail.experiences.length > 0 || detail.experienceEvidence.length > 0;
  const hasProjects = detail.projects.length > 0;
  const outlineItems: OutlineItem[] = [
    outlineSections.overview,
    ...(hasExperience ? [outlineSections.experience] : []),
    ...(hasProjects ? [outlineSections.projects] : []),
  ];

  useEffect(() => {
    headingRef.current?.focus();
  }, [detail.skill.id]);

  const content = (
    <VStack gap={6}>
      <Breadcrumbs label="Skill breadcrumb">
        <BreadcrumbItem href="/skills">Skills</BreadcrumbItem>
        <BreadcrumbItem isCurrent>{detail.skill.name}</BreadcrumbItem>
      </Breadcrumbs>

      <VStack gap={3} hAlign="start">
        <Heading
          id={outlineSections.overview.id}
          ref={headingRef}
          level={1}
          tabIndex={-1}
        >
          {detail.skill.name}
        </Heading>
        <Text as="p" type="body" color="secondary">
          {detail.skill.description}
        </Text>
      </VStack>

      <SkillDetailContent detail={detail} />
    </VStack>
  );

  return (
    <VStack
      aria-label="Skill detail"
      as="main"
      data-testid="skill-detail-content"
      gap={6}
      paddingBlock={6}
      paddingInline={4}
      ref={(element) => {
        scrollContainerRef.current = element?.closest(
          '.astryx-layout-content',
        ) as HTMLElement | null;
      }}
    >
      {outlineItems.length === 1 ? (
        content
      ) : (
        <Grid columnGap={6} xstyle={styles.pageLayout}>
          {content}
          <VStack xstyle={styles.outlineRail}>
            <Outline
              items={outlineItems}
              label="On this page"
              scrollContainerRef={scrollContainerRef}
            />
          </VStack>
        </Grid>
      )}
    </VStack>
  );
}
