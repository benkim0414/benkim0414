import { useId, useMemo } from 'react';
import { Background, ReactFlow, type Edge, type Node } from '@xyflow/react';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import { devOpsRoadmapItems } from './devops-roadmap.data';
import { DevOpsRoadmapNode } from './devops-roadmap-node';
import type { DevOpsRoadmapItem, DevOpsRoadmapProps } from './devops-roadmap.types';

const NODE_HEIGHT = 148;
const NODE_GAP = 48;
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
  items = devOpsRoadmapItems,
  heading = 'DevOps Roadmap',
  isHeadingHidden = false,
}: DevOpsRoadmapProps) {
  const headingId = useId();
  const { nodes, edges, height } = useMemo(() => buildTimelineElements(items), [items]);
  const headingElement = isHeadingHidden ? (
    <VisuallyHidden as="h2" id={headingId}>
      {heading}
    </VisuallyHidden>
  ) : (
    <h2 className="devops-roadmap__heading" id={headingId}>
      {heading}
    </h2>
  );

  return (
    <section aria-labelledby={headingId} className="devops-roadmap">
      {headingElement}
      <div className="devops-roadmap__flow" style={{ height }}>
        <ReactFlow
          colorMode="light"
          edges={edges}
          elementsSelectable={false}
          fitView
          nodes={nodes}
          nodesConnectable={false}
          nodesDraggable={false}
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
    </section>
  );
}
