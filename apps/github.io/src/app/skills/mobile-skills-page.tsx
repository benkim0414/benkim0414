import { useMemo, useState, type ReactElement } from 'react';
import {
  CommandPalette,
  CommandPaletteInput,
} from '@astryxdesign/core/CommandPalette';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { TopNav } from '@astryxdesign/core/TopNav';
import { createStaticSource } from '@astryxdesign/core/Typeahead';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import {
  highlightedSkills as defaultHighlightedSkills,
  skills as defaultSkills,
} from './skill-list.data';
import { SkillCardList } from './skill-card-list';
import { SkillCarousel } from './skill-carousel';
import { SkillAvatar } from './skill-avatar';
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

export interface MobileSkillsPageProps {
  skills?: readonly Skill[];
  highlightedSkills?: readonly Skill[];
}

function SkillCommandResult({ skill }: { skill: Skill }): ReactElement {
  return (
    <HStack gap={2} vAlign="center">
      <SkillAvatar skill={skill} />
      <Text type="body">{skill.name}</Text>
    </HStack>
  );
}

export function MobileSkillsPage({
  skills = defaultSkills,
  highlightedSkills = defaultHighlightedSkills,
}: MobileSkillsPageProps): ReactElement {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
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
  const visibleSkills =
    selectedSkillId.length === 0
      ? skills
      : skills.filter((skill) => skill.id === selectedSkillId);
  const listEmptyMessage =
    skills.length === 0
      ? 'No skills have been supplied.'
      : 'No skills match your search.';

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
        renderItem={(item) => (
          <SkillCommandResult skill={item.auxiliaryData.skill} />
        )}
        searchSource={skillSearchSource}
        value={selectedSkillId}
        width="min(calc(100vw - 32px), 448px)"
        emptyBootstrapText="No skills"
        emptySearchText="No skills"
        onOpenChange={setIsSearchOpen}
        onValueChange={setSelectedSkillId}
      />
      <div className="shrink-0 bg-[var(--color-background-surface)] px-4 pb-4">
        <SkillCarousel
          ariaLabel="Highlighted skills"
          emptyMessage="No highlighted skills have been supplied."
          skills={highlightedSkills}
          variant="compact"
        />
      </div>
      <main
        aria-labelledby="skills-page-title"
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4"
      >
        <VisuallyHidden as="h1" id="skills-page-title">
          Skills
        </VisuallyHidden>

        <VStack gap={3}>
          <SkillCardList
            emptyMessage={listEmptyMessage}
            heading="Skills"
            skills={visibleSkills}
            variant="compact"
          />
        </VStack>
      </main>
    </div>
  );
}
