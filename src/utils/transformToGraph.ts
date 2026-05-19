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
  if (!services || typeof services !== 'object') return { nodes: [], edges: [] };
  
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
        if (!services[dep]) return;
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
  if (!services || typeof services !== 'object') return [];
  
  const cycles: string[] = [];
  const recStack = new Set<string>();

  function dfs(node: string, path: string[], visited: Set<string>): void {
    if (recStack.has(node)) {
      cycles.push(`${[...path, node].join(' → ')}`);
      return;
    }
    
    if (visited.has(node)) {
      return;
    }
    
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const deps = services[node]?.depends_on;
    if (deps) {
      const depList = Array.isArray(deps) ? deps : Object.keys(deps);
      for (const dep of depList) {
        dfs(dep, [...path], visited);
      }
    }

    recStack.delete(node);
  }

  Object.keys(services).forEach(service => {
    const visited = new Set<string>();
    dfs(service, [], visited);
  });

  return cycles;
}