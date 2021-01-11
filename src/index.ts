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

const tagRegEx = /\{\{\s*(.*?)\s*\}\}/g;
const sectionRegEx = /\{\{\s*(?:#(.*?))\s*\}\}\s*([\s\S]*?)\s*\{\{\s*\/\1\s*\}\}/g;
const combinedRegEx = new RegExp(
  `${sectionRegEx.source}|${tagRegEx.source}`,
  'g'
);

export function renderString(template: string, data: Data): string {
  return template.replace(
    combinedRegEx,
    (_match, sectionTag, sectionContents, basicTag) => {
      // Tag is for an array section
      if (sectionTag !== undefined) {
        const replacements = get(sectionTag, data);

        return replacements
          .map((subData: Data) => {
            return renderString(sectionContents, { ...subData, this: subData });
          })
          .join('');
      }

      const replacement = get(basicTag, data);

      // If a template variable is found but nothing is supplied to fill it, remove it
      if (replacement === null || replacement === undefined) {
        return '';
      }

      // If the replacement is a function, replace the variable with the result of the function
      if (typeof replacement === 'function') {
        return replacement();
      }

      return replacement;
    }
  );
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
