# template-file

> 🔀 Replace {{ variables }} in all your files

Use variables to replace template strings in any type of file. This is both a runnable command-line application and JavaScript/TypeScript module.

**✨ Some helpful features:**

- If you use a JavaScript file as the `dataFile` argument, whatever object the JS exports is used for replacement.
- If the value of one of the keys is a function, the result of that function is used for replacement.
- Deeply-nested keys can be used for replacements.

## Usage

```shell
template-file <dataFile> <sourceGlob> <destination>
```

### Arguments

- **data** - Data file in JSON; used to replace variables in source files
- **sourceGlob** - Files to process; see [glob](https://npmjs.com/glob) for syntax
- **destination** - Destination directory where processed files go

**ℹ️ TIP:** Remember to place quotes around your arguments (if they contain asterisks, question marks, etc.) to keep your shell from expanding globs before `template-file` gets to consume them.

### Examples

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

## Templates

This uses templates similar to [mustache](https://mustache.github.io/) templates, but there are some differences.

Anything between `{{` and `}}` can be replaced with a value. Spacing doesn't matter.

```js
const template = '{{ location.name }} is {{adjective}}.';
const data = {
  location: { name: 'Nashville' },
  adjective: 'cool'
};

render(template, data); //» 'Nashville is cool.'
```

To render a list of items, you can use `{{#example}}` and `{{/example}}`. Empty lists and falsy values aren't rendered:

```js
const template = `
  <h3>Friend List:</h3>
  <ul>
    {{#friends}}
    <li>{{name}}</li>
    {{/friends}}
  </ul>
`;

const data = {
  friends: [{ name: 'Amanda' }, { name: 'Bryson' }, { name: 'Josh' }]
};

render(template, data);
// <h3>Friend List:</h3>
// <ul>
//   <li>Amanda</li>
//   <li>Bryson</li>
//   <li>Josh</li>
// </ul>
```

If you have an array of primitive values instead of objects, you can use `{{ this }}` to refer to the current value:

```js
const template = `
### Foods I Like

{{#foods}}
  - {{ this }}
{{/foods}}
`;

const data = {
  foods: ['steak', 'eggs', 'avocado']
};

render(template, data);
// ### Foods I Like
//
// - steak
// - eggs
// - avocado
```

If a replacement is a function, it is called with no arguments:

```js
const template = `Hello, {{name}}`;

const data = {
  name: () => 'Charles'
};

render(template, data); //» Hello, Charles
```

## API

In addition to the CLI, this module exports several helpers to programmatically render templates.

**Example:**

```js
import { render, renderFile } from 'template-file';

const data = {
  location: { name: 'Nashville' },
  adjective: 'cool'
};

// Replace variables in string
render('{{ location.name }} is {{ adjective }}.', data); //» 'Nashville is cool.'

// Replace variables in a file (same as above, but from a file)
const string = await renderFile('/path/to/file', data);
console.log(renderedString);
```

### `render`

**Type:**

```ts
function render(template: string, data: Data): string;
```

Replaces values from `data` and returns the rendered string.

```ts
import { render } from 'template-file';

const data = {
  location: { name: 'Nashville' },
  adjective: 'cool'
};

render('{{ location.name }} is {{ adjective }}.', data); //» 'Nashville is cool.'
```

### `renderFile`

**Type:**

```ts
function renderFile(filepath: string, data: Data): Promise<string>;
```

Reads a file replaces values from `data`, and returns the rendered string.

```ts
import { renderFile } from 'template-file';

// example.html:
// <h1>Welcome back, {{ sites.github.username }}!</h1>

const data = {
  name: 'Blake',
  sites: {
    github: {
      username: 'blakek'
    }
  }
};

renderFile('./example.html', data); //» '<h1>Welcome back, blakek!</h1>'
```

### `renderGlob`

**Type:** (note, this may change in a future major version release)

```ts
function renderGlob(
  sourceGlob: string,
  data: Data,
  onFileCallback: (filename: string, contents: string) => void
): Promise<void>;
```

Finds files matching a glob pattern, reads those files, replaces values from `data`, and calls a function for each file. Note, no string is returned from the function; values are handled through callbacks for each file.

```ts
import { renderGlob } from 'template-file';

// ./templates/profile.html:
// <h1>Welcome back, {{ name }}!</h1>

// ./templates/sign-in.html:
// <p>Currently signed in as <em>{{ sites.github.username }}<em>.</p>

const data = {
  name: 'Blake',
  sites: {
    github: {
      username: 'blakek'
    }
  }
};

const files = [];

renderGlob('./templates/*.html', data, (filename, contents) => {
  files.push({ filename, contents });
});

console.log(files);
// [
//   {
//     contents: '<h1>Welcome back, Blake!</h1>',
//     filename: './templates/profile.html'
//   },
//   {
//     contents: '<p>Currently signed in as <em>blakek<em>.</p>',
//     filename: './templates/sign-in.html'
//   }
// ]
```

### `renderToFolder`

**Type:**

```ts
function renderToFolder(
  sourceGlob: string,
  destination: string,
  data: Data
): Promise<void>;
```

```ts
import { renderToFolder } from 'template-file';

const data = {
  name: 'Blake',
  sites: {
    github: {
      username: 'blakek'
    }
  }
};

renderToFolder('./templates/*.html', './dist/', data);
```

Finds files matching a glob pattern, reads those files, replaces values from `data`, and writes a file with the same name to `destination`.

### Upgrading from older versions:

Version 5 renamed some functions to be simpler:

- `renderString` was renamed `render`
- `renderTemplateFile` was renamed `renderFile`
- `renderGlob` and `renderToFolder` were in v4 but were undocumented. The API for `renderGlob` may change in the future, depending on usage.

Versions < 4 could not lookup properties with a dot in the name. This should be possible since version 4. For example, this was not possible before v4.0.0:

```ts
import { render } from 'template-file';

const data = { 'with.dot': 'yep' };

render('Does this work? {{with.dot}}', data);
```

## Install

With either [Yarn](https://yarnpkg.com/) or [npm](https://npmjs.org/) installed, run **one** of the following:

| Task                                     | with Yarn                       | with npm                               |
| ---------------------------------------- | ------------------------------- | -------------------------------------- |
| Add this to a project                    | `yarn add template-file`        | `npm install --save template-file`     |
| Install this as a development dependency | `yarn add --dev template-file`  | `npm install --save-dev template-file` |
| Install this globally                    | `yarn global add template-file` | `npm install --global template-file`   |

## License

MIT
