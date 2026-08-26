import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { ReactFlow, type Edge, type Node } from '@xyflow/react';

import { devOpsRoadmapItems } from './devops-roadmap.data';
import {
  DEVOPS_ROADMAP_NODE_WIDTH,
  DevOpsRoadmapNode,
} from './devops-roadmap-node';
import type {
  DevOpsRoadmapItem,
  DevOpsRoadmapProps,
} from './devops-roadmap.types';

const BASE_NODE_HEIGHT = 148;
const NODE_GAP = 48;
const EXTRA_SKILL_ROW_HEIGHT = 50;
const CERTIFICATION_SECTION_HEIGHT = 50;
const SKILLS_PER_ROW = 2;
const TIMELINE_X = 0;
type RoadmapNode = Node<{ item: DevOpsRoadmapItem }>;
interface TimelineElements {
  nodes: RoadmapNode[];
  edges: Edge[];
  height: number;
}

const nodeTypes = {
  roadmapNode: ({ data }: { data: { item: DevOpsRoadmapItem } }) => (
    <DevOpsRoadmapNode item={data.item} />
  ),
};

const styles = stylex.create({
  flow: (height: number) => ({
    height,
    marginInline: 'auto',
    width: DEVOPS_ROADMAP_NODE_WIDTH,
  }),
});

function getEstimatedNodeHeight(item: DevOpsRoadmapItem) {
  const skillRows = Math.ceil(item.skills.length / SKILLS_PER_ROW);
  const extraRows = Math.max(0, skillRows - 1);
  const certificationSectionHeight = item.certifications?.length
    ? CERTIFICATION_SECTION_HEIGHT
    : 0;

  return (
    BASE_NODE_HEIGHT +
    extraRows * EXTRA_SKILL_ROW_HEIGHT +
    certificationSectionHeight
  );
}

function getTimelineHeight(itemsLength: number, currentY: number) {
  return itemsLength === 0 ? BASE_NODE_HEIGHT : currentY - NODE_GAP;
}

function buildTimelineElements(
  items: readonly DevOpsRoadmapItem[],
  getNodeHeight: (item: DevOpsRoadmapItem) => number = getEstimatedNodeHeight,
): TimelineElements {
  let currentY = 0;
  const nodes: RoadmapNode[] = items.map((item) => {
    const node: RoadmapNode = {
      id: item.id,
      type: 'roadmapNode',
      position: {
        x: TIMELINE_X,
        y: currentY,
      },
      data: { item },
      draggable: false,
      selectable: false,
    };

    currentY += getNodeHeight(item) + NODE_GAP;

    return node;
  });

  const edges: Edge[] = items.slice(1).map((item, index) => ({
    id: `${items[index].id}-${item.id}`,
    source: items[index].id,
    target: item.id,
    type: 'smoothstep',
    animated: false,
    focusable: false,
  }));

  return {
    nodes,
    edges,
    height: getTimelineHeight(items.length, currentY),
  };
}

function areTimelineElementsEqual(
  current: TimelineElements,
  next: TimelineElements,
) {
  return (
    current.height === next.height &&
    current.nodes.length === next.nodes.length &&
    current.nodes.every((node, index) => {
      const nextNode = next.nodes[index];

      return (
        nextNode !== undefined &&
        node.id === nextNode.id &&
        node.position.x === nextNode.position.x &&
        node.position.y === nextNode.position.y
      );
    })
  );
}

export function DevOpsRoadmap({
  ariaLabel = 'DevOps roadmap diagram',
  items = devOpsRoadmapItems,
  isReversed = false,
}: DevOpsRoadmapProps) {
  const flowRef = useRef<HTMLDivElement>(null);
  const orderedItems = useMemo(
    () => (isReversed ? [...items].reverse() : [...items]),
    [isReversed, items],
  );
  const timelineKey = useMemo(
    () => orderedItems.map((item) => item.id).join('\u0000'),
    [orderedItems],
  );
  const initialTimeline = useMemo(
    () => buildTimelineElements(orderedItems),
    [orderedItems],
  );
  const [measuredTimeline, setMeasuredTimeline] = useState<
    | {
        key: string;
        timeline: TimelineElements;
      }
    | undefined
  >();
  const timeline =
    measuredTimeline?.key === timelineKey
      ? measuredTimeline.timeline
      : initialTimeline;
  const updateMeasuredLayout = useCallback(() => {
    const flowElement = flowRef.current;

    if (flowElement === null) {
      return;
    }

    const measuredHeights = new Map<string, number>();

    for (const nodeElement of Array.from(
      flowElement.querySelectorAll<HTMLElement>('.react-flow__node[data-id]'),
    )) {
      const nodeId = nodeElement.dataset.id;
      const height =
        nodeElement.offsetHeight || nodeElement.getBoundingClientRect().height;

      if (nodeId !== undefined && height > 0) {
        measuredHeights.set(nodeId, height);
      }
    }

    if (
      orderedItems.some((item) => measuredHeights.get(item.id) === undefined)
    ) {
      return;
    }

    const nextTimeline = buildTimelineElements(
      orderedItems,
      (item) => measuredHeights.get(item.id) ?? getEstimatedNodeHeight(item),
    );

    setMeasuredTimeline((current) =>
      current?.key === timelineKey &&
      areTimelineElementsEqual(current.timeline, nextTimeline)
        ? current
        : { key: timelineKey, timeline: nextTimeline },
    );
  }, [orderedItems, timelineKey]);

  useLayoutEffect(() => {
    updateMeasuredLayout();
  }, [updateMeasuredLayout]);

  useLayoutEffect(() => {
    const flowElement = flowRef.current;

    if (flowElement === null || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(updateMeasuredLayout);

    for (const nodeElement of Array.from(
      flowElement.querySelectorAll<HTMLElement>('.react-flow__node[data-id]'),
    )) {
      observer.observe(nodeElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [updateMeasuredLayout]);

  const { nodes, edges, height } = timeline;
  const flowStylexProps = stylex.props(styles.flow(height));

  return (
    <div
      {...flowStylexProps}
      aria-label={ariaLabel}
      className={`${flowStylexProps.className ?? ''} devops-roadmap__flow min-w-0`}
      ref={flowRef}
      role="group"
    >
      <ReactFlow
        colorMode="light"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        disableKeyboardA11y
        edges={edges}
        elementsSelectable={false}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
        nodesFocusable={false}
        nodeTypes={nodeTypes}
        panOnDrag={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        zoomOnDoubleClick={false}
        zoomOnPinch={false}
        zoomOnScroll={false}
      />
    </div>
  );
}
