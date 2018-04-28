import _ from 'underscore'
import {hasValue} from './utils'
import {defaultOptions} from './options';

// Formatting functions used for formatting error messages
var formatFunctions = {
  // Uses the configured label formatter to format the attribute name
  // to make it more readable for the user
  formatLabel: function(attrName, model) {
    return defaultLabelFormatters[defaultOptions.labelFormatter](attrName, model);
  },

  // Replaces numeric placeholders like {0} in a string with arguments
  // passed to the function
  format: function() {
    var args = Array.prototype.slice.call(arguments),
      text = args.shift();
    return text.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] !== 'undefined' ? args[number] : match;
    });
  }
};

// Label formatters
// ----------------

// Label formatters are used to convert the attribute name
// to a more human friendly label when using the built in
// error messages.
// Configure which one to use with a call to
//
//     Backbone.Validation.configure({
//       labelFormatter: 'label'
//     });
var defaultLabelFormatters = {

  // Returns the attribute name with applying any formatting
  none: function(attrName) {
    return attrName;
  },

  // Converts attributeName or attribute_name to Attribute name
  sentenceCase: function(attrName) {
    return attrName.replace(/(?:^\w|[A-Z]|\b\w)/g, function(match, index) {
      return index === 0 ? match.toUpperCase() : ' ' + match.toLowerCase();
    }).replace(/_/g, ' ');
  },

  // Looks for a label configured on the model and returns it
  //
  //      var Model = Backbone.Model.extend({
  //        validation: {
  //          someAttribute: {
  //            required: true
  //          }
  //        },
  //
  //        labels: {
  //          someAttribute: 'Custom label'
  //        }
  //      });
  label: function(attrName, model) {
    return (model.labels && model.labels[attrName]) || defaultLabelFormatters.sentenceCase(attrName, model);
  }
};



// Patterns
// --------

