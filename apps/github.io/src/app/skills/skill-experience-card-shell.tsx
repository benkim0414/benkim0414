import { Card } from '@astryxdesign/core/Card';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import type { ReactElement, ReactNode } from 'react';

import { CountBadge } from '../count-badge';

const SMALL_VIEWPORT_QUERY = '(max-width: 640px)';

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
            defaultIsOpen={shouldStartExpanded()}
            trigger={
              <HStack gap={2} vAlign="center">
                <Text type="supporting" color="secondary">
                  Highlights
                </Text>
                <CountBadge count={outcomeCount} />
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
    !window.matchMedia(SMALL_VIEWPORT_QUERY).matches
  );
}
