module.exports = {
    "length validator": {
        beforeEach: function () {
            var that = this;
            var Model = Backbone.Model.extend({
                validation: {
                    postalCode: {
                        length: 2
                    }
                }
            });

            this.model = new Model();
            this.view = new Backbone.View({
                model: this.model
            });

            Backbone.Validation.bind(this.view, {
                valid: sinon.spy(),
                invalid: sinon.spy()
            });
        },

        "has default error message for string": function (done) {
            this.model.on('validated:invalid', function (model, error) {
                assert.equals({ postalCode: 'Postal code must be 2 characters' }, error);
                done();
            });
            this.model.set({ postalCode: '' }, { validate: true });
        },

        "string with length shorter than length is invalid": function () {
            refute(this.model.set({
                postalCode: 'a'
            }, { validate: true }));
        },

        "string with length longer than length is invalid": function () {
            refute(this.model.set({
                postalCode: 'aaa'
            }, { validate: true }));
        },

        "string with length equal to length is valid": function () {
            assert(this.model.set({
                postalCode: 'aa'
            }, { validate: true }));
        },

        "spaces are treated as part of the string (no trimming)": function () {
            refute(this.model.set({
                postalCode: 'aa  '
            }, { validate: true }));
        },

        "non strings are treated as an error": function () {
            refute(this.model.set({
                postalCode: 123
            }, { validate: true }));
        },

        "when required is not specified": {
            "undefined is invalid": function () {
                refute(this.model.set({
                    postalCode: undefined
                }, { validate: true }));
            },

            "null is invalid": function () {
                refute(this.model.set({
                    postalCode: null
                }, { validate: true }));
            }
        },

        "when required:false": {
            beforeEach: function () {
                this.model.validation.postalCode.required = false;
            },

            "null is valid": function () {
                assert(this.model.set({
                    postalCode: null
                }, { validate: true }));
            },

            "undefined is valid": function () {
                assert(this.model.set({
                    postalCode: undefined
                }, { validate: true }));
            }
        },

        "when required:true": {
            beforeEach: function () {
                this.model.validation.postalCode.required = true;
            },

            "undefined is invalid": function () {
                refute(this.model.set({
                    postalCode: undefined
                }, { validate: true }));
            },

            "null is invalid": function () {
                refute(this.model.set({
                    postalCode: null
                }, { validate: true }));
            }
        }
    }
}