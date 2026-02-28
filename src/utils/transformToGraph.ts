export interface GraphNode {
  id: string;
  data: any;
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: any;
}

export function transformToGraph(services: any) {
  const nodes: GraphNode[] = Object.keys(services).map((name, i) => ({
    id: name,
    data: {
      label: name,
      ...services[name]
    },
    position: { x: 250, y: i * 220 }
  }));

  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>();

  Object.entries(services).forEach(([name, config]: any) => {
    if (config.depends_on) {
      const deps = Array.isArray(config.depends_on)
        ? config.depends_on
        : Object.keys(config.depends_on);

      deps.forEach((dep: string) => {
        const edgeId = `${name}-${dep}`;
        if (!edgeSet.has(edgeId)) {
          edges.push({
            id: edgeId,
            source: name,
            target: dep,
            animated: true
          });
          edgeSet.add(edgeId);
        }
      });
    }
  });

  return { nodes, edges };
}

export function detectCircularDeps(services: any): string[] {
  const cycles: string[] = [];
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const deps = services[node]?.depends_on;
    if (deps) {
      const depList = Array.isArray(deps) ? deps : Object.keys(deps);
      for (const dep of depList) {
        if (!visited.has(dep)) {
          dfs(dep, [...path]);
        } else if (recStack.has(dep)) {
          cycles.push(`${[...path, dep].join(' → ')}`);
        }
      }
    }

    recStack.delete(node);
  }

  Object.keys(services).forEach(service => {
    if (!visited.has(service)) {
      dfs(service, []);
    }
  });

  return cycles;
}
