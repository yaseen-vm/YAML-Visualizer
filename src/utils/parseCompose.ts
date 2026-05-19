import yaml from 'js-yaml';

export function parseCompose(content: string): { services: Record<string, any>; error?: string } {
  try {
    const doc = yaml.load(content) as any;
    return { services: doc?.services || {} };
  } catch (e) {
    return { services: {}, error: e instanceof Error ? e.message : 'Unknown parse error' };
  }
}