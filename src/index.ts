import { get } from '@blakek/deep';
import fs from 'fs/promises';

interface Data
  extends Record<
    string | number | symbol,
    string | number | (() => string) | (() => number) | Data
  > {}

export function renderString(
  template: string,
  data: Data
): string | Promise<string> {
  return template.replace(/\{\{\s*(.*?)\s*\}\}/g, (_match, captured) => {
    const replacement = get(captured, data);

    // If a template variable is found but nothing is supplied to fill it, remove it
    if (replacement === null || replacement === undefined) {
      return '';
    }

    // If the replacement is a function, replace the variable with the result of the function
    if (typeof replacement === 'function') {
      return replacement();
    }

    return replacement;
  });
}

export async function renderTemplateFile(
  filepath: string,
  data: Data
): Promise<string> {
  const templateString = await fs.readFile(filepath, { encoding: 'utf-8' });
  return renderString(templateString, data);
}
