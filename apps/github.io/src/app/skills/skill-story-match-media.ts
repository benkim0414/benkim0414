import { COMPACT_SURFACE_QUERY } from './skill-table-detail-layout';

const originalMatchMediaKey = Symbol('skillStoryOriginalMatchMedia');
type StoryMatchMedia = typeof window.matchMedia & {
  [originalMatchMediaKey]?: typeof window.matchMedia;
};

export function getSkillStoryOriginalMatchMedia(
  matchMedia: typeof window.matchMedia,
): typeof window.matchMedia {
  return (matchMedia as StoryMatchMedia)[originalMatchMediaKey] ?? matchMedia;
}

export function createSkillStoryMatchMedia(
  originalMatchMedia: typeof window.matchMedia,
  compact: boolean | undefined,
): typeof window.matchMedia {
  const nativeMatchMedia = getSkillStoryOriginalMatchMedia(originalMatchMedia);
  if (compact === undefined) return nativeMatchMedia;

  const storyMatchMedia: StoryMatchMedia = (query) => {
    if (
      query !== COMPACT_SURFACE_QUERY
    ) {
      return nativeMatchMedia(query);
    }

    return {
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => false,
      matches: compact,
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined,
    };
  };

  storyMatchMedia[originalMatchMediaKey] = nativeMatchMedia;
  return storyMatchMedia;
}

export function getSkillStoryCompactOverride(
  viewport: unknown,
): boolean | undefined {
  if (typeof viewport !== 'object' || viewport === null) return undefined;

  const value = 'value' in viewport ? viewport.value : undefined;
  return value === 'tablet' || value === 'mobile1' || value === 'mobile2'
    ? true
    : undefined;
}

export function getSkillStoryViewportKey(viewport: unknown): string {
  return JSON.stringify(viewport ?? 'responsive');
}
