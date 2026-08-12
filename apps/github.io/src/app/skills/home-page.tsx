import { useMemo, useState, type ReactElement } from 'react';
import {
  CommandPalette,
  CommandPaletteInput,
} from '@astryxdesign/core/CommandPalette';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { VStack } from '@astryxdesign/core/Layout';
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
}

export function HomePage({
  skills = defaultSkills,
  highlightedSkills = defaultHighlightedSkills,
}: HomePageProps): ReactElement {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
        onOpenChange={setIsSearchOpen}
      />
      <VStack
        className="shrink-0 bg-[var(--color-background-surface)]"
        gap={3}
        paddingBlock={4}
      >
        <div className="px-4">
          <Text as="h2" type="body" weight="bold">
            Top skills
          </Text>
        </div>
        <SkillCarousel
          ariaLabel="Highlighted skills"
          emptyMessage="No highlighted skills have been supplied."
          padding={4}
          skills={highlightedSkills}
          variant="compact"
        />
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
          All skills
        </Text>
        <SkillCardList heading="All skills" skills={skills} variant="compact" />
      </VStack>
    </div>
  );
}
