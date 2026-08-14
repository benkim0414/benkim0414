import type { ReactElement } from 'react';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import { DoraCapabilityCard } from '../devops-capability-evidence/dora-capability-card';
import { doraCapabilityDescriptions } from '../devops-capability-evidence/dora-capability-card.evidence';
import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from '../devops-capability-evidence/devops-capability-evidence.data';
import { highlightedSkills as defaultHighlightedSkills } from './skill-list.data';
import { SkillCarousel } from './skill-carousel';
import type { Skill } from './skill-list.types';

export interface HomePageProps {
  highlightedSkills?: readonly Skill[];
}

export function HomePage({
  highlightedSkills = defaultHighlightedSkills,
}: HomePageProps): ReactElement {
  return (
    <VStack aria-label="Home" as="main">
      <VisuallyHidden as="h1" id="home-page-title">
        Home
      </VisuallyHidden>
      <VStack gap={3} paddingBlock={4}>
        <VStack paddingInline={4}>
          <Text as="h2" id="top-skills-title" type="body" weight="bold">
            Top skills
          </Text>
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
        <Text as="h2" id="dora-capabilities-title" type="body" weight="bold">
          DORA capabilities
        </Text>
        <Banner
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
        {doraCapabilityDefinitions.map((capability) => (
          <DoraCapabilityCard
            capability={capability}
            description={doraCapabilityDescriptions[capability.key]}
            evidence={devOpsCapabilityEvidenceItems}
            key={capability.key}
            scores={curatedDevOpsCapabilityRadarScores}
          />
        ))}
      </VStack>
    </VStack>
  );
}
