import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Box, Database, Network } from "lucide-react";

interface K8sNodeProps {
  data: {
    resource: {
      name: string;
      kind: string;
      namespace: string;
    };
  };
}

const kindIcons: Record<string, any> = {
  Pod: Box,
  Service: Network,
  Deployment: Box,
  StatefulSet: Database,
  ConfigMap: Database,
  Secret: Database,
};

export default memo(function K8sNode({ data }: K8sNodeProps) {
  const { resource } = data;
  const Icon = kindIcons[resource.kind] || Box;

  return (
    <div className="glass-panel-elevated min-w-[260px] p-4 rounded-xl border-2 border-blue-500/30">
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-500/10">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">{resource.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{resource.kind}</p>
        </div>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        namespace: {resource.namespace}
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
});
