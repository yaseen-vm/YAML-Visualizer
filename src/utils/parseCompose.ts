import yaml from 'js-yaml';

export function parseCompose(content: string) {
  try {
    const doc = yaml.load(content) as any;
    return { services: doc.services || {}, error: null };
  } catch (e) {
    return { services: {}, error: (e as Error).message };
  }
}