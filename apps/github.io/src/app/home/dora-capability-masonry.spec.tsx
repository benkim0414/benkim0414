import { assignMasonryItems } from './dora-capability-masonry';

describe('assignMasonryItems', () => {
  it('places each next card in the shortest column with a uniform gap', () => {
    expect(assignMasonryItems([100, 200, 100, 100], 2, 16)).toEqual({
      height: 316,
      items: [
        { column: 0, top: 0 },
        { column: 1, top: 0 },
        { column: 0, top: 116 },
        { column: 1, top: 216 },
      ],
    });
  });

  it('keeps the source item order when there is a single column', () => {
    expect(assignMasonryItems([100, 200, 100], 1, 16)).toEqual({
      height: 432,
      items: [
        { column: 0, top: 0 },
        { column: 0, top: 116 },
        { column: 0, top: 332 },
      ],
    });
  });
});
