import type { Node, Edge } from "@xyflow/react";

export interface ParseResult {
  nodes: Node[];
  edges: Edge[];
  errors: string[];
}

export interface YAMLParser {
  parse(input: string): ParseResult;
  getSampleYAML(): string;
}
