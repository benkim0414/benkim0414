import { BreadcrumbItem, Breadcrumbs } from '@astryxdesign/core/Breadcrumbs';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { useEffect, useRef, type ReactElement } from 'react';

import { SkillDetailContent } from './skill-detail-content';
import type { ResolvedSkillDetail } from './skill-detail.types';

export interface SkillDetailPageProps {
  detail: ResolvedSkillDetail;
}

export function SkillDetailPage({
  detail,
}: SkillDetailPageProps): ReactElement {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [detail.skill.id]);

  return (
    <VStack
      aria-label="Skill detail"
      as="main"
      data-testid="skill-detail-content"
      gap={6}
      paddingBlock={6}
      paddingInline={4}
    >
      <Breadcrumbs label="Skill breadcrumb">
        <BreadcrumbItem href="/skills">Skills</BreadcrumbItem>
        <BreadcrumbItem isCurrent>{detail.skill.name}</BreadcrumbItem>
      </Breadcrumbs>

      <VStack gap={3} hAlign="start">
        <Heading ref={headingRef} level={1} tabIndex={-1}>
          {detail.skill.name}
        </Heading>
        <Text as="p" type="body" color="secondary">
          {detail.skill.description}
        </Text>
      </VStack>

      <SkillDetailContent detail={detail} />
    </VStack>
  );
}
