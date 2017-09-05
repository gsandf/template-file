#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const pify = require('pify')
const glob = pify(require('glob'))
const meow = require('meow')
const pLimit = require('p-limit')(64)
const { renderTemplateFile } = require('.')

const writeFile = pify(fs.writeFile)

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
`)

if (cli.input.length !== 3) {
  cli.showHelp(2)
}

const [dataFile, sourceGlob, destination] = cli.input
const data = require(path.resolve(dataFile))

glob(sourceGlob)
  .then(files => files.map(file => ({
    data,
    file,
    destination: path.join(destination, path.basename(file))
  })))
  .then(fileList => fileList.map(renderToFile))
  .then(fileWriteOperations => Promise.all(fileWriteOperations))

function renderToFile({ data, file, destination }) {
  return pLimit(() =>
    renderTemplateFile(file, data)
      .then(renderedString => writeFile(destination, renderedString))
  )
}
