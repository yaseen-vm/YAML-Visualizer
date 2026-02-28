import { memo, useEffect, useRef } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Box, Database, Globe, HardDrive } from "lucide-react";
import gsap from "gsap";
import type { DockerService } from "@/lib/docker-parser";

function DockerNode({ data }: NodeProps) {
  const service = data.service as DockerService;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out", delay: Math.random() * 0.3 }
      );
    }
  }, []);

  const getIcon = () => {
    const img = service.image?.toLowerCase() || "";
    if (img.includes("postgres") || img.includes("mysql") || img.includes("mongo") || img.includes("redis"))
      return <Database className="h-4 w-4" />;
    if (img.includes("nginx") || img.includes("traefik") || img.includes("caddy"))
      return <Globe className="h-4 w-4" />;
    return <Box className="h-4 w-4" />;
  };

  return (
    <div ref={ref} className="docker-node p-0 min-w-[240px] max-w-[300px] group cursor-pointer">
      <Handle type="target" position={Position.Top} className="!bg-primary !border-primary-foreground !w-3 !h-3" />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-primary/5 rounded-t-xl">
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
          {getIcon()}
        </div>
        <span className="font-semibold text-sm text-foreground truncate">{service.name}</span>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2 text-xs">
        {service.image && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Box className="h-3 w-3 shrink-0" />
            <span className="font-mono truncate">{service.image}</span>
          </div>
        )}
        {service.ports && service.ports.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-3 w-3 shrink-0" />
            <span className="font-mono truncate">{service.ports.join(", ")}</span>
          </div>
        )}
        {service.volumes && service.volumes.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <HardDrive className="h-3 w-3 shrink-0" />
            <span className="font-mono truncate">
              {service.volumes.length} volume{service.volumes.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary !border-primary-foreground !w-3 !h-3" />
    </div>
  );
}

export default memo(DockerNode);
