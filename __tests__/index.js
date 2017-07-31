import fs from 'fs'
import path from 'path'
import test from 'ava'
import pify from 'pify'
import { renderString, renderTemplateFile } from '..'

const readFile = pify(fs.readFile)

test('Data is replaced when given string', t => {
  // Should return the same without regard of consistent spacing
  const templateString =
    'The {{ adjective1 }}, {{adjective2 }} {{ person.title}} jumped over the {{adjective3}} {{ noun }}.'
  const templateData = {
    adjective1: 'cool',
    adjective2: 'pizza-loving',
    adjective3: 'silly',
    noun: () => 'laptop',
    person: {
      title: 'developer'
    }
  }

  const actual = renderString(templateString, templateData)
  const expected = 'The cool, pizza-loving developer jumped over the silly laptop.'

  t.is(actual, expected)
})

test('Data is replaced when given file path', async t => {
  const inputFile = path.resolve('./__tests__/helpers/testme.conf')
  const expectedFile = path.resolve('./__tests__/helpers/expected.conf')

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
  ]

  const actual = await renderTemplateFile(inputFile, {
    aPath: '/this-is-a-test',
    domain: 'reallycooldomain.com',
    gzip: {
      mimeTypes: () => mimeTypes.join(' ')
    }
  })

  const expected = await readFile(expectedFile, 'utf8')

  t.is(actual, expected)
})
