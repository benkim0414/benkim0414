import { Button } from '@astryxdesign/core/Button';
import {
  CheckboxList,
  CheckboxListItem,
} from '@astryxdesign/core/CheckboxList';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { VStack } from '@astryxdesign/core/Layout';
import { Popover } from '@astryxdesign/core/Popover';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Toolbar } from '@astryxdesign/core/Toolbar';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { useMemo, useState, type ReactElement } from 'react';

import { SkillCard } from './skill-card';
import { skills as defaultSkills } from './skill-list.data';
import {
  skillCategories,
  type Skill,
  type SkillCategory,
} from './skill-list.types';
import { skillMatchesQuery } from './skill-search';

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
  const availableCategories = skillCategories.filter((category) =>
    skills.some((skill) => skill.categories.includes(category)),
  );
  const filteredSkills = useMemo(
    () =>
      skills.filter(
        (skill) =>
          skillMatchesQuery(skill, query) &&
          (selectedCategories.length === 0 ||
            selectedCategories.some((category) =>
              skill.categories.includes(category),
            )),
      ),
    [query, selectedCategories, skills],
  );
  const sortedSkills = [...filteredSkills].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  return (
    <VStack aria-labelledby="skills-page-title" as="main" gap={3} padding={4}>
      <VisuallyHidden as="h1" id="skills-page-title">
        Skills
      </VisuallyHidden>
      <Heading level={2}>Skills</Heading>
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
    </VStack>
  );
}
