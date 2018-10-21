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

// Returns an array with attributes passed through options
var getOptionsAttrs = function(options, view) {
  var attrs = options.attributes;
  if (_.isFunction(attrs)) {
    attrs = attrs(view);
  } else if (_.isString(attrs) && (_.isFunction(defaultAttributeLoaders[attrs]))) {
    attrs = defaultAttributeLoaders[attrs](view);
  }
  if (_.isArray(attrs)) {
    return attrs;
  }
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
var mixin = function(view, options) {
  return {

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

      option = option || getOptionsAttrs(options, view);

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
          }
          //trigger valid/invalid events for each associated view
          _.each(self.associatedViews, function(view) {
            if (error) {
              options.invalid(view, attr, error, options.selector, self);
            } else {
              options.valid(view, attr, options.selector, self);
            }
          });
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
          opt = _.extend({}, options, setOptions),
          validatedAttrs = getValidatedAttrs(model, getOptionsAttrs(opt, view)),
          allAttrs = _.extend({}, validatedAttrs, model.attributes, attrs),
          flattened = flatten(allAttrs),
          changedAttrs = attrs ? flatten(attrs) : flattened,
          result = validateModel(model, allAttrs, _.pick(flattened, _.keys(validatedAttrs)));

      model._isValid = result.isValid;

      //After validation is performed, loop through all associated views
      _.each(model.associatedViews, function(view){

        // After validation is performed, loop through all validated and changed attributes
        // and call the valid and invalid callbacks so the view is updated.
        _.each(validatedAttrs, function(val, attr){
            var invalid = result.invalidAttrs.hasOwnProperty(attr),
              changed = changedAttrs.hasOwnProperty(attr);

            if(!invalid){
              opt.valid(view, attr, opt.selector, model);
            }
            if(invalid && (changed || validateAll)){
              opt.invalid(view, attr, result.invalidAttrs[attr], opt.selector, model);
            }
        });
      });

      if (options.setInvalidAttrs) model.invalidAttrs = result.invalidAttrs;

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
};

// Helper to mix in validation on a model. Stores the view in the associated views array.
var bindModel = function(view, model, options) {
  if (model.associatedViews) {
    model.associatedViews.push(view);
  } else {
    model.associatedViews = [view];
  }
  _.extend(model, mixin(view, options));
};

// Removes view from associated views of the model or the methods
// added to a model if no view or single view provided
var unbindModel = function(model, view) {
  if (view && model.associatedViews && model.associatedViews.length > 1){
    model.associatedViews = _.without(model.associatedViews, view);
  } else {
    delete model.validate;
    delete model.preValidate;
    delete model.isValid;
    delete model.associatedViews;
  }
};

// Mix in validation on a model whenever a model is
// added to a collection
var collectionAdd = function(model) {
  bindModel(this.view, model, this.options);
};

// Remove validation from a model whenever a model is
// removed from a collection
var collectionRemove = function(model) {
  unbindModel(model);
};

// Public interface
var Validation =  {

  // Current version of the library
  version: '{{version}}',

  // Called to configure the default options
  configure: function(options) {
    _.extend(defaultOptions, options);
  },

  // Hooks up validation on a view with a model
  // or collection
  bind: function(view, options) {
    options = _.extend({}, defaultOptions, defaultCallbacks, options);

    var model = options.model || view.model,
        collection = options.collection || view.collection;

    if(typeof model === 'undefined' && typeof collection === 'undefined'){
      throw 'Before you execute the binding your view must have a model or a collection.\n' +
            'See http://thedersen.com/projects/backbone-validation/#using-form-model-validation for more information.';
    }

    if(model) {
      bindModel(view, model, options);
    }
    else if(collection) {
      collection.each(function(model){
        bindModel(view, model, options);
      });
      collection.bind('add', collectionAdd, {view: view, options: options});
      collection.bind('remove', collectionRemove);
    }
  },

  // Removes validation from a view with a model
  // or collection
  unbind: function(view, options) {
    options = _.extend({}, options);
    var model = options.model || view.model,
        collection = options.collection || view.collection;

    if(model) {
      unbindModel(model, view);
    }
    else if(collection) {
      collection.each(function(model){
        unbindModel(model, view);
      });
      collection.unbind('add', collectionAdd);
      collection.unbind('remove', collectionRemove);
    }
  },

  // Used to extend the Backbone.Model.prototype
  // with validation
  mixin: mixin(null, defaultOptions)
};



// Callbacks
// ---------

var defaultCallbacks = Validation.callbacks = {

  // Gets called when a previously invalid field in the
  // view becomes valid. Removes any error message.
  // Should be overridden with custom functionality.
  valid: function(view, attr, selector) {
    view.$('[' + selector + '~="' + attr + '"]')
        .removeClass('invalid')
        .removeAttr('data-error');
  },

  // Gets called when a field in the view becomes invalid.
  // Adds a error message.
  // Should be overridden with custom functionality.
  invalid: function(view, attr, error, selector) {
    view.$('[' + selector + '~="' + attr + '"]')
        .addClass('invalid')
        .attr('data-error', error);
  }
};

// AttributeLoaders

var defaultAttributeLoaders = Validation.attributeLoaders = {
  inputNames: function (view) {
    var attrs = [];
    if (view) {
      view.$('form [name]').each(function () {
        if (/^(?:input|select|textarea)$/i.test(this.nodeName) && this.name &&
          this.type !== 'submit' && attrs.indexOf(this.name) === -1) {
          attrs.push(this.name);
        }
      });
    }
    return attrs;
  }
};

Validation.labelFormatters = defaultLabelFormatters;
Validation.messages = defaultMessages;
Validation.validators = defaultValidators;
Validation.patterns = defaultPatterns;

Backbone.Validation = Validation

export default Validation

