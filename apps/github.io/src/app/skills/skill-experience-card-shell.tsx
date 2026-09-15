import { Card } from '@astryxdesign/core/Card';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Heading } from '@astryxdesign/core/Heading';
import { Item } from '@astryxdesign/core/Item';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { LinkProvider } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { useState, type ReactElement, type ReactNode } from 'react';
import { useInRouterContext } from 'react-router-dom';

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
  readonly outcomeCount: number;
  readonly skillCount: number;
  readonly title: string;
}

function InspectorExperienceItem({
  href,
  outcomeCount,
  skillCount,
  title,
}: InspectorExperienceItemProps): ReactElement {
  const isRouterContext = useInRouterContext();
  const description = getInspectorDescription(outcomeCount, skillCount);

  if (!isRouterContext) {
    return (
      <Item
        align="center"
        description={description}
        href={href}
        label={title}
        labelLines={2}
      />
    );
  }

  return (
    <RoutedInspectorExperienceItem
      description={description}
      href={href}
      title={title}
    />
  );
}

function RoutedInspectorExperienceItem({
  description,
  href,
  title,
}: Pick<InspectorExperienceItemProps, 'href' | 'title'> & {
  readonly description?: string;
}): ReactElement {
  return (
    <LinkProvider component={RouterLink}>
      <Item
        align="center"
        description={description}
        href={href}
        label={title}
        labelLines={2}
      />
    </LinkProvider>
  );
}

function getInspectorDescription(
  outcomeCount: number,
  skillCount: number,
): string | undefined {
  const descriptions = [
    outcomeCount > 0 ? `${outcomeCount} highlights` : null,
    skillCount > 0 ? `${skillCount} relevant skills` : null,
  ].filter((description): description is string => description != null);

  return descriptions.length > 0 ? descriptions.join(' · ') : undefined;
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
      <Card id={anchorId} padding={4} tabIndex={anchorId ? -1 : undefined} width="100%">
        {content}
      </Card>
    );
  }

  return href ? (
    <InspectorExperienceItem
      href={href}
      outcomeCount={outcomeCount}
      skillCount={skillCount}
      title={title}
    />
  ) : (
    content
  );
}
