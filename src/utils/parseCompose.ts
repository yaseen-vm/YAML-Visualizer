import yaml from 'js-yaml';

export function parseCompose(content: string) {
  try {
    const doc = yaml.load(content, { schema: yaml.DEFAULT_SAFE_SCHEMA }) as any;
    return { services: doc.services || {} };
  } catch (e) {
    throw new Error('Invalid YAML: ' + (e as Error).message);
  }
}