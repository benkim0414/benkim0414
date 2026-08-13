import { useMemo, useState, type ReactElement } from 'react';
import {
  CommandPalette,
  CommandPaletteInput,
} from '@astryxdesign/core/CommandPalette';
import { Banner } from '@astryxdesign/core/Banner';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { TopNav } from '@astryxdesign/core/TopNav';
import { createStaticSource } from '@astryxdesign/core/Typeahead';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import { DoraCapabilityCard } from '../devops-capability-evidence/dora-capability-card';
import { doraCapabilityDescriptions } from '../devops-capability-evidence/dora-capability-card.evidence';
import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from '../devops-capability-evidence/devops-capability-evidence.data';
import {
  highlightedSkills as defaultHighlightedSkills,
  skills as defaultSkills,
} from './skill-list.data';
import { SkillCarousel } from './skill-carousel';
import type { Skill } from './skill-list.types';

interface SkillCommandAuxiliaryData {
  skill: Skill;
  group: 'Skills';
}

interface SkillCommandItem {
  id: string;
  label: string;
  auxiliaryData: SkillCommandAuxiliaryData;
}

export interface HomePageProps {
  skills?: readonly Skill[];
  highlightedSkills?: readonly Skill[];
  onSkillSelect?: (skill: Skill) => void;
}

export function HomePage({
  skills = defaultSkills,
  highlightedSkills = defaultHighlightedSkills,
  onSkillSelect,
}: HomePageProps): ReactElement {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string>();
  const skillCommandItems = useMemo<SkillCommandItem[]>(
    () =>
      skills.map((skill) => ({
        id: skill.id,
        label: skill.name,
        auxiliaryData: {
          skill,
          group: 'Skills',
        },
      })),
    [skills],
  );
  const skillSearchSource = useMemo(
    () =>
      createStaticSource(skillCommandItems, {
        keywords: (item) => [
          item.auxiliaryData.skill.description,
          ...item.auxiliaryData.skill.categories,
          ...item.auxiliaryData.skill.keywords,
        ],
      }),
    [skillCommandItems],
  );
  return (
    <div className="mx-auto flex h-dvh min-h-screen w-full max-w-md flex-col overflow-hidden">
      <TopNav
        className="shrink-0 bg-[var(--color-background-surface)]"
        endContent={
          <IconButton
            icon={<Icon color="inherit" icon="search" size="sm" />}
            label="Search skills"
            size="sm"
            variant="ghost"
            onClick={() => setIsSearchOpen(true)}
          />
        }
        label="Mobile navigation"
      />
      <VisuallyHidden as="h1" id="home-page-title">
        Home
      </VisuallyHidden>
      <CommandPalette
        isOpen={isSearchOpen}
        input={
          <CommandPaletteInput
            aria-label="Search skills"
            placeholder="Search skills"
          />
        }
        label="Search skills"
        maxHeight="min(80vh, 480px)"
        searchSource={skillSearchSource}
        width="min(calc(100vw - 32px), 448px)"
        emptyBootstrapText="No skills"
        emptySearchText="No skills"
        value={selectedSkillId}
        onOpenChange={setIsSearchOpen}
        onValueChange={(skillId) => {
          setSelectedSkillId(skillId);
          const selectedSkill = skillCommandItems.find(
            (item) => item.id === skillId,
          )?.auxiliaryData.skill;

          if (selectedSkill) {
            onSkillSelect?.(selectedSkill);
          }
        }}
      />
      <VStack
        className="shrink-0 bg-[var(--color-background-surface)]"
        gap={3}
        paddingBlock={4}
      >
        <VStack paddingInline={4}>
          <Text as="h2" type="body" weight="bold">
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
          <Button
            href="/skills"
            label="Show all"
            size="sm"
            variant="ghost"
          />
        </HStack>
      </VStack>
      <VStack
        aria-labelledby="home-page-title"
        as="main"
        className="min-h-0 flex-1"
        gap={3}
        isScrollable
        paddingBlock={4}
        paddingInline={4}
      >
        <Text as="h2" type="body" weight="bold">
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
    </div>
  );
}
