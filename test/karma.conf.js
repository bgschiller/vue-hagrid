// Karma configuration
module.exports = function karmaConfig(config) {
  config.set({
    // ... normal karma configuration
    files: [
      { pattern: '*.spec.js', watched: false },
    ],
    frameworks: ['mocha', 'chai', 'sinon'],
    reporters: ['spec'],
    preprocessors: {
      '*.spec.js': ['webpack', 'sourcemap'],
    },
    browsers: ['Chrome'],

    webpack: {
      // karma watches the test entry points
      // (you don't need to specify the entry option)
      // webpack watches dependencies

      // webpack configuration
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
          },
        ],
      },
      devtool: 'inline-source-map',
      resolve: {
        alias: {
          vue: 'vue/dist/vue.js',
        },
      },
    },

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only',
    },
    // coverageReporter: {
    //   dir: './coverage',
    //   reporters: [
    //     { type: 'lcov', subdir: '.' },
    //     { type: 'text-summary' },
    //   ],
    // },
  });
};
