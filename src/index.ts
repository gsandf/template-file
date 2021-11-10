import { get } from '@blakek/deep';
import { promises as fs } from 'fs';
import _glob from 'glob';
import mkdirp from 'mkdirp';
import path from 'path';
import { promisify } from 'util';
import { limitOpenFiles } from './utils';

export type DataValue = string | number | Data | (() => string | number | Data);

export interface Data
  extends Record<string | number | symbol, DataValue | DataValue[]> {}

export async function renderGlob(
  sourceGlob: string,
  data: Data,
  onFileCallback: (filename: string, contents: string) => void
): Promise<void> {
  const glob = promisify(_glob);
  const files = await glob(sourceGlob);

  for (const file of files) {
    const contents = await limitOpenFiles(() => renderFile(file, data));
    onFileCallback(file, contents);
  }
}

function getTemplateRegEx() {
  const anything = String.raw`([\s\S]*?)`;
  const optionalNewLines = String.raw`\n*`;
  const optionalWhitespace = String.raw`\s*`;
  const spaceNotNewLines = String.raw`[ \t]*`;

  const tagStart = `{{${optionalWhitespace}`;
  const tagEnd = `${optionalWhitespace}}}`;
  const sectionStart = `${spaceNotNewLines}${tagStart}(?:#(.*?))${tagEnd}${optionalNewLines}`;
  const sectionEnd = String.raw`${optionalWhitespace}${tagStart}/\1${tagEnd}`;

  const repeatingSectionTag = `${sectionStart}${anything}${sectionEnd}`;
  const replacementTag = `${tagStart}(.*?)${tagEnd}`;
  const combinedRegEx = new RegExp(
    `${repeatingSectionTag}|${replacementTag}`,
    'g'
  );

  return combinedRegEx;
}

export function render(template: string, data: Data): string {
  const templateRegEx = getTemplateRegEx();

  return template.replace(
    templateRegEx,
    (_match, sectionTag, sectionContents, replacementTag) => {
      // Tag is for a repeating section
      if (sectionTag !== undefined) {
        const replacements = get(sectionTag, data) as Data[] | undefined;

        return replacements
          .map((subData: Data) => {
            return render(sectionContents, { ...subData, this: subData });
          })
          .join('\n');
      }

      const replacement = get(replacementTag, data);

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

export async function renderFile(
  filepath: string,
  data: Data
): Promise<string> {
  const templateString = await fs.readFile(filepath, { encoding: 'utf-8' });
  return render(templateString, data);
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
