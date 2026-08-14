import { Heading } from '@astryxdesign/core/Heading';
import { LayoutContent, VStack } from '@astryxdesign/core/Layout';
import { Link } from '@astryxdesign/core/Link';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

const styles = stylex.create({
  page: {
    width: '100%',
    maxWidth: `calc(${spacingVars['--spacing-12']} * 14)`,
    marginInline: 'auto',
  },
});

export interface NotFoundPageProps {
  isFullWidth?: boolean;
  recoveryDestination?: 'home' | 'skills';
}

export function NotFoundPage({
  isFullWidth = false,
  recoveryDestination = 'skills',
}: NotFoundPageProps): ReactElement {
  const recoveryLink =
    recoveryDestination === 'home'
      ? { href: '/', label: 'Back home' }
      : { href: '/skills', label: 'Back to Skills' };
  const content = (
    <>
      <Heading id="not-found-title" level={1}>
        Skill not found
      </Heading>
      <Text as="p" type="body" color="secondary">
        The requested skill does not exist.
      </Text>
      <Link href={recoveryLink.href} isStandalone>
        {recoveryLink.label}
      </Link>
    </>
  );

  if (isFullWidth) {
    return (
      <LayoutContent
        aria-labelledby="not-found-title"
        data-layout="full-width"
        data-testid="not-found-page"
        padding={0}
        role="main"
      >
        <VStack gap={3} hAlign="start" paddingBlock={6} paddingInline={4}>
          {content}
        </VStack>
      </LayoutContent>
    );
  }

  return (
    <VStack
      as="main"
      aria-labelledby="not-found-title"
      data-layout="standalone"
      data-testid="not-found-page"
      gap={3}
      hAlign="start"
      paddingBlock={6}
      paddingInline={4}
      xstyle={styles.page}
    >
      {content}
    </VStack>
  );
}
