'use strict'

const fs = require('fs')
const rollup = require('rollup')
const minify = require('rollup-plugin-uglify')
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

const rollupOptions = {
  input: 'src/backbone-validation.js',
  external: Object.keys(dependencies)
}

const outputOptions = {
  format: 'umd',
  name: 'Backbone.Validation',
  banner,
  globals: {
    'backbone': 'Backbone',
    'underscore': '_'
  }
}

// Compile source code into a distributable format with Babel
promise = promise.then(() => rollup.rollup(rollupOptions)
  .then(bundle => bundle.write(Object.assign({}, outputOptions, {file: `dist/backbone.validation.js`}))))

if (!isDev) {
  promise = promise.then(() => rollup.rollup(Object.assign({}, rollupOptions, {plugins: [minify()]}))
    .then(bundle => bundle.write(Object.assign({}, outputOptions, {file: `dist/backbone.validation.min.js`}))))

  // Copy package.json and LICENSE.txt
  promise = promise.then(() => {
    fs.writeFileSync('dist/backbone-validation.esm.js', fs.readFileSync('src/backbone-validation.js', 'utf-8'), 'utf-8')
  })
}


promise.catch(err => console.error(err.stack)) // eslint-disable-line no-console
