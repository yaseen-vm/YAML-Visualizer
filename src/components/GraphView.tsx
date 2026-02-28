import { useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import gsap from "gsap";
import DockerNode from "./DockerNode";
import GitHubNode from "./GitHubNode";
import K8sNode from "./K8sNode";

const nodeTypes = { 
  dockerNode: DockerNode,
  githubNode: GitHubNode,
  k8sNode: K8sNode,
};

interface GraphViewProps {
  nodes: Node[];
  edges: Edge[];
}

export default function GraphView({ nodes: initNodes, edges: initEdges }: GraphViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const flowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNodes(initNodes);
    setEdges(initEdges);
  }, [initNodes, initEdges, setNodes, setEdges]);

  const handleExport = useCallback(() => {
    const el = flowRef.current?.querySelector(".react-flow__viewport") as HTMLElement;
    if (!el) return;
    toPng(el, {
      backgroundColor: "#f5f6fa",
      style: { transform: "none" },
    }).then((dataUrl) => {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "docker-compose-diagram.png";
      a.click();
    });
  }, []);

  if (nodes.length === 0) return null;

  return (
    <div ref={flowRef} className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-background" />
        <Controls className="!bottom-4 !left-4" />
        <MiniMap
          nodeColor="hsl(220, 90%, 56%)"
          maskColor="hsl(var(--background) / 0.8)"
          className="!bottom-4 !right-4"
        />
      </ReactFlow>

      <button
        onClick={handleExport}
        className="absolute top-4 right-4 glass-panel-elevated px-4 py-2 flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors z-10"
      >
        <Download className="h-4 w-4" />
        Export PNG
      </button>
    </div>
  );
}
