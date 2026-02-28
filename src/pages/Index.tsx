import { useState, useCallback, useEffect, useRef } from "react";
import { Moon, Sun, Play, FileCode, AlertCircle, ChevronLeft, ChevronRight, Container } from "lucide-react";
import gsap from "gsap";
import YamlEditor from "@/components/YamlEditor";
import GraphView from "@/components/GraphView";
import FloatingShapes from "@/components/FloatingShapes";
import { detectYAMLType, type YAMLType } from "@/lib/yaml-detector";
import { getParser, getSampleYAML } from "@/lib/parser-registry";
import type { Node, Edge } from "@xyflow/react";

const YAML_TYPES: { value: YAMLType; label: string; emoji: string }[] = [
  { value: "docker-compose", label: "Docker Compose", emoji: "🐳" },
  { value: "github-actions", label: "GitHub Actions", emoji: "⚡" },
  { value: "kubernetes", label: "Kubernetes", emoji: "☸️" },
  { value: "helm-template", label: "Helm Template", emoji: "⎈" },
];

export default function Index() {
  const [yaml, setYaml] = useState("");
  const [yamlType, setYamlType] = useState<YAMLType>("docker-compose");
  const [isDark, setIsDark] = useState(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setYaml(getSampleYAML("docker-compose"));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleVisualize = useCallback(() => {
    const detectedType = detectYAMLType(yaml);
    const typeToUse = detectedType !== "unknown" ? detectedType : yamlType;
    setYamlType(typeToUse);

    const parser = getParser(typeToUse);
    if (!parser) {
      setErrors([`No parser available for ${typeToUse}`]);
      return;
    }

    const result = parser.parse(yaml);
    setErrors(result.errors);
    setNodes(result.nodes);
    setEdges(result.edges);
    
    // Visual feedback
    if (headerRef.current) {
      const btn = headerRef.current.querySelector('button[aria-label="visualize"]');
      if (btn) {
        gsap.to(btn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
      }
    }
  }, [yaml, yamlType]);

  const handleLoadSample = (type: YAMLType) => {
    setYamlType(type);
    setYaml(getSampleYAML(type));
  };

  // Initial parse and animations
  useEffect(() => {
    if (yaml) handleVisualize();
  }, []);

  useEffect(() => {
    // GSAP entrance
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
    }
    if (mainRef.current) {
      gsap.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.2, ease: "power3.out" });
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Floating shapes animation */}
      <FloatingShapes isDark={isDark} />

      {/* Header */}
      <header ref={headerRef} className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <FileCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              YAML Visualizer
            </h1>
            <p className="text-xs text-muted-foreground">Docker, GitHub Actions, Kubernetes & more</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVisualize}
            aria-label="visualize"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Update visualization with current YAML"
          >
            <Play className="h-4 w-4" />
            Update Graph
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main */}
      <main ref={mainRef} className="relative z-10 flex flex-1 overflow-hidden">
        {/* Editor sidebar */}
        <div
          className={`relative border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300 ${
            sidebarOpen ? "w-[420px]" : "w-0"
          }`}
        >
          {sidebarOpen && (
            <div className="h-full flex flex-col p-4 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">YAML Editor</span>
                <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted">
                  {yamlType}
                </span>
              </div>

              <div className="flex gap-1 flex-wrap">
                {YAML_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleLoadSample(type.value)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      yamlType === type.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-muted"
                    }`}
                  >
                    {type.emoji} {type.label}
                  </button>
                ))}
              </div>

              {errors.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  {errors[0]}
                </div>
              )}

              <div className="flex-1 min-h-0">
                <YamlEditor value={yaml} onChange={setYaml} isDark={isDark} />
              </div>
            </div>
          )}

          {/* Toggle button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-1/2 -right-4 z-20 p-1 rounded-full bg-card border border-border shadow-sm hover:bg-muted transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        </div>

        {/* Graph area */}
        <div className="flex-1 min-w-0">
          {nodes.length > 0 ? (
            <GraphView nodes={nodes} edges={edges} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <Container className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  Paste YAML and click <strong>Update Graph</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
