import { promises as fs } from 'fs';
import path from 'path';
import { renderToFolder } from '.';

/** Trims the leading and trailing whitespace from the help text. */
function trimUsageString(string: string): string {
  // Remove newlines from beginning and end
  const usage = string.replace(/^(\s*\n)*|(\s*\n)*$/g, '');
  // Remove leading indentation
  const indentationLength = usage.match(/^\s*/)[0].length;
  return usage.replace(new RegExp(`^ {${indentationLength}}`, 'gm'), '');
}

function showUsage() {
  const usageString = trimUsageString(`
    Usage
      $ template-file <dataFile> <sourceGlob> <destination>

    Arguments
      dataFile     Data file in JSON; used to replace variables in source files
      sourceGlob   Files to process; see [glob](https://npmjs.com/glob) for syntax
      destination  Destination directory where processed files go

    Examples
      Just handle one file
      $ template-file data.json template.txt build/

      Compile all .abc files in src/ to build/
      $ template-file stuff.json 'src/**/*.abc' build/
  `);

  console.log(usageString);
}

async function getVersion(): Promise<string> {
  const packageJson = await fs
    .readFile(path.resolve(__dirname, '../package.json'), 'utf-8')
    .then(JSON.parse);

  return packageJson.version;
}

async function main() {
  const args = process.argv.slice(2);

  const hasHelpArg = args.some(arg => ['-h', '--help', 'help'].includes(arg));
  const hasVersionArg = args.some(arg =>
    ['-v', '--version', 'version'].includes(arg)
  );
  const hasCorrectNumberOfArgs = args.length === 3;

  if (hasVersionArg) {
    console.log(await getVersion());
    return;
  }

  if (hasHelpArg || !hasCorrectNumberOfArgs) {
    showUsage();
    process.exit(hasHelpArg ? 0 : 1);
  }

  const [dataFile, sourceGlob, destination] = args;
  const data = await import(path.resolve(dataFile));

  renderToFolder(sourceGlob, destination, data);
}

main();
