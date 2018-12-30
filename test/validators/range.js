module.exports = {
    "range validator": {
        beforeEach: function () {
            var that = this;
            var Model = Backbone.Model.extend({
                validation: {
                    age: {
                        range: [1, 10]
                    }
                }
            });

            this.model = new Model();
            _.extend(this.model, Backbone.Validation.mixin);
        },

        "has default error message": function (done) {
            this.model.on('validated:invalid', function (model, error) {
                assert.equals({ age: 'Age must be between 1 and 10' }, error);
                done();
            });
            this.model.set({ age: 0 }, { validate: true });
        },

        "number lower than first value is invalid": function () {
            refute(this.model.set({
                age: 0
            }, { validate: true }));
        },

        "number equal to first value is valid": function () {
            assert(this.model.set({
                age: 1
            }, { validate: true }));
        },

        "number higher than last value is invalid": function () {
            refute(this.model.set({
                age: 11
            }, { validate: true }));
        },

        "number equal to last value is valid": function () {
            assert(this.model.set({
                age: 10
            }, { validate: true }));
        },

        "number in range is valid": function () {
            assert(this.model.set({
                age: 5
            }, { validate: true }));
        },

        "when required is not specified": {
            "undefined is invalid": function () {
                refute(this.model.set({
                    age: undefined
                }, { validate: true }));
            },

            "null is invalid": function () {
                refute(this.model.set({
                    age: null
                }, { validate: true }));
            }
        },

        "when required:false": {
            beforeEach: function () {
                this.model.validation.age.required = false;
            },

            "null is valid": function () {
                assert(this.model.set({
                    age: null
                }, { validate: true }));
            },

            "undefined is valid": function () {
                assert(this.model.set({
                    age: undefined
                }, { validate: true }));
            }
        },

        "when required:true": {
            beforeEach: function () {
                this.model.validation.age.required = true;
            },

            "undefined is invalid": function () {
                refute(this.model.set({
                    age: undefined
                }, { validate: true }));
            },

            "null is invalid": function () {
                refute(this.model.set({
                    age: null
                }, { validate: true }));
            }
        }
    }
}