import { useMemo } from 'react';
import { Background, ReactFlow, type Edge, type Node } from '@xyflow/react';

import { devOpsRoadmapItems } from './devops-roadmap.data';
import { DevOpsRoadmapNode } from './devops-roadmap-node';
import type { DevOpsRoadmapItem, DevOpsRoadmapProps } from './devops-roadmap.types';

const BASE_NODE_HEIGHT = 148;
const NODE_GAP = 48;
const EXTRA_SKILL_ROW_HEIGHT = 50;
const CERTIFICATION_SECTION_HEIGHT = 50;
const SKILLS_PER_ROW = 2;
const TIMELINE_X = 0;
const nodeTypes = {
  roadmapNode: ({ data }: { data: { item: DevOpsRoadmapItem } }) => (
    <DevOpsRoadmapNode item={data.item} />
  ),
};

function getEstimatedNodeHeight(item: DevOpsRoadmapItem) {
  const skillRows = Math.ceil(item.skills.length / SKILLS_PER_ROW);
  const extraRows = Math.max(0, skillRows - 1);
  const certificationSectionHeight = item.certifications?.length ? CERTIFICATION_SECTION_HEIGHT : 0;

  return BASE_NODE_HEIGHT + extraRows * EXTRA_SKILL_ROW_HEIGHT + certificationSectionHeight;
}

function buildTimelineElements(items: readonly DevOpsRoadmapItem[]) {
  let currentY = 0;
  const nodes: Node<{ item: DevOpsRoadmapItem }>[] = items.map((item) => {
    const node: Node<{ item: DevOpsRoadmapItem }> = {
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

    currentY += getEstimatedNodeHeight(item) + NODE_GAP;

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
    height: items.length === 0 ? BASE_NODE_HEIGHT : currentY - NODE_GAP,
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
