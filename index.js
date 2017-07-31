const pify = require('pify')
const readFile = pify(require('fs').readFile)
const valueForProperty = require('dot-prop').get

function renderString(template, data) {
  return template.replace(/\{\{\s?(.*?)\s?\}\}/g, (match, captured) => {
    const replacement = valueForProperty(data, captured.trim())

    // If a template variable is found but nothing is supplied to fill it, remove it
    if (replacement == null) {
      return ''
    }

    // If the replacement is a function, replace the variable with the result of the function
    if (typeof replacement === 'function') {
      return replacement()
    }

    return replacement
  })
}

function renderTemplateFile(filepath, data) {
  return readFile(filepath, 'utf8')
    .then(templateString => renderString(templateString, data))
}

module.exports = {
  renderString,
  renderTemplateFile
}
