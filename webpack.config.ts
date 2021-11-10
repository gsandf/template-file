const path = require('path');

async function getBaseConfig(): Promise<import('webpack').Configuration> {
  const externalDependencies = ['@blakek/deep', 'glob', 'mkdirp'];

  const externals = externalDependencies.reduce((externals, packageName) => {
    return { ...externals, [packageName]: packageName };
  }, {});

  return {
    entry: {
      cli: './src/cli.ts',
      index: './src/index.ts'
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: `[name].js`,
      library: { type: 'commonjs' },
      clean: true
    },

    externals: externals,

    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.json', '.wasm']
    },

    target: 'node12'
  };
}

module.exports = getBaseConfig();
