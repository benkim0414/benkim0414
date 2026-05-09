import * as React from 'react';

import { skillCategories, skillLevels, skillsWithProjects } from '@/data/skills';

import {
  defaultSearchState,
  parseSearchParams,
  projectText,
  searchSkills,
  serializeSearchState,
  toggleFilter,
} from './search';

function initialSearchState() {
  if (typeof window === 'undefined') {
    return defaultSearchState;
  }

  return parseSearchParams(new URLSearchParams(window.location.search));
}

export function SkillSearchPanel() {
  const [searchState, setSearchState] = React.useState(initialSearchState);
  const results = searchSkills(searchState);

  React.useEffect(() => {
    const params = serializeSearchState(searchState);
    const queryString = params.toString();
    const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}`;

    window.history.replaceState(null, '', nextUrl);
  }, [searchState]);

  return (
    <section
      aria-labelledby="skill-search-heading"
      className="mx-auto max-w-6xl px-4 py-8"
    >
      <div className="mb-6 space-y-3">
        <h2 id="skill-search-heading" className="text-2xl font-semibold">
          Skills search
        </h2>
        <p className="text-sm text-muted-foreground">
          {results.length} of {skillsWithProjects.length} skills shown
        </p>
        <input
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Search skills"
          placeholder="Search skills, projects, tags, or usage"
          value={searchState.query}
          onChange={(event) =>
            setSearchState((current) => ({ ...current, query: event.target.value }))
          }
        />
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_1fr]">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Category</legend>
          <div className="flex flex-wrap gap-2">
            {skillCategories.map((category) => (
              <label
                key={category}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={searchState.categories.includes(category)}
                  onChange={() =>
                    setSearchState((current) => ({
                      ...current,
                      categories: toggleFilter(current.categories, category),
                    }))
                  }
                />
                {category}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Level</legend>
          <div className="flex flex-wrap gap-2">
            {Object.entries(skillLevels).map(([level, label]) => {
              const numericLevel = Number(level) as keyof typeof skillLevels;

              return (
                <label
                  key={level}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={searchState.levels.includes(numericLevel)}
                    onChange={() =>
                      setSearchState((current) => ({
                        ...current,
                        levels: toggleFilter(current.levels, numericLevel),
                      }))
                    }
                  />
                  {level}: {label}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="mt-8 grid gap-3">
        {results.length === 0 ? (
          <p className="rounded-md border border-border p-4 text-sm text-muted-foreground">
            No skills match your search.
          </p>
        ) : (
          results.map((skill) => (
            <article
              key={skill.id}
              data-testid="skill-card"
              className="rounded-md border border-border bg-card p-4 text-card-foreground"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{skill.name}</h3>
                  <p className="text-sm text-muted-foreground">{skill.summary}</p>
                </div>
                <span className="rounded-md bg-secondary px-2.5 py-1 text-sm text-secondary-foreground">
                  Level {skill.level}: {skillLevels[skill.level]}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md border border-border px-2 py-1 text-xs">
                  {skill.category}
                </span>
                {skill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm">{skill.usage}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Projects: {projectText(skill)}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
