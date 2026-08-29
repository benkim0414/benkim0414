import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  CommandPalette,
  CommandPaletteInput,
} from '@astryxdesign/core/CommandPalette';
import { HomeModernIcon } from '@heroicons/react/24/outline';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Layout, LayoutContent, LayoutHeader } from '@astryxdesign/core/Layout';
import { MobileNav } from '@astryxdesign/core/MobileNav';
import { SideNavItem } from '@astryxdesign/core/SideNav';
import { TopNav } from '@astryxdesign/core/TopNav';
import { siGithub } from 'simple-icons';
import {
  colorVars,
  fontWeightVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import { createStaticSource } from '@astryxdesign/core/Typeahead';
import * as stylex from '@stylexjs/stylex';

import type { GlobalSearchResult } from './global-search/global-search.types';
import { createGlobalSearchResults } from './global-search/global-search-results';
import { kubernetesCertifications } from './certifications/kubernetes-certifications.data';
import { sampleProjects } from './projects/project-list.data';
import { skills } from './skills/skill-list.data';
import { GlobalNavigationFooter } from './global-navigation-footer';

interface GlobalSearchCommandItem extends GlobalSearchResult {
  readonly auxiliaryData: {
    readonly group: string;
  };
}

const HOME_NAVIGATION_ICON_COLOR = 'var(--color-icon-blue)';
const GITHUB_PROFILE_URL = 'https://github.com/benkim0414';
const SEARCH_LABEL = 'Search';

function GitHubIcon(): ReactElement {
  return (
    <svg
      aria-hidden
      fill="currentColor"
      height={16}
      viewBox="0 0 24 24"
      width={16}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={siGithub.path} />
    </svg>
  );
}

const styles = stylex.create({
  frame: {
    width: '100%',
    height: '100dvh',
    overflow: 'hidden',
  },
  homeNavigationLink: {
    color: colorVars['--color-icon-blue'],
  },
  selectedHomeNavigationLink: {
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
      ':active': colorVars['--color-overlay-pressed'],
    },
    fontWeight: fontWeightVars['--font-weight-medium'],
  },
});

export function GlobalNavigationLayout(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string>();
  const results = useMemo(
    () =>
      createGlobalSearchResults({
        certifications: Object.values(kubernetesCertifications),
        projects: sampleProjects,
        skills,
      }),
    [],
  );
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

  useLayoutEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <>
      <MobileNav
        isOpen={isNavigationOpen}
        label="Navigation"
        side="end"
        onOpenChange={setIsNavigationOpen}>
        <SideNavItem
          href="/skills"
          isSelected={
            location.pathname === '/skills' ||
            location.pathname.startsWith('/skills/')
          }
          label="Skills"
          onClick={() => setIsNavigationOpen(false)}
        />
        <SideNavItem
          href="/roadmap"
          isSelected={location.pathname === '/roadmap'}
          label="Roadmap"
          onClick={() => setIsNavigationOpen(false)}
        />
      </MobileNav>
      <CommandPalette
        emptyBootstrapText="No results"
        emptySearchText="No results"
        input={
          <CommandPaletteInput
            aria-label={SEARCH_LABEL}
            placeholder="Search..."
          />
        }
        isOpen={isSearchOpen}
        label={SEARCH_LABEL}
        maxHeight="min(80vh, 480px)"
        searchSource={searchSource}
        value={selectedResultId}
        width="min(calc(100vw - 32px), 448px)"
        onOpenChange={setIsSearchOpen}
        onValueChange={(resultId) => {
          setSelectedResultId(resultId);
          const result = resultById.get(resultId);

          if (result) {
            if (isExternalHref(result.href)) {
              window.open(result.href, '_blank', 'noopener,noreferrer');
            } else {
              navigate(result.href);
            }
          }
        }}
      />
      <Layout
        content={
          <LayoutContent ref={contentRef} padding={0}>
            <Outlet />
            <GlobalNavigationFooter />
          </LayoutContent>
        }
        header={
          <LayoutHeader padding={0}>
            <TopNav
              startContent={
                <IconButton
                  aria-current={
                    location.pathname === '/' ? 'page' : undefined
                  }
                  href="/"
                  icon={
                    <HomeModernIcon
                      aria-hidden
                      color={HOME_NAVIGATION_ICON_COLOR}
                      height={16}
                      width={16}
                    />
                  }
                  label="Home"
                  size="sm"
                  tooltip="Home"
                  variant="ghost"
                  xstyle={[
                    location.pathname === '/'
                      ? styles.selectedHomeNavigationLink
                      : undefined,
                    styles.homeNavigationLink,
                  ]}
                />
              }
              endContent={
                <>
                  <IconButton
                    icon={<Icon color="inherit" icon="menu" size="sm" />}
                    label="Navigation"
                    size="sm"
                    tooltip="Navigation"
                    variant="ghost"
                    onClick={() => setIsNavigationOpen(true)}
                  />
                  <IconButton
                    icon={<Icon color="inherit" icon="search" size="sm" />}
                    label={SEARCH_LABEL}
                    size="sm"
                    tooltip="Search"
                    variant="ghost"
                    onClick={() => setIsSearchOpen(true)}
                  />
                  <IconButton
                    as="a"
                    href={GITHUB_PROFILE_URL}
                    icon={<GitHubIcon />}
                    label="GitHub"
                    size="sm"
                    tooltip="GitHub"
                    variant="ghost"
                  />
                </>
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

function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}
