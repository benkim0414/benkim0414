import {
  COMPACT_SURFACE_QUERY,
  TABLE_QUERY,
} from './skill-table-detail-layout';

export function createSkillStoryMatchMedia(
  originalMatchMedia: typeof window.matchMedia,
  compact: boolean,
): typeof window.matchMedia {
  return (query) => {
    if (query !== TABLE_QUERY && query !== COMPACT_SURFACE_QUERY) {
      return originalMatchMedia(query);
    }

    return {
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => false,
      matches: query === TABLE_QUERY || compact,
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined,
    };
  };
}
