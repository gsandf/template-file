import { get } from '@blakek/deep';
import { promises as fs } from 'fs';
import _glob from 'glob';
import mkdirp from 'mkdirp';
import path from 'path';
import { promisify } from 'util';
import { limitOpenFiles } from './utils';

type DataValue = string | number | Data | (() => string | number | Data);

interface Data
  extends Record<string | number | symbol, DataValue | DataValue[]> {}

export async function renderGlob(
  sourceGlob: string,
  data: Data,
  onFileCallback: (filename: string, contents: string) => void
): Promise<void> {
  const glob = promisify(_glob);
  const files = await glob(sourceGlob);

  for (const file of files) {
    const contents = await limitOpenFiles(() => renderTemplateFile(file, data));
    onFileCallback(file, contents);
  }
}

export function renderString(template: string, data: Data): string {
  return template
    .replace(
      // '{{#tag}}stuff{{/tag}}
      /\{\{\s*#\s*(.*?)\s*\}\}\s*([\s\S]+?)\s*\{\{\s*\/\s*\1\s*\}\}/g,
      (_match, tag, contents) => {
        const array = get(tag, data);
        return array
          .map((subData: Data) => renderString(contents, subData))
          .join('');
      }
    )
    .replace(/\{\{\s*(.*?)\s*\}\}/g, (_match, captured) => {
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

export async function renderToFolder(
  sourceGlob: string,
  destination: string,
  data: Data
): Promise<void> {
  await mkdirp(destination);

  function writeFile(filename: string, contents: string) {
    const fullPath = path.join(destination, path.basename(filename));
    fs.writeFile(fullPath, contents);
  }

  return renderGlob(sourceGlob, data, writeFile);
}
