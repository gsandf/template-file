module.exports = {
  extends: 'standard',
  env: {
    es6: true,
    node: true
  },
  rules: {
    eqeqeq: ['warn', 'always', { null: 'ignore' }],
    'no-var': ['error'],
    'prefer-const': ['error'],
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      asyncArrow: 'always',
      named: 'never'
    }]
  }
}
