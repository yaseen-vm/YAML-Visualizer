import yaml from "js-yaml";
import { Position } from "@xyflow/react";
import type { YAMLParser, ParseResult } from "../parser-interface";
import { preprocessHelmTemplate, extractResourceName } from "../helm-preprocessor";

export class HelmTemplateParser implements YAMLParser {
  parse(input: string): ParseResult {
    const errors: string[] = [];
    const nodes: any[] = [];
    const edges: any[] = [];

    if (!input.trim()) {
      return { nodes, edges, errors: ["Empty input"] };
    }

    try {
      // Preprocess Helm template syntax
      const processed = preprocessHelmTemplate(input);
      
      const docs = processed.split(/^---$/m).filter(d => d.trim());
      const resources: any[] = [];

      docs.forEach((doc, idx) => {
        try {
          const parsed = yaml.load(doc) as any;
          if (parsed && typeof parsed === 'object') {
            const name = parsed.metadata?.name || extractResourceName(input) || `resource-${idx}`;
            const kind = parsed.kind || 'Resource';
            
            resources.push({
              name,
              kind,
              namespace: parsed.metadata?.namespace || "default",
              spec: parsed.spec,
            });
          }
        } catch (e: any) {
          // Silently skip unparseable documents
        }
      });

      if (resources.length === 0) {
        return { nodes, edges, errors: ["No valid Kubernetes resources found in Helm template"] };
      }

      // Group by kind
      const kindGroups = new Map<string, any[]>();
      resources.forEach(r => {
        if (!kindGroups.has(r.kind)) kindGroups.set(r.kind, []);
        kindGroups.get(r.kind)!.push(r);
      });

      const nodeWidth = 280;
      const nodeHeight = 160;
      const horizontalGap = 100;
      const verticalGap = 120;

      let yOffset = 0;
      kindGroups.forEach((items, kind) => {
        const totalWidth = items.length * nodeWidth + (items.length - 1) * horizontalGap;
        const startX = -totalWidth / 2;

        items.forEach((resource: any, i: number) => {
          nodes.push({
            id: `${resource.kind}-${resource.name}`,
            type: "k8sNode",
            position: { x: startX + i * (nodeWidth + horizontalGap), y: yOffset },
            data: { resource },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
          });
        });

        yOffset += nodeHeight + verticalGap;
      });

      // Create edges based on selectors/labels
      resources.forEach(r => {
        if (r.kind === "Service" && r.spec?.selector) {
          resources.forEach(target => {
            if (target.kind === "Deployment" || target.kind === "Pod") {
              edges.push({
                id: `${r.kind}-${r.name}-${target.kind}-${target.name}`,
                source: `${r.kind}-${r.name}`,
                target: `${target.kind}-${target.name}`,
                type: "smoothstep",
                animated: true,
                style: { stroke: "hsl(221, 83%, 53%)", strokeWidth: 2 },
              });
            }
          });
        }
      });

    } catch (e: any) {
      errors.push(`Parse error: ${e.message}`);
    }

    return { nodes, edges, errors };
  }

  getSampleYAML(): string {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      app: {{ .Chart.Name }}
  template:
    metadata:
      labels:
        app: {{ .Chart.Name }}
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: {{ .Values.service.port }}
---
apiVersion: v1
kind: Service
metadata:
  name: {{ include "myapp.fullname" . }}
spec:
  type: {{ .Values.service.type }}
  ports:
  - port: {{ .Values.service.port }}
    targetPort: http
  selector:
    app: {{ .Chart.Name }}`;
  }
}
