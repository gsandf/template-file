import fs from 'fs/promises';
import _glob from 'glob';
import meow from 'meow';
import pLimit from 'p-limit';
import path from 'path';
import { promisify } from 'util';
import { renderTemplateFile } from '.';

async function main() {
  const glob = promisify(_glob);
  const limitOpenFiles = pLimit(64);

  const cli = meow(`
    Usage
      $ template-file <dataFile> <sourceGlob> <destination>

    Arguments
      data         Data file in JSON; used to replace variables in source files
      sourceGlob   Files to process; see [glob](https://npmjs.com/glob) for syntax
      destination  Destination directory where processed files go

    Examples
      Just handle one file
      $ template-file data.json template.txt build/

      Compile all .abc files in src/ to build/
      $ template-file stuff.json 'src/**/*.abc' build/
  `);

  if (cli.input.length !== 3) {
    cli.showHelp(2);
  }

  const [dataFile, sourceGlob, destination] = cli.input;
  const data = await import(path.resolve(dataFile));

  function renderToFile(file: string, destination: string) {
    return limitOpenFiles(() =>
      renderTemplateFile(file, data).then(renderedString =>
        fs.writeFile(destination, renderedString)
      )
    );
  }

  glob(sourceGlob)
    .then(files =>
      files.map(file =>
        renderToFile(file, path.join(destination, path.basename(file)))
      )
    )
    .then(fileWriteOperations => Promise.all(fileWriteOperations));
}

main();
