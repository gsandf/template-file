#!/usr/bin/env node

import meow from 'meow';
import path from 'path';
import { renderToFolder } from '.';

async function main() {
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

  renderToFolder(sourceGlob, destination, data);
}

main();
