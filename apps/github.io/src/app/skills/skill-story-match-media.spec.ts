import {
  createSkillStoryMatchMedia,
  getSkillStoryCompactOverride,
  getSkillStoryOriginalMatchMedia,
  getSkillStoryViewportKey,
} from './skill-story-match-media';
import {
  COMPACT_SURFACE_QUERY,
  TABLE_QUERY,
} from './skill-table-responsive';

describe('getSkillStoryCompactOverride', () => {
  it.each(['tablet', 'mobile1', 'mobile2'])(
    'treats the %s Storybook viewport as compact',
    (value) => {
      expect(getSkillStoryCompactOverride({ value, isRotated: false })).toBe(
        true,
      );
    },
  );

  it('keeps desktop and responsive viewports non-compact', () => {
    expect(getSkillStoryCompactOverride({ value: 'desktop' })).toBeUndefined();
    expect(
      getSkillStoryCompactOverride({ value: 'responsive' }),
    ).toBeUndefined();
  });
});

describe('createSkillStoryMatchMedia', () => {
  it('overrides compact input without changing the width query', () => {
    const nativeWidthQuery = { matches: false, media: TABLE_QUERY } as MediaQueryList;
    const originalMatchMedia = ((query: string) =>
      query === TABLE_QUERY
        ? nativeWidthQuery
        : ({ matches: false, media: query }) as MediaQueryList) as typeof matchMedia;
    const matchMedia = createSkillStoryMatchMedia(originalMatchMedia, true);

    expect(matchMedia(COMPACT_SURFACE_QUERY).matches).toBe(true);
    expect(matchMedia(TABLE_QUERY)).toBe(nativeWidthQuery);
  });

  it('preserves native matching when no named viewport override applies', () => {
    const nativeCompactQuery = {
      matches: true,
      media: COMPACT_SURFACE_QUERY,
    } as MediaQueryList;
    const originalMatchMedia = (() => nativeCompactQuery) as typeof matchMedia;

    expect(
      createSkillStoryMatchMedia(originalMatchMedia, undefined)(
        COMPACT_SURFACE_QUERY,
      ),
    ).toBe(nativeCompactQuery);
  });

  it('unwraps the tablet override when returning to desktop', () => {
    const nativeMatchMedia = ((query: string) =>
      ({ matches: false, media: query }) as MediaQueryList) as typeof matchMedia;
    const tabletMatchMedia = createSkillStoryMatchMedia(nativeMatchMedia, true);

    expect(getSkillStoryOriginalMatchMedia(tabletMatchMedia)).toBe(
      nativeMatchMedia,
    );
    expect(createSkillStoryMatchMedia(tabletMatchMedia, undefined)).toBe(
      nativeMatchMedia,
    );
  });
});

describe('getSkillStoryViewportKey', () => {
  it('changes when Storybook switches viewports', () => {
    expect(getSkillStoryViewportKey({ value: 'tablet' })).not.toBe(
      getSkillStoryViewportKey({ value: 'desktop' }),
    );
  });
});
