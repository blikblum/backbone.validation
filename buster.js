var config = exports;

config['Browser'] = {
  environment: 'browser',
  sources: [
    'lib/jquery-1.11.2.js',
    'lib/underscore-1.7.js',
    'lib/backbone-1.1.2.js',
    'dist/backbone-validation.js'
  ],
  tests: [
    'tests/*.js',
    'tests/validators/*.js'
  ],
  testHelpers: ['tests/helper.js']
};

config['Node'] = {
  environment: 'node',
  tests: [
    'tests/node/*.js'
  ]
};