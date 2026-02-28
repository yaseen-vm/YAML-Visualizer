import yaml from "js-yaml";
import { Position } from "@xyflow/react";
import type { YAMLParser, ParseResult } from "../parser-interface";

export class GitHubActionsParser implements YAMLParser {
  parse(input: string): ParseResult {
    const errors: string[] = [];
    const nodes: any[] = [];
    const edges: any[] = [];

    if (!input.trim()) {
      return { nodes, edges, errors: ["Empty input"] };
    }

    try {
      const parsed = yaml.load(input) as any;
      if (!parsed?.jobs) {
        return { nodes, edges, errors: ["No jobs found in workflow"] };
      }

      const jobs = Object.entries(parsed.jobs).map(([name, config]: any) => ({
        name,
        needs: Array.isArray(config.needs) ? config.needs : config.needs ? [config.needs] : [],
        runsOn: config["runs-on"],
        steps: config.steps?.length || 0,
      }));

      // Calculate depths
      const depths = new Map<string, number>();
      const getDepth = (name: string, visited = new Set<string>()): number => {
        if (depths.has(name)) return depths.get(name)!;
        if (visited.has(name)) return 0;
        visited.add(name);
        const job = jobs.find((j) => j.name === name);
        if (!job?.needs?.length) {
          depths.set(name, 0);
          return 0;
        }
        const maxDep = Math.max(...job.needs.map((d: string) => getDepth(d, visited)));
        depths.set(name, maxDep + 1);
        return maxDep + 1;
      };

      jobs.forEach((j) => getDepth(j.name));

      // Layout
      const layers = new Map<number, any[]>();
      jobs.forEach((j) => {
        const d = depths.get(j.name) || 0;
        if (!layers.has(d)) layers.set(d, []);
        layers.get(d)!.push(j);
      });

      const nodeWidth = 280;
      const nodeHeight = 160;
      const horizontalGap = 100;
      const verticalGap = 120;

      layers.forEach((layerJobs, depth) => {
        const totalWidth = layerJobs.length * nodeWidth + (layerJobs.length - 1) * horizontalGap;
        const startX = -totalWidth / 2;
        const y = depth * (nodeHeight + verticalGap);

        layerJobs.forEach((job: any, i: number) => {
          nodes.push({
            id: job.name,
            type: "githubNode",
            position: { x: startX + i * (nodeWidth + horizontalGap), y },
            data: { job },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
          });
        });
      });

      jobs.forEach((job) => {
        job.needs?.forEach((dep: string) => {
          edges.push({
            id: `${dep}-${job.name}`,
            source: dep,
            target: job.name,
            type: "smoothstep",
            animated: true,
            style: { stroke: "hsl(142, 76%, 36%)", strokeWidth: 2 },
          });
        });
      });

      if (nodes.length === 0) {
        errors.push("No valid jobs found");
      }
    } catch (e: any) {
      errors.push(`Parse error: ${e.message}`);
    }

    return { nodes, edges, errors };
  }

  getSampleYAML(): string {
    return `name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run linter
        run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run build

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to production
        run: echo "Deploying..."`;
  }
}
