import meta, { Default, Zero } from './count-badge.stories';

describe('CountBadge stories', () => {
  it('uses the shared Skills component taxonomy with representative counts', () => {
    expect(meta.title).toBe('Components/Skills/Count Badge');
    expect(Default.args?.count).toBe(3);
    expect(Zero.args?.count).toBe(0);
  });
});
