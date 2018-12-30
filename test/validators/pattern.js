module.exports = {
    "pattern validator": {
        beforeEach: function () {
            var that = this;
            var Model = Backbone.Model.extend({
                validation: {
                    name: {
                        pattern: /^test/
                    },
                    email: {
                        pattern: 'email'
                    }
                }
            });

            this.model = new Model({
                name: 'test',
                email: 'test@example.com'
            });
            _.extend(this.model, Backbone.Validation.mixin);
        },

        "has default error message": function (done) {
            this.model.on('validated:invalid', function (model, error) {
                assert.equals({ email: 'Email must be a valid email' }, error);
                done();
            });
            this.model.set({ email: '' }, { validate: true });
        },

        "has default error message for inline pattern": function (done) {
            this.model.on('validated:invalid', function (model, error) {
                assert.equals({ name: 'Name is invalid' }, error);
                done();
            });
            this.model.set({ name: '' }, { validate: true });
        },

        "value not matching pattern is invalid": function () {
            refute(this.model.set({
                name: 'aaa'
            }, { validate: true }));
        },

        "value matching pattern is valid": function () {
            assert(this.model.set({
                name: 'test'
            }, { validate: true }));
        },

        "when required is not specified": {
            "undefined is invalid": function () {
                refute(this.model.set({
                    name: undefined
                }, { validate: true }));
            },

            "null is invalid": function () {
                refute(this.model.set({
                    name: null
                }, { validate: true }));
            }
        },

        "when required:false": {
            beforeEach: function () {
                this.model.validation.name.required = false;
            },

            "null is valid": function () {
                assert(this.model.set({
                    name: null
                }, { validate: true }));
            },

            "undefined is valid": function () {
                assert(this.model.set({
                    name: undefined
                }, { validate: true }));
            }
        },

        "when required:true": {
            beforeEach: function () {
                this.model.validation.name.required = true;
            },

            "undefined is invalid": function () {
                refute(this.model.set({
                    name: undefined
                }, { validate: true }));
            },

            "null is invalid": function () {
                refute(this.model.set({
                    name: null
                }, { validate: true }));
            }
        },

        "can use one of the built-in patterns by specifying the name of it": function () {
            refute(this.model.set({
                email: 'aaa'
            }, { validate: true }));

            assert(this.model.set({
                email: 'a@example.com'
            }, { validate: true }));
        }
    }
}