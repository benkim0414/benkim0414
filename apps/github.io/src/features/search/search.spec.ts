import { describe, expect, it } from 'vitest';

import {
  parseSearchParams,
  searchSkills,
  serializeSearchState,
  toggleFilter,
} from './search';

describe('skill search', () => {
  it('searches skill names, tags, usage text, and related project text', () => {
    expect(searchSkills({ query: 'terraform', categories: [], levels: [] })[0]?.id).toBe(
      'terraform-opentofu'
    );
    expect(searchSkills({ query: 'release', categories: [], levels: [] })[0]?.id).toBe(
      'github-actions'
    );
    expect(searchSkills({ query: 'Developer Showcase', categories: [], levels: [] })).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'react' })])
    );
  });

  it('tolerates minor typos through Fuse', () => {
    expect(searchSkills({ query: 'kubernets', categories: [], levels: [] })[0]?.id).toBe(
      'kubernetes'
    );
  });

  it('combines query, category, and level filters', () => {
    const results = searchSkills({
      query: 'automation',
      categories: ['CI/CD'],
      levels: [4],
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('github-actions');
  });

  it('parses and normalizes supported URL parameters', () => {
    const params = new URLSearchParams(
      'q=cloud&category=Cloud&category=Unknown&level=4&level=9'
    );

    expect(parseSearchParams(params)).toEqual({
      query: 'cloud',
      categories: ['Cloud'],
      levels: [4],
    });
  });

  it('serializes search state to shareable URL parameters', () => {
    const params = serializeSearchState({
      query: ' platform ',
      categories: ['Cloud', 'Tools'],
      levels: [3, 4],
    });

    expect(params.toString()).toBe('q=platform&category=Cloud&category=Tools&level=3&level=4');
  });

  it('toggles filter values without duplicates', () => {
    expect(toggleFilter(['Cloud'], 'Tools')).toEqual(['Cloud', 'Tools']);
    expect(toggleFilter(['Cloud', 'Tools'], 'Cloud')).toEqual(['Tools']);
  });
});
