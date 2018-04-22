(function (global, factory) {
  if (typeof exports === 'object') {
    module.exports = factory(require('backbone'), require('underscore'));
  } else if (typeof define === 'function' && define.amd) {
    define(['backbone', 'underscore'], factory);
  } else {
    factory(global.Backbone, global._);
  }
}(this, function (Backbone, _) {
  //= backbone-validation.js
  return Backbone.Validation;
}));
