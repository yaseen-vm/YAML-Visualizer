import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Workflow, Play } from "lucide-react";

interface GitHubNodeProps {
  data: {
    job: {
      name: string;
      runsOn: string;
      steps: number;
    };
  };
}

export default memo(function GitHubNode({ data }: GitHubNodeProps) {
  const { job } = data;

  return (
    <div className="glass-panel-elevated min-w-[260px] p-4 rounded-xl border-2 border-green-500/30">
      <Handle type="target" position={Position.Top} className="!bg-green-500" />
      
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-green-500/10">
          <Workflow className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground truncate">{job.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">GitHub Actions Job</p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Play className="h-3 w-3" />
          <span className="truncate">{job.runsOn}</span>
        </div>
        <div className="text-muted-foreground">
          {job.steps} step{job.steps !== 1 ? "s" : ""}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </div>
  );
});
