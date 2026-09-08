import { Default, Zero } from './count-badge.stories';

describe('CountBadge stories', () => {
  it('provides representative populated and zero count examples', () => {
    expect(Default.args?.count).toBe(3);
    expect(Zero.args?.count).toBe(0);
  });
});
