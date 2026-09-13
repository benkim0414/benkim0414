import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { Link } from '@astryxdesign/core/Link';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import type { ReactElement } from 'react';

import { DevOpsRoadmapStepper } from './devops-roadmap-stepper';

const ROADMAP_DESCRIPTION =
  'roadmap.sh provides community-curated roadmaps, study plans, and resources for developers, including a dedicated DevOps roadmap.';

export function RoadmapPage(): ReactElement {
  return (
    <VStack
      as="main"
      gap={4}
      minHeight="100vh"
      paddingBlock={4}
      paddingInline={4}
      width="100%"
    >
      <Heading level={2}>DevOps roadmap</Heading>
      <Text as="p" type="body" color="secondary">
        This page maps my DevOps capabilities to the topics covered by the{' '}
        <Link
          href="https://roadmap.sh/"
          rel="noopener noreferrer"
          target="_blank"
        >
          roadmap.sh
        </Link>{' '}
        DevOps roadmap. Each topic includes relevant skills, certifications,
        and evidence from my professional experience.
      </Text>
      <Text as="p" type="body" color="secondary">
        Explore the topics to see which areas I have covered and how my
        experience aligns with the roadmap.
      </Text>
      <Banner
        description={ROADMAP_DESCRIPTION}
        endContent={
          <Button
            href="https://roadmap.sh/devops"
            label="Learn more"
            rel="noopener noreferrer"
            target="_blank"
            variant="secondary"
          />
        }
        status="info"
        title="About roadmap.sh"
      />
      <DevOpsRoadmapStepper />
    </VStack>
  );
}
