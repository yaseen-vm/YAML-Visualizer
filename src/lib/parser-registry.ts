import type { YAMLType } from "./yaml-detector";
import type { YAMLParser } from "./parser-interface";
import { DockerComposeParser } from "./parsers/docker-compose-parser";
import { GitHubActionsParser } from "./parsers/github-actions-parser";
import { KubernetesParser } from "./parsers/kubernetes-parser";
import { HelmTemplateParser } from "./parsers/helm-template-parser";

const parsers: Record<YAMLType, YAMLParser | null> = {
  "docker-compose": new DockerComposeParser(),
  "github-actions": new GitHubActionsParser(),
  "kubernetes": new KubernetesParser(),
  "helm-template": new HelmTemplateParser(),
  "gitlab-ci": null,
  "unknown": null,
};

export function getParser(type: YAMLType): YAMLParser | null {
  return parsers[type];
}

export function getSampleYAML(type: YAMLType): string {
  const parser = parsers[type];
  return parser?.getSampleYAML() || "";
}
