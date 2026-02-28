import yaml from 'js-yaml';

export function parseCompose(content: string) {
  try {
    const doc = yaml.load(content) as any;
    return doc.services || {};
  } catch (e) {
    return {};
  }
}
