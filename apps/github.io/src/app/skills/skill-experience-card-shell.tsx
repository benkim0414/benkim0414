import { Card } from '@astryxdesign/core/Card';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Heading } from '@astryxdesign/core/Heading';
import { Item } from '@astryxdesign/core/Item';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { LinkProvider } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { useState, type ReactElement, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { CountBadge } from '../count-badge';
import { shouldStartCollapsibleExpanded } from '../responsive-collapsible';
import { RouterLink } from '../router-link';

export interface SkillExperienceCardShellProps {
  readonly appearance?: 'card' | 'plain';
  readonly anchorId?: string;
  readonly children: ReactNode;
  readonly href?: string;
  readonly outcomeCount: number;
  readonly skillCount: number;
  readonly summary: string;
  readonly title: string;
}

interface InspectorExperienceItemProps {
  readonly href: string;
  readonly summary: string;
  readonly title: string;
}

function InspectorExperienceItem({
  href,
  summary,
  title,
}: InspectorExperienceItemProps): ReactElement {
  const navigate = useNavigate();

  return (
    <LinkProvider component={RouterLink}>
      <Item
        align="center"
        description={summary}
        href={href}
        label={title}
        labelLines={2}
        onClick={() => navigate(href)}
      />
    </LinkProvider>
  );
}

export function SkillExperienceCardShell({
  appearance = 'card',
  anchorId,
  children,
  href,
  outcomeCount,
  skillCount,
  summary,
  title,
}: SkillExperienceCardShellProps): ReactElement {
  const hasDetails = outcomeCount > 0 || skillCount > 0;
  const isCollapsible = appearance === 'card';
  const [isOpen, setIsOpen] = useState(shouldStartCollapsibleExpanded);

  const content = (
    <VStack gap={3}>
      <VStack gap={1}>
        <Heading level={3}>{title}</Heading>
        <Text as="p" type="body">
          {summary}
        </Text>
      </VStack>

      {!isCollapsible && hasDetails ? (
        <HStack gap={2} wrap="wrap" vAlign="center">
          {outcomeCount > 0 ? (
            <>
              <Text type="supporting" color="secondary">
                Highlights
              </Text>
              <CountBadge count={outcomeCount} />
            </>
          ) : null}
          {skillCount > 0 ? (
            <>
              <Text type="supporting" color="secondary">
                Relevant skills
              </Text>
              <CountBadge count={skillCount} />
            </>
          ) : null}
        </HStack>
      ) : null}

      {isCollapsible && hasDetails ? (
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
  );

  if (appearance === 'card') {
    return (
      <Card id={anchorId} padding={4} width="100%">
        {content}
      </Card>
    );
  }

  return href ? (
    <InspectorExperienceItem
      href={href}
      summary={summary}
      title={title}
    />
  ) : (
    content
  );
}
