import { Card } from '@astryxdesign/core/Card';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { useState, type ReactElement, type ReactNode } from 'react';

import { CountBadge } from '../count-badge';
import { COMPACT_SURFACE_QUERY } from './skill-table-responsive';

export interface SkillExperienceCardShellProps {
  readonly children: ReactNode;
  readonly outcomeCount: number;
  readonly skillCount: number;
  readonly summary: string;
  readonly title: string;
}

export function SkillExperienceCardShell({
  children,
  outcomeCount,
  skillCount,
  summary,
  title,
}: SkillExperienceCardShellProps): ReactElement {
  const hasDetails = outcomeCount > 0 || skillCount > 0;
  const [isOpen, setIsOpen] = useState(shouldStartExpanded);

  return (
    <Card padding={4} width="100%">
      <VStack gap={3}>
        <VStack gap={1}>
          <Heading level={3}>{title}</Heading>
          <Text as="p" type="body">
            {summary}
          </Text>
        </VStack>

        {hasDetails ? (
          <Collapsible
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            trigger={
              <HStack gap={2} vAlign="center">
                {outcomeCount > 0 ? (
                  <>
                    <Text type="supporting" color="secondary">
                      Highlights
                    </Text>
                    <CountBadge count={outcomeCount} />
                  </>
                ) : null}
                {skillCount > 0 && (!isOpen || outcomeCount === 0) ? (
                  <>
                    <Text type="supporting" color="secondary">
                      Relevant skills
                    </Text>
                    <CountBadge count={skillCount} />
                  </>
                ) : null}
              </HStack>
            }
          >
            <VStack gap={3}>{children}</VStack>
          </Collapsible>
        ) : null}
      </VStack>
    </Card>
  );
}

function shouldStartExpanded(): boolean {
  return (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function' ||
    !window.matchMedia(COMPACT_SURFACE_QUERY).matches
  );
}
