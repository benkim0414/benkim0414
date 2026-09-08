import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/Layout';
import type { ReactElement } from 'react';

import { DevOpsRoadmap } from './devops-roadmap';

const ROADMAP_DESCRIPTION =
  'This roadmap presents my DevOps capabilities using the learning path published by roadmap.sh as a reference framework. Each topic highlights relevant skills and certifications, providing a structured overview of my experience across the DevOps discipline.';

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
        title="About this roadmap"
      />
      <DevOpsRoadmap />
    </VStack>
  );
}
