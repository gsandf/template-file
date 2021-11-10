import test from 'ava';
import { promises as fs } from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import { render, renderFile, renderGlob, renderToFolder } from '..';

test('Data is replaced when given string', t => {
  // Should return the same without regard of consistent spacing
  const templateString =
    'The {{ adjective1 }}, {{adjective2 }} {{ person.title}} jumped over the {{adjective3}} {{   noun\t}}.';
  const templateData = {
    adjective1: 'cool',
    adjective2: 'pizza-loving',
    adjective3: 'silly',
    noun: () => 'laptop',
    person: {
      title: 'developer'
    }
  };

  const actual = render(templateString, templateData);
  const expected =
    'The cool, pizza-loving developer jumped over the silly laptop.';

  t.is(actual, expected);
});

test('Data is replaced when given file path', async t => {
  const inputFile = path.resolve('./__tests__/helpers/testme.conf');
  const expectedFile = path.resolve('./__tests__/helpers/expected.conf');

  const mimeTypes = [
    'application/atom+xml',
    'application/javascript',
    'application/json',
    'application/msword',
    'application/pdf',
    'application/postscript',
    'application/rtf',
    'application/vnd.ms-excel',
    'application/vnd.ms-fontobject',
    'application/vnd.ms-powerpoint',
    'application/vnd.wap.wml',
    'application/x-font-opentype',
    'application/x-font-ttf',
    'application/x-javascript',
    'application/xhtml+xml',
    'application/xml',
    'image/bmp',
    'image/svg+xml',
    'image/x-icon',
    'text/css',
    'text/javascript',
    'text/plain',
    'text/x-component',
    'text/xml'
  ];

  const actual = await renderFile(inputFile, {
    aPath: '/this-is-a-test',
    domain: 'reallycooldomain.com',
    gzip: {
      mimeTypes: () => mimeTypes.join(' ')
    }
  });

  const expected = await fs.readFile(expectedFile, { encoding: 'utf-8' });

  t.is(actual, expected);
});

test('Renders from a glob', async t => {
  const actualFiles: { name: string; contents: string }[] = [];
  const expectedFiles = [
    {
      name: './__tests__/helpers/templates/also-cool.json',
      contents: '{ "fullName": "Bob" }\n'
    },
    {
      name: './__tests__/helpers/templates/cool.md',
      contents: '# Hello, Bob!\n'
    }
  ];

  await renderGlob(
    './__tests__/helpers/templates/**/*.!(txt)',
    { name: 'Bob' },
    (name, contents) => {
      actualFiles.push({ name, contents });
    }
  );

  t.is(actualFiles.length, 2);

  if (actualFiles[0].name === expectedFiles[0].name) {
    t.deepEqual(actualFiles, expectedFiles);
  } else {
    t.deepEqual(actualFiles.reverse(), expectedFiles);
  }
});

test('Can render output to a file', async t => {
  const expectedFiles = [
    {
      name: './__tests__/helpers/output/also-cool.json',
      contents: '{ "fullName": "Kai" }\n'
    },
    {
      name: './__tests__/helpers/output/cool.md',
      contents: '# Hello, Kai!\n'
    }
  ];

  await renderToFolder(
    './__tests__/helpers/templates/**/*.!(txt)',
    './__tests__/helpers/output',
    { name: 'Kai' }
  );

  for (const { name, contents } of expectedFiles) {
    const actualContents = await fs.readFile(name, { encoding: 'utf-8' });
    t.is(actualContents, contents);
  }
});

test.skip('Can render a ton of files', async t => {
  const expectedFiles = [] as { name: string; contents: string }[];

  // Pre-test setup
  const templateFolder = './__tests__/helpers/large/';
  const outputFolder = `${templateFolder}/output`;
  const template = 'Hello, {{ name }}';

  await mkdirp(templateFolder);
  await Promise.all(
    Array.from({ length: 50000 }, (_, i) => {
      const basename = `${i}.template`;

      expectedFiles.push({
        name: `${outputFolder}/${basename}`,
        contents: 'Hello, Test'
      });

      return () => fs.writeFile(`${templateFolder}/${basename}`, template);
    })
  );

  await renderToFolder(`${templateFolder}/*.template`, outputFolder, {
    name: 'Test'
  });

  for (const { name, contents } of expectedFiles) {
    const actualContents = await fs.readFile(name, { encoding: 'utf-8' });
    t.is(actualContents, contents);
  }
});

test('renders lists of objects', t => {
  const template = `
<ul>
  {{#people}}
  <li>{{name}}</li>
  {{/people}}
</ul>`;

  t.is(
    render(template, {
      people: [{ name: 'Blake' }, { name: 'Dash' }]
    }),
    `
<ul>
  <li>Blake</li>
  <li>Dash</li>
</ul>`
  );

  t.is(render(template, { people: [] }), '\n<ul>\n\n</ul>');
});

test('renders array', t => {
  const template = `
<ul>
  {{#people}}
  <li>{{ this }}</li>
  {{/people}}
</ul>`;

  t.is(
    render(template, {
      people: ['Blake', 'Dash']
    }),
    `
<ul>
  <li>Blake</li>
  <li>Dash</li>
</ul>`
  );
});
