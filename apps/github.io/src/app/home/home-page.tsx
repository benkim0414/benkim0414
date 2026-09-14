import type { ReactElement } from 'react';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';

import { DoraCapabilityCard } from '../devops-capability-evidence/dora-capability-card';
import { doraCapabilityDescriptions } from '../devops-capability-evidence/dora-capability-card.evidence';
import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from '../devops-capability-evidence/devops-capability-evidence.data';
import { highlightedSkills as defaultHighlightedSkills } from '../skills/skill-list.data';
import { SkillCarousel } from '../skills/skill-carousel';
import { HomeGreeting } from './home-greeting';
import { DoraCapabilityMasonry } from './dora-capability-masonry';
import type { Skill } from '../skills/skill-list.types';

export interface HomePageProps {
  highlightedSkills?: readonly Skill[];
}

export function HomePage({
  highlightedSkills = defaultHighlightedSkills,
}: HomePageProps): ReactElement {
  return (
    <VStack aria-label="Home" as="main">
      <VStack paddingBlock={4} paddingInline={4}>
        <Heading id="home-page-title" level={1}>
          DevOps engineering practice
        </Heading>
      </VStack>
      <HomeGreeting />
      <VStack gap={3} paddingBlock={4}>
        <VStack paddingInline={4}>
          <Heading id="top-skills-title" level={2}>
            Top skills
          </Heading>
        </VStack>
        <SkillCarousel
          ariaLabel="Highlighted skills"
          emptyMessage="No highlighted skills have been supplied."
          padding={4}
          skills={highlightedSkills}
          variant="compact"
        />
        <HStack hAlign="end" paddingInline={4}>
          <Button href="/skills" label="Show all" size="sm" variant="ghost" />
        </HStack>
      </VStack>
      <VStack gap={3} paddingBlock={4} paddingInline={4}>
        <Heading id="dora-capabilities-title" level={2}>
          DORA capabilities
        </Heading>
        <Banner
          data-testid="dora-capabilities-banner"
          description="DORA capabilities are technical, process, and cultural practices associated with stronger software delivery and organizational performance. Each card connects a capability to supporting experience, certifications, and technical skills."
          endContent={
            <Button
              href="https://dora.dev/capabilities/"
              label="Learn more"
              rel="noopener noreferrer"
              target="_blank"
              variant="secondary"
            />
          }
          status="info"
          title="About DORA capabilities"
        />
        <DoraCapabilityMasonry>
          {doraCapabilityDefinitions.map((capability) => (
            <DoraCapabilityCard
              capability={capability}
              description={doraCapabilityDescriptions[capability.key]}
              evidence={devOpsCapabilityEvidenceItems}
              key={capability.key}
              scores={curatedDevOpsCapabilityRadarScores}
            />
          ))}
        </DoraCapabilityMasonry>
      </VStack>
    </VStack>
  );
}
