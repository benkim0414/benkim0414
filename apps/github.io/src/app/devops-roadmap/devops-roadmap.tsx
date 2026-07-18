import { useMemo } from 'react';
import { Background, ReactFlow, type Edge, type Node } from '@xyflow/react';

import { devOpsRoadmapItems } from './devops-roadmap.data';
import { DevOpsRoadmapNode } from './devops-roadmap-node';
import type { DevOpsRoadmapItem, DevOpsRoadmapProps } from './devops-roadmap.types';

const NODE_HEIGHT = 288;
const NODE_GAP = 64;
const TIMELINE_X = 0;
const nodeTypes = {
  roadmapNode: ({ data }: { data: { item: DevOpsRoadmapItem } }) => (
    <DevOpsRoadmapNode item={data.item} />
  ),
};

function buildTimelineElements(items: readonly DevOpsRoadmapItem[]) {
  const nodes: Node<{ item: DevOpsRoadmapItem }>[] = items.map((item, index) => ({
    id: item.id,
    type: 'roadmapNode',
    position: {
      x: TIMELINE_X,
      y: index * (NODE_HEIGHT + NODE_GAP),
    },
    data: { item },
    draggable: false,
    selectable: false,
  }));

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
    height: Math.max(NODE_HEIGHT, items.length * NODE_HEIGHT + Math.max(0, items.length - 1) * NODE_GAP),
  };
}

export function DevOpsRoadmap({
  ariaLabel = 'DevOps roadmap diagram',
  items = devOpsRoadmapItems,
  isReversed = false,
}: DevOpsRoadmapProps) {
  const orderedItems = useMemo(
    () => (isReversed ? [...items].reverse() : [...items]),
    [isReversed, items]
  );
  const { nodes, edges, height } = useMemo(
    () => buildTimelineElements(orderedItems),
    [orderedItems]
  );

  return (
    <div aria-label={ariaLabel} className="devops-roadmap__flow" role="group" style={{ height }}>
      <ReactFlow
        colorMode="light"
        disableKeyboardA11y
        edges={edges}
        elementsSelectable={false}
        fitView
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
      >
        <Background />
      </ReactFlow>
    </div>
  );
}
