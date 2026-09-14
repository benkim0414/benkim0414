import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import { VStack } from '@astryxdesign/core/Layout';
import * as stylex from '@stylexjs/stylex';

const MIN_CAPABILITY_CARD_WIDTH = 360;
const MASONRY_COLUMNS = 2;
const TWO_COLUMN_MIN_WIDTH = MIN_CAPABILITY_CARD_WIDTH * MASONRY_COLUMNS + 16;

export interface MasonryItemPosition {
  column: number;
  top: number;
}

export interface MasonryLayout {
  height: number;
  items: MasonryItemPosition[];
}

export function getMasonryColumnCount(containerWidth: number) {
  return containerWidth >= TWO_COLUMN_MIN_WIDTH ? MASONRY_COLUMNS : 1;
}

const styles = stylex.create({
  container: {
    alignItems: 'start',
    display: 'grid',
    gap: spacingVars['--spacing-4'],
    position: 'relative',
  },
  fallbackGrid: (columnCount: number) => ({
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
  }),
  measuredContainer: (height: number) => ({
    display: 'block',
    height,
  }),
  item: {
    minWidth: 0,
    width: '100%',
  },
  positionedItem: (left: number, top: number, width: number) => ({
    left,
    position: 'absolute',
    top,
    width,
  }),
});

export function assignMasonryItems(
  itemHeights: readonly number[],
  columnCount: number,
  gap: number,
): MasonryLayout {
  const columnHeights = Array.from({ length: columnCount }, () => 0);
  const items = itemHeights.map((height) => {
    const column = columnHeights.reduce(
      (shortestColumn, columnHeight, index) =>
        columnHeight < columnHeights[shortestColumn] ? index : shortestColumn,
      0,
    );
    const top = columnHeights[column];

    columnHeights[column] += height + gap;

    return { column, top };
  });

  return {
    height: Math.max(0, ...columnHeights.map((height) => height - gap)),
    items,
  };
}

function areLayoutsEqual(
  current: MasonryLayout | undefined,
  next: MasonryLayout,
) {
  return (
    current?.height === next.height &&
    current.items.length === next.items.length &&
    current.items.every(
      (item, index) =>
        item.column === next.items[index]?.column &&
        item.top === next.items[index]?.top,
    )
  );
}

function getChildKey(child: ReactNode) {
  if (!isValidElement(child) || child.key === null) {
    throw new Error('DORA masonry children must have stable React keys.');
  }

  return child.key;
}

export function DoraCapabilityMasonry({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const items = Children.toArray(children);
  const [columnCount, setColumnCount] = useState(1);
  const [layout, setLayout] = useState<MasonryLayout>();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [measuredGap, setMeasuredGap] = useState(0);

  const updateLayout = useCallback(() => {
    const container = containerRef.current;
    const containerWidth = container?.getBoundingClientRect().width ?? 0;

    if (container === null || containerWidth === 0) {
      return;
    }

    const gap = Number.parseFloat(getComputedStyle(container).rowGap);

    if (gap === 0 || Number.isNaN(gap)) {
      return;
    }

    setMeasuredWidth((current) =>
      current === containerWidth ? current : containerWidth,
    );
    setMeasuredGap((current) => (current === gap ? current : gap));

    const nextColumnCount = getMasonryColumnCount(containerWidth);

    if (nextColumnCount !== columnCount) {
      setColumnCount(nextColumnCount);
      setLayout(undefined);
      return;
    }

    const itemHeights = items.map(
      (_, index) => itemRefs.current[index]?.getBoundingClientRect().height ?? 0,
    );

    if (
      itemHeights.length !== items.length ||
      itemHeights.some((height) => height === 0)
    ) {
      return;
    }

    const nextLayout = assignMasonryItems(itemHeights, columnCount, gap);

    setLayout((current) =>
      areLayoutsEqual(current, nextLayout) ? current : nextLayout,
    );
  }, [columnCount, items.length]);

  useLayoutEffect(() => {
    updateLayout();
  }, [updateLayout]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (container === null || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(updateLayout);

    observer.observe(container);
    itemRefs.current.forEach((item) => {
      if (item !== null) {
        observer.observe(item);
      }
    });

    return () => observer.disconnect();
  }, [updateLayout]);

  const columnWidth =
    columnCount === 1
      ? measuredWidth
      : (measuredWidth - measuredGap) / columnCount;
  const containerStyle = layout
    ? styles.measuredContainer(layout.height)
    : styles.fallbackGrid(columnCount);

  return (
    <VStack
      aria-label="DORA capability cards"
      data-testid="dora-capability-masonry"
      ref={containerRef}
      xstyle={[styles.container, containerStyle]}
    >
      {items.map((child, index) => {
        const position = layout?.items[index];
        const itemStyle = position
          ? styles.positionedItem(
              position.column * (columnWidth + measuredGap),
              position.top,
              columnWidth,
            )
          : undefined;

        return (
          <VStack
            data-testid="dora-capability-masonry-item"
            key={getChildKey(child)}
            ref={(item) => {
              itemRefs.current[index] = item;
            }}
            xstyle={[styles.item, itemStyle]}
          >
            {child}
          </VStack>
        );
      })}
    </VStack>
  );
}
