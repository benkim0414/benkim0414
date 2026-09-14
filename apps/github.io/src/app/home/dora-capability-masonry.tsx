import {
  Children,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import * as stylex from '@stylexjs/stylex';

const CARD_GAP = 16;
const MIN_CARD_WIDTH = 360;
const MASONRY_COLUMNS = 2;
const TWO_COLUMN_MIN_WIDTH = MIN_CARD_WIDTH * MASONRY_COLUMNS + CARD_GAP;

export interface MasonryItemPosition {
  column: number;
  top: number;
}

export interface MasonryLayout {
  height: number;
  items: MasonryItemPosition[];
}

const styles = stylex.create({
  container: {
    alignItems: 'start',
    display: 'grid',
    gap: CARD_GAP,
    position: 'relative',
  },
  item: {
    minWidth: 0,
    width: '100%',
  },
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

  const updateLayout = useCallback(() => {
    const container = containerRef.current;
    const containerWidth = container?.getBoundingClientRect().width ?? 0;

    if (containerWidth === 0) {
      return;
    }

    setMeasuredWidth((current) =>
      current === containerWidth ? current : containerWidth,
    );

    const nextColumnCount =
      containerWidth >= TWO_COLUMN_MIN_WIDTH ? MASONRY_COLUMNS : 1;

    if (nextColumnCount !== columnCount) {
      setColumnCount(nextColumnCount);
      setLayout(undefined);
      return;
    }

    const itemHeights = itemRefs.current.map(
      (item) => item?.getBoundingClientRect().height ?? 0,
    );

    if (
      itemHeights.length !== items.length ||
      itemHeights.some((height) => height === 0)
    ) {
      return;
    }

    const nextLayout = assignMasonryItems(itemHeights, columnCount, CARD_GAP);

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

  const containerStyle: CSSProperties = layout
    ? { display: 'block', height: layout.height }
    : { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` };
  const columnWidth =
    columnCount === 1
      ? measuredWidth
      : (measuredWidth - CARD_GAP) / columnCount;

  return (
    <div
      {...stylex.props(styles.container)}
      aria-label="DORA capability cards"
      data-testid="dora-capability-masonry"
      ref={containerRef}
      style={containerStyle}
    >
      {items.map((child, index) => {
        const position = layout?.items[index];
        const itemStyle: CSSProperties = position
          ? {
              left: position.column * (columnWidth + CARD_GAP),
              position: 'absolute',
              top: position.top,
              width: columnWidth,
            }
          : undefined;

        return (
          <div
            {...stylex.props(styles.item)}
            data-testid="dora-capability-masonry-item"
            key={(child as ReactElement).key ?? index}
            ref={(item) => {
              itemRefs.current[index] = item;
            }}
            style={itemStyle}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
