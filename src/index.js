import Backbone from 'backbone';
import _ from 'underscore';
import {flatten} from './utils';
import {defaultOptions} from './options';
import {defaultMessages, defaultPatterns, defaultValidators, defaultLabelFormatters} from './validators';



// Helper functions
// ----------------

// Returns an object with undefined properties for all
// attributes on the model that has defined one or more
// validation rules.
var getValidatedAttrs = function(model, attrs) {
  attrs = attrs || _.keys(_.result(model, 'validation') || {});
  return _.reduce(attrs, function(memo, key) {
    memo[key] = void 0;
    return memo;
  }, {});
};


// Looks on the model for validations for a specified
// attribute. Returns an array of any validators defined,
// or an empty array if none is defined.
var getValidators = function(model, attr) {
  var attrValidationSet = model.validation ? _.result(model, 'validation')[attr] || {} : {};

  // Stick the validator object into an array
  if(!_.isArray(attrValidationSet)) {
    attrValidationSet = [attrValidationSet];
  }

  // Reduces the array of validators into a new array with objects
  // with a validation method to call, the value to validate against
  // and the specified error message, if any
  return _.reduce(attrValidationSet, function(memo, attrValidation) {

    // If the validator is a function or a string, wrap it in a function validator
    if (_.isFunction(attrValidation) || _.isString(attrValidation)) {
      attrValidation = {
        fn: attrValidation
      };
    }

    _.each(_.keys(attrValidation), function(validator) {
      if (validator === 'msg') return;
      memo.push({
        fn: defaultValidators[validator],
        val: attrValidation[validator],
        msg: attrValidation.msg
      });
    });
    return memo;
  }, []);
};

// Validates an attribute against all validators defined
// for that attribute. If one or more errors are found,
// the first error message is returned.
// If the attribute is valid, an empty string is returned.
var validateAttr = function(model, attr, value, computed) {
  // Reduces the array of validators to an error message by
  // applying all the validators and returning the first error
  // message, if any.
  return _.reduce(getValidators(model, attr), function(memo, validator){
    var result = validator.fn.call(defaultValidators, value, attr, validator.val, model, computed);

    if(result === false || memo === false) {
      return false;
    }
    if (result && !memo) {
      return _.result(validator, 'msg') || result;
    }
    return memo;
  }, '');
};

// Loops through the model's attributes and validates the specified attrs.
// Returns and object containing names of invalid attributes
// as well as error messages.
var validateModel = function(model, allAttrs, validatedAttrs) {
  var error,
      invalidAttrs = {},
      isValid = true;

  _.each(validatedAttrs, function(val, attr) {
    error = validateAttr(model, attr, val, allAttrs);
    if (error) {
      invalidAttrs[attr] = error;
      isValid = false;
    }
  });

  return {
    invalidAttrs: invalidAttrs,
    isValid: isValid
  };
};

// Contains the methods that are mixed in on the model when binding
var mixin = {
  // Check whether or not a value, or a hash of values
  // passes validation without updating the model
  preValidate: function(attr, value) {
    var self = this,
        result = {},
        error,
        allAttrs = _.extend({}, this.attributes);

    if(_.isObject(attr)){
      // if multiple attributes are passed at once we would like for the validation functions to
      // have access to the fresh values sent for all attributes, in the same way they do in the
      // regular validation
      _.extend(allAttrs, attr);

      _.each(attr, function(value, attrKey) {
        error = validateAttr(self, attrKey, value, allAttrs);
        if(error){
          result[attrKey] = error;
        }
      });

      return _.isEmpty(result) ? undefined : result;
    }
    else {
      return validateAttr(this, attr, value, allAttrs);
    }
  },

  // Check to see if an attribute, an array of attributes or the
  // entire model is valid. Passing true will force a validation
  // of the model.
  isValid: function(option) {
    var self = this, flattened, attrs, error, invalidAttrs;    

    if(_.isString(option)){
      attrs = [option];
    } else if(_.isArray(option)) {
      attrs = option;
    }
    if (attrs) {
      flattened = flatten(self.attributes);
      //Loop through all attributes and mark attributes invalid if appropriate
      _.each(attrs, function (attr) {
        error = validateAttr(self, attr, flattened[attr], _.extend({}, self.attributes));
        if (error) {
          invalidAttrs = invalidAttrs || {};
          invalidAttrs[attr] = error;
          defaultCallbacks.invalid(attr, error, self);
        } else {
          defaultCallbacks.valid(attr, self);
        }
      });
    }

    if(option === true) {
      invalidAttrs = this.validate();
    }
    if (invalidAttrs) {
      this.trigger('invalid', this, invalidAttrs, {validationError: invalidAttrs});
    }
    return attrs ? !invalidAttrs : this.validation ? this._isValid : true;
  },

  // This is called by Backbone when it needs to perform validation.
  // You can call it manually without any parameters to validate the
  // entire model.
  validate: function(attrs, setOptions){
    var model = this,
        validateAll = !attrs,
        opt = _.extend({}, defaultOptions, defaultCallbacks, setOptions),
        validatedAttrs = getValidatedAttrs(model, opt.attributes),
        allAttrs = _.extend({}, validatedAttrs, model.attributes, attrs),
        flattened = flatten(allAttrs),
        changedAttrs = attrs ? flatten(attrs) : flattened,
        result = validateModel(model, allAttrs, _.pick(flattened, _.keys(validatedAttrs)));

    model._isValid = result.isValid;

    // After validation is performed, loop through all validated and changed attributes
    // and call the valid and invalid callbacks so the view is updated.
    _.each(validatedAttrs, function(val, attr){
        var invalid = attr in result.invalidAttrs,
          changed = attr in changedAttrs;

        if(!invalid){
          opt.valid(attr, model);
        }
        if(invalid && (changed || validateAll)){
          opt.invalid(attr, result.invalidAttrs[attr], model);
        }
    });


    if (defaultOptions.setInvalidAttrs) model.invalidAttrs = result.invalidAttrs;

    // Trigger validated events.
    // Need to defer this so the model is actually updated before
    // the event is triggered.
    _.defer(function() {
      model.trigger('validated', model._isValid, model, result.invalidAttrs);
      model.trigger('validated:' + (model._isValid ? 'valid' : 'invalid'), model, result.invalidAttrs);
    });

    // Return any error messages to Backbone, unless the forceUpdate flag is set.
    // Then we do not return anything and fools Backbone to believe the validation was
    // a success. That way Backbone will update the model regardless.
    if (!opt.forceUpdate && _.intersection(_.keys(result.invalidAttrs), _.keys(changedAttrs)).length > 0) {
      return result.invalidAttrs;
    }
  }
};



// Public interface
var Validation =  {

  // Current version of the library
  version: '{{version}}',

  // Called to configure the default options
  configure: function(options) {
    _.extend(defaultOptions, options);
  },

  // Used to extend the Backbone.Model.prototype
  // with validation
  mixin: mixin
};

var defaultCallbacks = Validation.callbacks = {
  valid: function() {},
  invalid: function() {}
}

Validation.labelFormatters = defaultLabelFormatters;
Validation.messages = defaultMessages;
Validation.validators = defaultValidators;
Validation.patterns = defaultPatterns;

Backbone.Validation = Validation

export default Validation

