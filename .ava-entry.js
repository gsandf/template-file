const path = require('path');

require('ts-node').register({
  project: path.resolve('./tsconfig.ava.json'),
  transpileOnly: true
});
