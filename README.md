# template-file

> 🔀 Replace {{ variables }} in all your files

[![Build status](https://travis-ci.org/gsandf/template-file.svg?branch=master)](https://travis-ci.org/gsandf/template-file)
[![Greenkeeper badge](https://badges.greenkeeper.io/gsandf/template-file.svg)](https://greenkeeper.io/)

Use variables to replace template strings in any type of file.

**✨ Some helpful features:**

 - If you use a JavaScript file as the `dataFile` argument, whatever object the JS exports is used for replacement.
 - If the value of one of the keys is a function, the result of that function is used for replacement.
 - Deeply-nested keys can be used for replacements.

 **⚠️ NOTE:** Keys with a period in the name will not be resolved.  `{{ user.name }}` will look for `{ user: { name: '' }}` but not `{ 'user.name': ''}`.  This would be easy to change, but we're leaving as-is for now for slightly better replacement performance (please open an issue if you would like the other behavior).

## Usage

```shell
template-file <dataFile> <sourceGlob> <destination>
```

### Arguments

- **data** - Data file in JSON; used to replace variables in source files
- **sourceGlob** - Files to process; see [glob](https://npmjs.com/glob) for syntax
- **destination** - Destination directory where processed files go

### Examples

**ℹ️ TIP:** Remember to place quotes around your arguments (if they contain asterisks, question marks, etc.) to keep your shell from expanding globs before `template-file` gets to consume them.

Just handle one file:

```shell
template-file data.json template.txt build/
```

Compile all `.abc` files in `src/` to `build/`:

```shell
template-file stuff.json 'src/**/*.abc' build/
```

Compile all HTML files in `src/` to `dist/` using the exported result of a JavaScript module:

```shell
template-file retrieveData.js 'src/**/*.html' './dist'
```

## API

```js
const { renderString, renderTemplateFile } = require('template-file')

const data = {
  location: {
    name: 'Nashville'
  },
  adjective: 'cool'
}

// Replace variables in string
renderString('{{ location.name }} is {{ adjective }}.', data) // 'Nashville is cool.'

// Replace variables in a file
renderTemplateFile('/path/to/file', data)
  .then(renderedString => console.log(renderedString)) // same as above, but from file
```

## Install

With either [Yarn](https://yarnpkg.com/) or [npm](https://npmjs.org/) installed, run **one** of the following:

```shell
# If using Yarn, add to project:
yarn add template-file

# ...or install as development dependency:
# (use this command if you're using `template-file` to build your project)
yarn add --dev template-file

# ...*or* install globally to use anywhere:
yarn global add template-file

# If using npm, add to project:
npm install --save template-file

# ...or install as development dependency:
# (use this command if you're using `template-file` to build your project)
npm install --save-dev template-file

# ...*or* install globally to use anywhere:
npm install --global template-file
```

## License

MIT
