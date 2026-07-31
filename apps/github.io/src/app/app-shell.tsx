import { useMemo, useState } from 'react';
import { Theme } from '@astryxdesign/core';
import {
  CommandPalette,
  CommandPaletteInput,
} from '@astryxdesign/core/CommandPalette';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { TopNav } from '@astryxdesign/core/TopNav';
import { createStaticSource } from '@astryxdesign/core/Typeahead';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { MobileSkillsPage } from './skills/mobile-skills-page';
import { skills } from './skills/skill-list.data';
import type { Skill } from './skills/skill-list.types';

interface SkillCommandAuxiliaryData {
  skill: Skill;
  group: 'Skills';
}

interface SkillCommandItem {
  id: string;
  label: string;
  auxiliaryData: SkillCommandAuxiliaryData;
}

export function AppShell() {
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
    [],
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

  return (
    <Theme theme={neutralTheme}>
      <div className="mx-auto min-h-screen w-full max-w-md">
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

          <MobileSkillsPage skills={visibleSkills} />
        </main>
      </div>
    </Theme>
  );
}
