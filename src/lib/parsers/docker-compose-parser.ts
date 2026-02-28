import yaml from "js-yaml";
import { Position } from "@xyflow/react";
import type { YAMLParser, ParseResult } from "../parser-interface";

export class DockerComposeParser implements YAMLParser {
  parse(input: string): ParseResult {
    const errors: string[] = [];
    const nodes: any[] = [];
    const edges: any[] = [];

    if (!input.trim()) {
      return { nodes, edges, errors: ["Empty input"] };
    }

    try {
      const parsed = yaml.load(input) as any;
      if (!parsed || typeof parsed !== "object") {
        return { nodes, edges, errors: ["Invalid YAML structure"] };
      }

      const serviceMap = parsed.services || parsed;
      if (!serviceMap || typeof serviceMap !== "object") {
        return { nodes, edges, errors: ["No services found"] };
      }

      const services = Object.entries(serviceMap).map(([name, config]: any) => ({
        name,
        image: config.image,
        depends_on: Array.isArray(config.depends_on)
          ? config.depends_on
          : config.depends_on
          ? Object.keys(config.depends_on)
          : [],
        ports: config.ports || [],
        volumes: config.volumes || [],
      }));

      // Calculate depths
      const depths = new Map<string, number>();
      const getDepth = (name: string, visited = new Set<string>()): number => {
        if (depths.has(name)) return depths.get(name)!;
        if (visited.has(name)) return 0;
        visited.add(name);
        const svc = services.find((s) => s.name === name);
        if (!svc?.depends_on?.length) {
          depths.set(name, 0);
          return 0;
        }
        const maxDep = Math.max(...svc.depends_on.map((d: string) => getDepth(d, visited)));
        depths.set(name, maxDep + 1);
        return maxDep + 1;
      };

      services.forEach((s) => getDepth(s.name));

      // Layout
      const layers = new Map<number, any[]>();
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

        layerServices.forEach((svc: any, i: number) => {
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

      services.forEach((svc) => {
        svc.depends_on?.forEach((dep: string) => {
          edges.push({
            id: `${svc.name}-${dep}`,
            source: svc.name,
            target: dep,
            type: "smoothstep",
            animated: true,
            style: { stroke: "hsl(220, 90%, 56%)", strokeWidth: 2 },
          });
        });
      });

      if (nodes.length === 0) {
        errors.push("No valid services found");
      }
    } catch (e: any) {
      errors.push(`Parse error: ${e.message}`);
    }

    return { nodes, edges, errors };
  }

  getSampleYAML(): string {
    return `version: "3.8"

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - api
      - frontend

  frontend:
    image: node:18-alpine
    ports:
      - "3000:3000"
    depends_on:
      - api

  api:
    image: python:3.11-slim
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"`;
  }
}
