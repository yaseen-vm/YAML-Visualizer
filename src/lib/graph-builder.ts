import { type Node, type Edge, Position } from "@xyflow/react";
import type { DockerService } from "./docker-parser";

export function buildGraph(services: DockerService[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Simple layered layout based on dependency depth
  const depths = new Map<string, number>();

  function getDepth(name: string, visited: Set<string> = new Set()): number {
    if (depths.has(name)) return depths.get(name)!;
    if (visited.has(name)) return 0;
    visited.add(name);

    const svc = services.find((s) => s.name === name);
    if (!svc || !svc.depends_on?.length) {
      depths.set(name, 0);
      return 0;
    }

    const maxDep = Math.max(...svc.depends_on.map((d) => getDepth(d, visited)));
    const depth = maxDep + 1;
    depths.set(name, depth);
    return depth;
  }

  services.forEach((s) => getDepth(s.name));

  // Group by depth
  const layers = new Map<number, DockerService[]>();
  services.forEach((s) => {
    const d = depths.get(s.name) || 0;
    if (!layers.has(d)) layers.set(d, []);
    layers.get(d)!.push(s);
  });

  const maxDepth = Math.max(...Array.from(layers.keys()), 0);
  const nodeWidth = 280;
  const nodeHeight = 160;
  const horizontalGap = 100;
  const verticalGap = 120;

  layers.forEach((layerServices, depth) => {
    const totalWidth = layerServices.length * nodeWidth + (layerServices.length - 1) * horizontalGap;
    const startX = -totalWidth / 2;
    const y = (maxDepth - depth) * (nodeHeight + verticalGap);

    layerServices.forEach((svc, i) => {
      nodes.push({
        id: svc.name,
        type: "dockerNode",
        position: { x: startX + i * (nodeWidth + horizontalGap), y },
        data: { service: svc },
        sourcePosition: Position.Top,
        targetPosition: Position.Bottom,
      });
    });
  });

  // Create edges
  services.forEach((svc) => {
    svc.depends_on?.forEach((dep) => {
      edges.push({
        id: `${svc.name}-${dep}`,
        source: svc.name,
        target: dep,
        type: "smoothstep",
        animated: true,
        style: {
          stroke: "hsl(220, 90%, 56%)",
          strokeWidth: 2,
        },
      });
    });
  });

  return { nodes, edges };
}
