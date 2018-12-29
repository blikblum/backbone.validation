var assert = require('chai').assert;

global._ = require('underscore');
global.Backbone = require('backbone');
require('../dist/backbone.validation');
global.sinon = require('sinon');

global.assert = assert;

assert.defined = assert.isDefined;
assert.equals = assert.deepEqual;
assert.contains = assert.include;
assert.same = assert.strictEqual;
assert.exception = assert.throws;
assert.called = sinon.assert.called;
assert.calledWith = sinon.assert.calledWith;

global.refute = assert.isNotOk;
refute.contains = assert.notInclude;
refute.defined = assert.isUndefined;
refute.same = assert.notStrictEqual;
refute.exception = assert.doesNotThrow;
refute.calledWith = sinon.assert.neverCalledWith;

// dummy Validation.bind
Backbone.Validation.bind = function(view, options) {
  const model = view.model;
  _.extend(model, Backbone.Validation.mixin)
  model.validate = function(attrs, setOptions) {
    return Backbone.Validation.mixin.validate.call(this, attrs, _.extend({}, Backbone.Validation.callbacks, options, setOptions))
  }
}

var jsdom;

before(function() {
  jsdom = require('jsdom-global')()
  Backbone.$ = $ = require('jquery')(window)
})

after(function() {
  jsdom()
})
