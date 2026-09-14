import { afterEach, describe, expect, it, vi } from 'vitest';

import { shouldStartCollapsibleExpanded } from './responsive-collapsible';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

function setSmallViewport(matches: boolean): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
  }));
}

describe('shouldStartCollapsibleExpanded', () => {
  it('starts expanded above the shared small-screen breakpoint', () => {
    setSmallViewport(false);

    expect(shouldStartCollapsibleExpanded()).toBe(true);
  });

  it('starts collapsed at the shared small-screen breakpoint', () => {
    setSmallViewport(true);

    expect(shouldStartCollapsibleExpanded()).toBe(false);
  });
});
