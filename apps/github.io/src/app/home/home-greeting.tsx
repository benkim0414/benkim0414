import {
  useEffect,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
} from '@astryxdesign/core/Chat';
import { Avatar } from '@astryxdesign/core/Avatar';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Layout';
import { Link } from '@astryxdesign/core/Link';
import { Markdown } from '@astryxdesign/core/Markdown';
import { Text } from '@astryxdesign/core/Text';
import {
  colorVars,
  durationVars,
  easeVars,
} from '@astryxdesign/core/theme/tokens.stylex';

const greetingSessionKey = 'home-greeting-seen';
const messageDelays = [0, 450, 1_050] as const;
const doraCapabilitiesTargetId = 'dora-capabilities-title';

export interface HomeGreetingProps {
  isPreview?: boolean;
}

const receive = stylex.keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(var(--spacing-2))',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

const styles = stylex.create({
  greetingCard: {
    backgroundColor: colorVars['--color-background-surface'],
    borderWidth: 0,
  },
  receive: {
    animationDuration: durationVars['--duration-medium-min'],
    animationFillMode: 'both',
    animationName: receive,
    animationTimingFunction: easeVars['--ease-standard'],
  },
});

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function HomeGreeting({
  isPreview = false,
}: HomeGreetingProps): ReactElement {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [shouldAnimate] = useState(
    () =>
      !reducedMotion &&
      (isPreview || sessionStorage.getItem(greetingSessionKey) !== 'true'),
  );
  const [visibleMessageCount, setVisibleMessageCount] = useState(
    shouldAnimate ? 0 : 3,
  );
  const messageXStyle = reducedMotion ? undefined : styles.receive;
  const handleMarkdownLinkClick = (
    href: string,
    event: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ): false | void => {
    if (href !== `#${doraCapabilitiesTargetId}`) {
      return;
    }

    const doraCapabilities = document.getElementById(
      doraCapabilitiesTargetId,
    );

    if (!doraCapabilities) {
      return;
    }

    event.preventDefault();
    doraCapabilities.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    return false;
  };
  const GreetingMarkdownLink = ({
    href,
    children,
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <Link href={href} onClick={(event) => handleMarkdownLinkClick(href, event)}>
      {children}
    </Link>
  );

  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    if (!isPreview) {
      sessionStorage.setItem(greetingSessionKey, 'true');
    }
    const timers = messageDelays.map((delay, index) =>
      window.setTimeout(() => setVisibleMessageCount(index + 1), delay),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [shouldAnimate]);

  return (
    <VStack
      aria-label="Welcome message"
      as="section"
      paddingBlock={4}
      paddingInline={4}
      role="region"
    >
      <Card padding={0} variant="muted" width="100%" xstyle={styles.greetingCard}>
        <ChatMessageList density="balanced">
          <ChatMessage
            avatar={<Avatar name="Gunwoo Ben Kim" size="small" />}
            sender="assistant"
          >
            {visibleMessageCount >= 1 ? (
              <ChatMessageBubble
                group="first"
                name={
                  <Text color="secondary" type="supporting" weight="semibold">
                    Gunwoo Ben Kim
                  </Text>
                }
                xstyle={messageXStyle}
              >
                <Text>G&apos;day, mate 👋</Text>
              </ChatMessageBubble>
            ) : null}
            {visibleMessageCount >= 2 ? (
              <ChatMessageBubble group="middle" xstyle={messageXStyle}>
                <Text>
                  Welcome to my engineering practice. Browse the skills and
                  evidence behind my work.
                </Text>
              </ChatMessageBubble>
            ) : null}
            {visibleMessageCount >= 3 ? (
              <ChatMessageBubble group="last" xstyle={messageXStyle}>
                <Markdown
                  components={{ link: GreetingMarkdownLink }}
                  density="compact"
                >
                  {'See how I work and the capabilities I bring to delivery teams.\n\n- [Explore skills](/skills)\n- [View DORA capabilities](#dora-capabilities-title)'}
                </Markdown>
              </ChatMessageBubble>
            ) : null}
          </ChatMessage>
        </ChatMessageList>
      </Card>
    </VStack>
  );
}