var defaultPatterns = {
  // Matches any digit(s) (i.e. 0-9)
  digits: /^\d+$/,

  // Matches any number (e.g. 100.000)
  number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d*)?$/,

  // Matches a valid email address (e.g. mail@example.com)
  email: /^((([a-z]|\d|[\[\]()!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[\[\]()!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,

  // Mathes any valid url (e.g. http://www.xample.com)
  url: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
};


// Error messages
// --------------

// Error message for the build in validators.
// {x} gets swapped out with arguments from the validator.
var defaultMessages = {
  required: '{0} is required',
  acceptance: '{0} must be accepted',
  min: '{0} must be greater than or equal to {1}',
  max: '{0} must be less than or equal to {1}',
  range: '{0} must be between {1} and {2}',
  length: '{0} must be {1} characters',
  minLength: '{0} must be at least {1} characters',
  maxLength: '{0} must be at most {1} characters',
  rangeLength: '{0} must be between {1} and {2} characters',
  oneOf: '{0} must be one of: {1}',
  equalTo: '{0} must be the same as {1}',
  digits: '{0} must only contain digits',
  number: '{0} must be a number',
  email: '{0} must be a valid email',
  url: '{0} must be a valid url',
  inlinePattern: '{0} is invalid'
};

// Built in validators
// -------------------

// Determines whether or not a value is a number
var isNumber = function(value){
  return _.isNumber(value) || (_.isString(value) && value.match(defaultPatterns.number));
};



var defaultValidators =  {
  // Function validator
  // Lets you implement a custom function used for validation
  fn: function(value, attr, fn, model, computed) {
    if(_.isString(fn)){
      fn = model[fn];
    }
    return fn.call(model, value, attr, computed);
  },

  // Required validator
  // Validates if the attribute is required or not
  // This can be specified as either a boolean value or a function that returns a boolean value
  required: function(value, attr, required, model, computed) {
    var isRequired = _.isFunction(required) ? required.call(model, value, attr, computed) : required;
    if(!isRequired && !hasValue(value)) {
      return false; // overrides all other validators
    }
    if (isRequired && !hasValue(value)) {
      return this.format(defaultMessages.required, this.formatLabel(attr, model));
    }
  },

  // Acceptance validator
  // Validates that something has to be accepted, e.g. terms of use
  // `true` or 'true' are valid
  acceptance: function(value, attr, accept, model) {
    if(value !== 'true' && (!_.isBoolean(value) || value === false)) {
      return this.format(defaultMessages.acceptance, this.formatLabel(attr, model));
    }
  },

  // Min validator
  // Validates that the value has to be a number and equal to or greater than
  // the min value specified
  min: function(value, attr, minValue, model) {
    if (!isNumber(value) || value < minValue) {
      return this.format(defaultMessages.min, this.formatLabel(attr, model), minValue);
    }
  },

  // Max validator
  // Validates that the value has to be a number and equal to or less than
  // the max value specified
  max: function(value, attr, maxValue, model) {
    if (!isNumber(value) || value > maxValue) {
      return this.format(defaultMessages.max, this.formatLabel(attr, model), maxValue);
    }
  },

  // Range validator
  // Validates that the value has to be a number and equal to or between
  // the two numbers specified
  range: function(value, attr, range, model) {
    if(!isNumber(value) || value < range[0] || value > range[1]) {
      return this.format(defaultMessages.range, this.formatLabel(attr, model), range[0], range[1]);
    }
  },

  // Length validator
  // Validates that the value has to be a string with length equal to
  // the length value specified
  length: function(value, attr, length, model) {
    if (!_.isString(value) || value.length !== length) {
      return this.format(defaultMessages.length, this.formatLabel(attr, model), length);
    }
  },

  // Min length validator
  // Validates that the value has to be a string with length equal to or greater than
  // the min length value specified
  minLength: function(value, attr, minLength, model) {
    if (!_.isString(value) || value.length < minLength) {
      return this.format(defaultMessages.minLength, this.formatLabel(attr, model), minLength);
    }
  },

  // Max length validator
  // Validates that the value has to be a string with length equal to or less than
  // the max length value specified
  maxLength: function(value, attr, maxLength, model) {
    if (!_.isString(value) || value.length > maxLength) {
      return this.format(defaultMessages.maxLength, this.formatLabel(attr, model), maxLength);
    }
  },

  // Range length validator
  // Validates that the value has to be a string and equal to or between
  // the two numbers specified
  rangeLength: function(value, attr, range, model) {
    if (!_.isString(value) || value.length < range[0] || value.length > range[1]) {
      return this.format(defaultMessages.rangeLength, this.formatLabel(attr, model), range[0], range[1]);
    }
  },

  // One of validator
  // Validates that the value has to be equal to one of the elements in
  // the specified array. Case sensitive matching
  oneOf: function(value, attr, values, model) {
    if(!_.include(values, value)){
      return this.format(defaultMessages.oneOf, this.formatLabel(attr, model), values.join(', '));
    }
  },

  // Equal to validator
  // Validates that the value has to be equal to the value of the attribute
  // with the name specified
  equalTo: function(value, attr, equalTo, model, computed) {
    if(value !== computed[equalTo]) {
      return this.format(defaultMessages.equalTo, this.formatLabel(attr, model), this.formatLabel(equalTo, model));
    }
  },

  // Pattern validator
  // Validates that the value has to match the pattern specified.
  // Can be a regular expression or the name of one of the built in patterns
  pattern: function(value, attr, pattern, model) {
    if (!hasValue(value) || !value.toString().match(defaultPatterns[pattern] || pattern)) {
      return this.format(defaultMessages[pattern] || defaultMessages.inlinePattern, this.formatLabel(attr, model), pattern);
    }
  }
};

// Set the correct context for all validators
// when used from within a method validator

var validatorContext = _.extend({}, formatFunctions, defaultValidators);
_.each(defaultValidators, function(validator, key){
  defaultValidators[key] = _.bind(validator, validatorContext);
});

export {defaultMessages, defaultPatterns, defaultValidators, defaultLabelFormatters, formatFunctions}