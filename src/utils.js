import _ from 'underscore'

// Flattens an object
// eg:
//
//     var o = {
//       owner: {
//         name: 'Backbone',
//         address: {
//           street: 'Street',
//           zip: 1234
//         }
//       }
//     };
//
// becomes:
//
//     var o = {
//       'owner': {
//         name: 'Backbone',
//         address: {
//           street: 'Street',
//           zip: 1234
//         }
//       },
//       'owner.name': 'Backbone',
//       'owner.address': {
//         street: 'Street',
//         zip: 1234
//       },
//       'owner.address.street': 'Street',
//       'owner.address.zip': 1234
//     };
// This may seem redundant, but it allows for maximum flexibility
// in validation rules.

var flatten = function (obj, into, prefix) {
  into = into || {};
  prefix = prefix || '';

  _.each(obj, function(val, key) {
    if(obj.hasOwnProperty(key)) {
      if (!!val && typeof val === 'object' && val.constructor === Object) {
        flatten(val, into, prefix + key + '.');
      }

      // Register the current level object as well
      into[prefix + key] = val;
    }
  });

  return into;
};

// Determines whether or not a value is empty
var hasValue = function(value) {
  return !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && trim(value) === '') || (_.isArray(value) && _.isEmpty(value)));
};

// Use native trim when defined
var trim = String.prototype.trim ?
  function(text) {
    return text.trim();
  } :
  function(text) {
    var trimLeft = /^\s+/,
      trimRight = /\s+$/;

    return text.toString().replace(trimLeft, '').replace(trimRight, '');
  };

export {flatten, hasValue}