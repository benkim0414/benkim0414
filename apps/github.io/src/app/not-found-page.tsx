import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/Layout';
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
}

export function NotFoundPage({
  isFullWidth = false,
}: NotFoundPageProps): ReactElement {
  return (
    <VStack
      as="main"
      data-layout={isFullWidth ? 'full-width' : 'standalone'}
      data-testid="not-found-page"
      gap={3}
      hAlign="start"
      paddingBlock={6}
      paddingInline={4}
      xstyle={isFullWidth ? undefined : styles.page}
    >
      <Heading level={1}>Skill not found</Heading>
      <Text as="p" type="body" color="secondary">
        The requested skill does not exist.
      </Text>
      <Link href="/" isStandalone>
        Back to Skills
      </Link>
    </VStack>
  );
}
