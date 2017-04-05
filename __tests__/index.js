import fs from 'fs'
import path from 'path'
import test from 'ava'
import pify from 'pify'
import { renderString, renderTemplateFile } from '..'

const readFile = pify(fs.readFile)

test('Shallow data is replaced when given string', t => {
  // Should return the same without regard of consistent spacing
  const templateString = 'The {{ adjective1 }}, {{adjective2 }} {{ noun1}} jumped over the {{adjective3}} {{ noun2 }}.'
  const templateData = {
    adjective1: 'cool',
    adjective2: 'pizza-loving',
    adjective3: 'silly',
    noun1: 'developer',
    noun2: 'laptop'
  }

  const actual = renderString(templateString, templateData)
  const expected = 'The cool, pizza-loving developer jumped over the silly laptop.'

  t.is(actual, expected)
})

test('Shallow data is replaced when given file ', async t => {
  const inputFile = path.resolve('./__tests__/helpers/testme.conf')
  const expectedFile = path.resolve('./__tests__/helpers/expected.conf')

  const actual = await renderTemplateFile(inputFile, {
    aPath: '/this-is-a-test',
    domain: 'reallycooldomain.com'
  })

  const expected = await readFile(expectedFile, 'utf8')

  t.is(actual, expected)
})
