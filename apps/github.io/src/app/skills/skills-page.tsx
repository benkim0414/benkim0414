import { Button } from '@astryxdesign/core/Button';
import {
  CheckboxList,
  CheckboxListItem,
} from '@astryxdesign/core/CheckboxList';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { StackItem, VStack } from '@astryxdesign/core/Layout';
import { Popover } from '@astryxdesign/core/Popover';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Toolbar } from '@astryxdesign/core/Toolbar';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { useMediaQuery } from '@astryxdesign/core/hooks';

import { SkillCard } from './skill-card';
import { resolveSkillDetail } from './skill-detail-resolver';
import { skillDetailSources } from './skill-detail-sources';
import { filterSkills } from './skill-filter';
import { skills as defaultSkills } from './skill-list.data';
import {
  skillCategories,
  type Skill,
  type SkillCategory,
} from './skill-list.types';
import { SkillTableDetailLayout } from './skill-table-detail-layout';
import type { SkillRowActivation } from './skill-table';
import { TABLE_QUERY } from './skill-table-responsive';

export interface SkillsPageProps {
  skills?: readonly Skill[];
}

export function SkillsPage({
  skills = defaultSkills,
}: SkillsPageProps): ReactElement {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<SkillCategory[]>(
    [],
  );
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const activeRowRef = useRef<HTMLTableRowElement | null>(null);
  const isTable = useMediaQuery(TABLE_QUERY);
  const availableCategories = skillCategories.filter((category) =>
    skills.some((skill) => skill.categories.includes(category)),
  );
  const filteredSkills = useMemo(
    () => filterSkills(skills, query, selectedCategories),
    [query, selectedCategories, skills],
  );
  const sortedSkills = [...filteredSkills].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  const activeResolution =
    activeSkillId == null
      ? null
      : resolveSkillDetail(activeSkillId, skillDetailSources);
  const activeDetail =
    activeResolution?.status === 'found' ? activeResolution.value : null;

  useEffect(() => {
    if (
      activeSkillId != null &&
      (!isTable ||
        !filteredSkills.some((skill) => skill.id === activeSkillId) ||
        activeResolution?.status === 'not-found')
    ) {
      activeRowRef.current = null;
      setActiveSkillId(null);
    }
  }, [activeResolution?.status, activeSkillId, filteredSkills, isTable]);

  const handleSkillActivate = ({ skillId, row }: SkillRowActivation) => {
    activeRowRef.current = row;
    setActiveSkillId(skillId);
  };
  const closeActiveSkill = () => {
    setActiveSkillId(null);
    // Keep the row available until Astryx completes the sheet's exit motion.
  };

  return (
    <VStack
      aria-labelledby="skills-page-title"
      as="main"
      gap={3}
      height={isTable ? '100%' : undefined}
      padding={4}
    >
      <VisuallyHidden as="h1" id="skills-page-title">
        Skills
      </VisuallyHidden>
      <Heading level={2}>Skills</Heading>
      {isTable ? (
        <StackItem size="fill">
          <SkillTableDetailLayout
            activeDetail={activeDetail}
            activeSkillId={activeSkillId}
            finalFocusRef={activeRowRef}
            query={query}
            selectedCategories={selectedCategories}
            skills={skills}
            onClose={closeActiveSkill}
            onQueryChange={setQuery}
            onSelectedCategoriesChange={setSelectedCategories}
            onSkillActivate={handleSkillActivate}
          />
        </StackItem>
      ) : (
        <>
          <Toolbar
            endContent={
              <Popover
                alignment="end"
                content={
                  <VStack gap={3}>
                    <Heading level={3}>Filter skills</Heading>
                    <CheckboxList
                      density="compact"
                      isLabelHidden
                      label="Skill categories"
                      value={selectedCategories}
                      onChange={(values) =>
                        setSelectedCategories(values as SkillCategory[])
                      }
                    >
                      {availableCategories.map((category) => (
                        <CheckboxListItem
                          key={category}
                          label={category}
                          value={category}
                        />
                      ))}
                    </CheckboxList>
                    {selectedCategories.length > 0 ? (
                      <Button
                        label="Clear filters"
                        variant="ghost"
                        onClick={() => setSelectedCategories([])}
                      />
                    ) : null}
                  </VStack>
                }
                label="Filter skills"
              >
                <IconButton
                  icon={<Icon icon="funnel" size="sm" />}
                  label="Filter skills"
                  tooltip="Filter skills"
                  variant="ghost"
                />
              </Popover>
            }
            label="Skills catalog controls"
            startContent={
              <TextInput
                hasClear
                isLabelHidden
                label="Search skills"
                placeholder="Search skills"
                startIcon="search"
                value={query}
                onChange={setQuery}
              />
            }
            variant="muted"
          />
          <section aria-label="All skills">
            {sortedSkills.length === 0 ? (
              <EmptyState
                headingLevel={3}
                isCompact
                title={
                  skills.length === 0
                    ? 'No skills have been supplied.'
                    : 'No skills match your search or filters.'
                }
              />
            ) : (
              <VStack gap={3}>
                {sortedSkills.map((skill) => (
                  <SkillCard isFullWidth key={skill.id} skill={skill} />
                ))}
              </VStack>
            )}
          </section>
        </>
      )}
    </VStack>
  );
}
