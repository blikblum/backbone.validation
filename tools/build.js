'use strict'

const rollup = require('rollup')
const minify = require('rollup-plugin-uglify')
const replaceVersion = require('./replace-version')
const pkg = require('../package.json')

const isDev = process.argv.indexOf('--development') !== -1

let promise = Promise.resolve()

let dependencies = Object.assign({}, pkg.dependencies || {}, pkg.peerDependencies || {})

const banner = `// ${pkg.title} v${pkg.version} 
//
// Copyright (c) 2011-${(new Date()).getFullYear()} ${pkg.author.name}
// Distributed under MIT License
//
// Documentation and full license available at:
// ${pkg.homepage}
`

function getRollupOptions(plugins = []) {
  return {
    input: 'src/backbone-validation.js',
    external: Object.keys(dependencies),
    plugins
  }
}

function getOutputOptions(format, filename = 'backbone.validation.js') {
  return {
    format: format,
    file: `dist/${filename}`,
    name: 'Backbone.Validation',
    banner,
    globals: {
      'backbone': 'Backbone',
      'underscore': '_'
    },
    sourcemap: !isDev
  }
}

const plugins = isDev ? [] : [replaceVersion({version: pkg.version})]

// Compile source code into a distributable format with Babel
promise = promise.then(() => rollup.rollup(getRollupOptions(plugins))
  .then(bundle => bundle.write(getOutputOptions('umd'))))

if (!isDev) {
  promise = promise.then(() => rollup.rollup(getRollupOptions([...plugins, minify()]))
    .then(bundle => bundle.write(getOutputOptions('umd', 'backbone.validation.min.js'))))

  promise = promise.then(() => rollup.rollup(getRollupOptions(plugins))
    .then(bundle => bundle.write(getOutputOptions('es', 'backbone.validation.esm.js'))))
}


promise.catch(err => console.error(err.stack)) // eslint-disable-line no-console
