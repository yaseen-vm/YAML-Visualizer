import yaml from "js-yaml";

export interface DockerService {
  name: string;
  image?: string;
  ports?: string[];
  volumes?: string[];
  depends_on?: string[];
  environment?: Record<string, string> | string[];
  networks?: string[];
  command?: string;
}

export interface ParsedCompose {
  services: DockerService[];
  errors: string[];
}

export function parseDockerCompose(input: string): ParsedCompose {
  const errors: string[] = [];
  const services: DockerService[] = [];

  if (!input.trim()) {
    return { services, errors: ["Empty input"] };
  }

  try {
    const parsed = yaml.load(input) as Record<string, any>;
    if (!parsed || typeof parsed !== "object") {
      return { services, errors: ["Invalid YAML structure"] };
    }

    const serviceMap = parsed.services || parsed;
    if (!serviceMap || typeof serviceMap !== "object") {
      return { services, errors: ["No services found"] };
    }

    for (const [name, config] of Object.entries(serviceMap)) {
      if (!config || typeof config !== "object") continue;
      const svc = config as Record<string, any>;

      const dependsOn = Array.isArray(svc.depends_on)
        ? svc.depends_on
        : svc.depends_on && typeof svc.depends_on === "object"
        ? Object.keys(svc.depends_on)
        : [];

      services.push({
        name,
        image: svc.image || svc.build ? `build:${typeof svc.build === 'string' ? svc.build : './'}` : undefined,
        ports: Array.isArray(svc.ports) ? svc.ports.map(String) : [],
        volumes: Array.isArray(svc.volumes) ? svc.volumes.map(String) : [],
        depends_on: dependsOn,
        environment: svc.environment,
        networks: Array.isArray(svc.networks) ? svc.networks : [],
        command: typeof svc.command === 'string' ? svc.command : undefined,
      });
    }

    if (services.length === 0) {
      errors.push("No valid services found in the YAML");
    }
  } catch (e: any) {
    errors.push(`YAML parse error: ${e.message}`);
  }

  return { services, errors };
}

export const SAMPLE_COMPOSE = `version: "3.8"

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api
      - frontend

  frontend:
    image: node:18-alpine
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    depends_on:
      - api

  api:
    image: python:3.11-slim
    ports:
      - "8000:8000"
    volumes:
      - ./api:/app
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  worker:
    image: python:3.11-slim
    depends_on:
      - redis
      - postgres

volumes:
  pgdata:
`;
