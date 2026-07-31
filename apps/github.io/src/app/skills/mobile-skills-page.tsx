import { useMemo, useState, type ReactElement } from 'react';
import {
  CommandPalette,
  CommandPaletteInput,
} from '@astryxdesign/core/CommandPalette';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { VStack } from '@astryxdesign/core/Layout';
import { TopNav } from '@astryxdesign/core/TopNav';
import { createStaticSource } from '@astryxdesign/core/Typeahead';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import {
  highlightedSkills as defaultHighlightedSkills,
  skills as defaultSkills,
} from './skill-list.data';
import { SkillCarousel } from './skill-carousel';
import { SkillList } from './skill-list';
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
    <div className="mx-auto h-dvh min-h-screen w-full max-w-md overflow-y-auto">
      <TopNav
        className="sticky top-0 z-10 bg-[var(--color-background-surface)]"
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
        searchSource={skillSearchSource}
        value={selectedSkillId}
        width="calc(100vw - 32px)"
        emptyBootstrapText="No skills"
        emptySearchText="No skills"
        onOpenChange={setIsSearchOpen}
        onValueChange={setSelectedSkillId}
      />
      <main
        aria-labelledby="skills-page-title"
        className="w-full px-4 py-4"
      >
        <VisuallyHidden as="h1" id="skills-page-title">
          Skills
        </VisuallyHidden>

        <VStack gap={4}>
          <SkillCarousel
            ariaLabel="Highlighted skills"
            emptyMessage="No highlighted skills have been supplied."
            skills={highlightedSkills}
            variant="compact"
          />

          <SkillList
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
