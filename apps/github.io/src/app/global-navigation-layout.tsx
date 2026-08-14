import { useMemo, useState, type ReactElement } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  CommandPalette,
  CommandPaletteInput,
} from '@astryxdesign/core/CommandPalette';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Layout, LayoutHeader } from '@astryxdesign/core/Layout';
import { TopNav, TopNavItem } from '@astryxdesign/core/TopNav';
import { createStaticSource } from '@astryxdesign/core/Typeahead';
import * as stylex from '@stylexjs/stylex';

import type { GlobalSearchResult } from './global-search/global-search.types';
import { createSkillSearchResults } from './global-search/skill-search-results';
import { skills } from './skills/skill-list.data';

interface GlobalSearchCommandItem extends GlobalSearchResult {
  readonly auxiliaryData: {
    readonly group: string;
  };
}

const styles = stylex.create({
  frame: {
    width: '100%',
    height: '100dvh',
    overflow: 'hidden',
  },
});

export function GlobalNavigationLayout(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string>();
  const results = useMemo(() => createSkillSearchResults(skills), []);
  const resultById = useMemo(
    () => new Map(results.map((result) => [result.id, result])),
    [results],
  );
  const searchItems = useMemo<GlobalSearchCommandItem[]>(
    () =>
      results.map((result) => ({
        ...result,
        auxiliaryData: { group: result.group },
      })),
    [results],
  );
  const searchSource = useMemo(
    () =>
      createStaticSource(searchItems, {
        keywords: (result) => [...result.keywords],
      }),
    [searchItems],
  );

  return (
    <>
      <CommandPalette
        emptyBootstrapText="No skills"
        emptySearchText="No skills"
        input={
          <CommandPaletteInput
            aria-label="Search skills"
            placeholder="Search skills"
          />
        }
        isOpen={isSearchOpen}
        label="Search skills"
        maxHeight="min(80vh, 480px)"
        searchSource={searchSource}
        value={selectedResultId}
        width="min(calc(100vw - 32px), 448px)"
        onOpenChange={setIsSearchOpen}
        onValueChange={(resultId) => {
          setSelectedResultId(resultId);
          const result = resultById.get(resultId);

          if (result) {
            navigate(result.href);
          }
        }}
      />
      <Layout
        content={<Outlet />}
        header={
          <LayoutHeader padding={0}>
            <TopNav
              centerContent={
                <>
                  <TopNavItem
                    href="/"
                    isSelected={location.pathname === '/'}
                    label="Home"
                  />
                  <TopNavItem
                    href="/roadmap"
                    isSelected={location.pathname === '/roadmap'}
                    label="Roadmap"
                  />
                  <TopNavItem
                    href="/skills"
                    isSelected={
                      location.pathname === '/skills' ||
                      location.pathname.startsWith('/skills/')
                    }
                    label="Skills"
                  />
                </>
              }
              endContent={
                <IconButton
                  icon={<Icon color="inherit" icon="search" size="sm" />}
                  label="Search skills"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsSearchOpen(true)}
                />
              }
              label="Global navigation"
            />
          </LayoutHeader>
        }
        height="fill"
        xstyle={styles.frame}
      />
    </>
  );
}
