const pify = require('pify')
const readFile = pify(require('fs').readFile)

function renderString(template, data) {
  return template.replace(/\{\{\s?(.*?)\s?\}\}/g, (match, captured) => {
    const replacement = data[captured.trim()]

    // If a template variable is found but nothing is supplied to fill it, remove it
    if (replacement == null) {
      return ''
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
