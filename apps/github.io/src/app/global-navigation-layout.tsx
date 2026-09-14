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
import { Divider } from '@astryxdesign/core/Divider';
import {
  HomeModernIcon,
  MoonIcon,
  SunIcon,
} from '@heroicons/react/24/outline';
import { Icon } from '@astryxdesign/core/Icon';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack } from '@astryxdesign/core/HStack';
import { Layout, LayoutContent, LayoutHeader } from '@astryxdesign/core/Layout';
import { MobileNav } from '@astryxdesign/core/MobileNav';
import { SideNavItem } from '@astryxdesign/core/SideNav';
import { TextInput } from '@astryxdesign/core/TextInput';
import { TopNav, TopNavItem } from '@astryxdesign/core/TopNav';
import { useMediaQuery } from '@astryxdesign/core/hooks';
import { siGithub } from 'simple-icons';
import {
  colorVars,
  fontWeightVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import { createStaticSource } from '@astryxdesign/core/Typeahead';
import * as stylex from '@stylexjs/stylex';

import type { GlobalSearchResult } from './global-search/global-search.types';
import { createGlobalSearchResults } from './global-search/global-search-results';
import { kubernetesCertifications } from './certifications/kubernetes-certifications.data';
import { sampleProjects } from './projects/project-list.data';
import { skills } from './skills/skill-list.data';
import { skillMatchesQuery } from './skills/skill-search';
import { GlobalNavigationFooter } from './global-navigation-footer';
import { useThemeMode } from './theme-mode';

interface GlobalSearchCommandItem extends GlobalSearchResult {
  readonly auxiliaryData: {
    readonly group: string;
  };
}

const HOME_NAVIGATION_ICON_COLOR = 'var(--color-icon-blue)';
const GITHUB_PROFILE_URL = 'https://github.com/benkim0414';
const SEARCH_LABEL = 'Search';
const DESKTOP_NAVIGATION_QUERY = '(min-width: 768px)';

function isSkillsRoute(pathname: string): boolean {
  return pathname === '/skills' || pathname.startsWith('/skills/');
}

function isRoadmapRoute(pathname: string): boolean {
  return pathname === '/roadmap';
}

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
  mobileNavigationDivider: {
    marginBlock: spacingVars['--spacing-2'],
  },
  mobileNavigationSearch: {
    marginBlockEnd: spacingVars['--spacing-2'],
  },
});

export function GlobalNavigationLayout(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktopNavigation = useMediaQuery(DESKTOP_NAVIGATION_QUERY);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  const [mobileSkillSearch, setMobileSkillSearch] = useState('');
  const [selectedResultId, setSelectedResultId] = useState<string>();
  const { mode, setMode } = useThemeMode();
  const themeToggleLabel =
    mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
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
  const mobileSkillLinks = skills.filter((skill) =>
    skillMatchesQuery(skill, mobileSkillSearch),
  );

  useLayoutEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const closeMobileNavigation = () => {
    setIsNavigationOpen(false);
    setMobileSkillSearch('');
  };

  return (
    <>
      <MobileNav
        isOpen={isNavigationOpen}
        label="Navigation"
        side="end"
        onOpenChange={(isOpen) => {
          if (isOpen) {
            setIsNavigationOpen(true);
          } else {
            closeMobileNavigation();
          }
        }}>
        <SideNavItem
          href="/skills"
          isSelected={
            isSkillsRoute(location.pathname)
          }
          label="Skills"
          onClick={closeMobileNavigation}
        />
        <SideNavItem
          href="/roadmap"
          isSelected={isRoadmapRoute(location.pathname)}
          label="Roadmap"
          onClick={closeMobileNavigation}
        />
        <Divider xstyle={styles.mobileNavigationDivider} />
        <TextInput
          hasClear
          isLabelHidden
          label="Search skills"
          placeholder="Search skills..."
          startIcon="search"
          value={mobileSkillSearch}
          width="100%"
          xstyle={styles.mobileNavigationSearch}
          onChange={setMobileSkillSearch}
        />
        {mobileSkillLinks.map((skill) => (
          <SideNavItem
            href={`/skills/${skill.id}`}
            key={skill.id}
            label={skill.name}
            onClick={closeMobileNavigation}
          />
        ))}
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
              centerContent={
                isDesktopNavigation ? (
                  <HStack gap={1}>
                    <TopNavItem
                      href="/skills"
                      isSelected={isSkillsRoute(location.pathname)}
                      label="Skills"
                    />
                    <TopNavItem
                      href="/roadmap"
                      isSelected={isRoadmapRoute(location.pathname)}
                      label="Roadmap"
                    />
                  </HStack>
                ) : undefined
              }
              endContent={
                <>
                  <IconButton
                    icon={<Icon color="inherit" icon="search" size="sm" />}
                    label={SEARCH_LABEL}
                    size="sm"
                    tooltip="Search"
                    variant="ghost"
                    onClick={() => setIsSearchOpen(true)}
                  />
                  <IconButton
                    icon={
                      mode === 'dark' ? (
                        <Icon color="inherit" icon={SunIcon} size="sm" />
                      ) : (
                        <Icon color="inherit" icon={MoonIcon} size="sm" />
                      )
                    }
                    label={themeToggleLabel}
                    size="sm"
                    tooltip={themeToggleLabel}
                    variant="ghost"
                    onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                  />
                  <IconButton
                    as="a"
                    href={GITHUB_PROFILE_URL}
                    icon={<GitHubIcon />}
                    label="GitHub"
                    rel="noopener noreferrer"
                    size="sm"
                    target="_blank"
                    tooltip="GitHub"
                    variant="ghost"
                  />
                  {!isDesktopNavigation && (
                    <IconButton
                      icon={<Icon color="inherit" icon="menu" size="sm" />}
                      label="Navigation"
                      size="sm"
                      tooltip="Navigation"
                      variant="ghost"
                      onClick={() => setIsNavigationOpen(true)}
                    />
                  )}
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
