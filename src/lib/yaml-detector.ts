import yaml from "js-yaml";
import { isHelmTemplate } from "./helm-preprocessor";

export type YAMLType = 
  | "docker-compose"
  | "github-actions"
  | "gitlab-ci"
  | "kubernetes"
  | "helm-template"
  | "helm-values"
  | "unknown";

export function detectYAMLType(input: string): YAMLType {
  // Check for Helm template syntax first (before parsing)
  if (isHelmTemplate(input)) {
    return "helm-template";
  }

  try {
    const parsed = yaml.load(input) as any;
    if (!parsed || typeof parsed !== "object") return "unknown";

    // Docker Compose detection
    if (parsed.services || parsed.version?.startsWith("3")) {
      return "docker-compose";
    }

    // GitHub Actions detection
    if (parsed.on && parsed.jobs) {
      return "github-actions";
    }

    // GitLab CI detection
    if (parsed.stages || (parsed.before_script && parsed.script)) {
      return "gitlab-ci";
    }

    // Kubernetes detection
    if (parsed.apiVersion && parsed.kind) {
      return "kubernetes";
    }

    // Helm values detection
    if (parsed.image || parsed.service || parsed.ingress || parsed.resources || 
        parsed.autoscaling || parsed.replicaCount || parsed.env || parsed.secrets) {
      return "helm-values";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}
