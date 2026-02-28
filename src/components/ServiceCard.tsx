import { Handle, Position } from 'reactflow';

export default function ServiceCard({ data }: any) {
  const image = data.image || (data.build ? 'build context' : '');
  const ports = data.ports || [];
  const volumes = data.volumes || [];
  const hasDeps = data.depends_on && Object.keys(data.depends_on).length > 0;

  return (
    <div className="service-card">
      {/* Top accent bar */}
      <div className="service-card-accent" />

      {/* Target handle (incoming) */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
      />

      {/* Header */}
      <div className="service-card-header">
        <div className="service-card-status" aria-label="Service active" />
        <div className="service-card-name">{data.label}</div>
      </div>

      {/* Image */}
      {image && (
        <div className="service-card-image">
          <span className="service-card-image-icon" aria-hidden="true">◈</span>
          {image}
        </div>
      )}

      {/* Ports */}
      {ports.length > 0 && (
        <div className="service-card-badges">
          {ports.map((port: string, i: number) => (
            <span key={i} className="badge badge--port">
              {port}
            </span>
          ))}
        </div>
      )}

      {/* Volumes */}
      {volumes.length > 0 && (
        <div className="service-card-badges">
          <span className="badge badge--volume">
            {volumes.length} volume{volumes.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Dependencies note */}
      {hasDeps && (
        <div className="service-card-deps">
          <span aria-hidden="true">↗</span>
          Has dependencies
        </div>
      )}

      {/* Source handle (outgoing) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
      />
    </div>
  );
}
